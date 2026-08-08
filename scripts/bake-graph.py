"""Bake a force-directed layout of the graphify graph into a small JSON payload.

Run offline after `graphify update .`, then commit data/codebase-graph.json:

    "$(cat graphify-out/.graphify_python)" scripts/bake-graph.py

The site ships coordinates, not a physics engine. The repo graph has ~16
disconnected components, and a plain spring_layout flings them to the corners —
so each component is laid out on its own and the components are then packed
into a disc, which is what makes it read as one network instead of islands.
"""
import json
import math
from pathlib import Path

import networkx as nx

W, H, PAD = 1000.0, 700.0, 24.0
GAP = 1.6  # breathing room between packed components

src = json.loads(Path("graphify-out/graph.json").read_text())
G = nx.Graph()
for n in src["nodes"]:
    G.add_node(n["id"], community=n.get("community", 0), label=n.get("label", n["id"]))
for l in src["links"]:
    if l["source"] in G and l["target"] in G:
        G.add_edge(l["source"], l["target"])

comps = sorted(nx.connected_components(G), key=len, reverse=True)

placed = []  # (cx, cy, r)


def fits(cx, cy, r):
    return all(
        math.hypot(cx - px, cy - py) >= r + pr + GAP for px, py, pr in placed
    )


def place(r):
    """Greedy spiral packing — first free spot working outward from the centre."""
    if not placed:
        return 0.0, 0.0
    step = max(r * 0.35, 1.0)
    radius = step
    while radius < 400:
        steps = max(12, int(2 * math.pi * radius / step))
        for i in range(steps):
            a = 2 * math.pi * i / steps
            cx, cy = radius * math.cos(a), radius * math.sin(a)
            if fits(cx, cy, r):
                return cx, cy
        radius += step
    return radius, 0.0


pos = {}
for comp in comps:
    sub = G.subgraph(comp)
    n = sub.number_of_nodes()
    # Constant-density discs: area grows with node count.
    r = max(math.sqrt(n) * 3.2, 2.4)

    if n == 1:
        local = {next(iter(comp)): (0.0, 0.0)}
    else:
        local = nx.spring_layout(sub, k=1.6 / math.sqrt(n), iterations=500, seed=7)
        # Normalise this component into a unit disc.
        mx = max(math.hypot(*p) for p in local.values()) or 1.0
        local = {k: (p[0] / mx, p[1] / mx) for k, p in local.items()}

    cx, cy = place(r)
    placed.append((cx, cy, r))
    for k, (x, y) in local.items():
        pos[k] = (cx + x * r, cy + y * r)

xs = [p[0] for p in pos.values()]
ys = [p[1] for p in pos.values()]
minx, maxx, miny, maxy = min(xs), max(xs), min(ys), max(ys)
# One uniform scale for both axes so the packing stays circular, not stretched.
scale = min((W - 2 * PAD) / (maxx - minx), (H - 2 * PAD) / (maxy - miny))
offx = (W - (maxx - minx) * scale) / 2
offy = (H - (maxy - miny) * scale) / 2

# --- 3D pass: same per-component layout, packed into a ball ---------------
# The WebGL view rotates, so components are spread over a Fibonacci sphere
# instead of a disc; without this they stack into one blob from every angle.
GOLDEN = math.pi * (3 - math.sqrt(5))
pos3 = {}
shell = 0.0
for ci, comp in enumerate(comps):
    sub = G.subgraph(comp)
    n = sub.number_of_nodes()
    r = max(n ** (1 / 3) * 0.30, 0.10)

    if n == 1:
        local3 = {next(iter(comp)): (0.0, 0.0, 0.0)}
    else:
        local3 = nx.spring_layout(sub, dim=3, k=1.6 / math.sqrt(n), iterations=400, seed=7)
        m = max(math.sqrt(p[0] ** 2 + p[1] ** 2 + p[2] ** 2) for p in local3.values()) or 1.0
        local3 = {k: (p[0] / m, p[1] / m, p[2] / m) for k, p in local3.items()}

    if ci == 0:
        cx3 = cy3 = cz3 = 0.0
    else:
        # Golden-angle spiral over a sphere, radius growing with each component.
        i = ci - 1
        total = max(len(comps) - 1, 1)
        y = 1 - (i / total) * 2
        rad = math.sqrt(max(1 - y * y, 0))
        th = GOLDEN * i
        shell = 0.85 + 0.55 * (i / total)
        cx3, cy3, cz3 = math.cos(th) * rad * shell, y * shell, math.sin(th) * rad * shell

    for k, (x, y3, z) in local3.items():
        pos3[k] = (cx3 + x * r, cy3 + y3 * r, cz3 + z * r)

m3 = max(math.sqrt(p[0] ** 2 + p[1] ** 2 + p[2] ** 2) for p in pos3.values()) or 1.0

ids = list(G.nodes())
idx = {n: i for i, n in enumerate(ids)}
deg = dict(G.degree())

nodes = [
    {
        "l": G.nodes[n]["label"],
        "x": round(offx + (pos[n][0] - minx) * scale, 1),
        "y": round(offy + (pos[n][1] - miny) * scale, 1),
        # Unit-ball coordinates for the WebGL view.
        "p": [round(pos3[n][0] / m3, 3), round(pos3[n][1] / m3, 3), round(pos3[n][2] / m3, 3)],
        "c": G.nodes[n]["community"],
        "d": deg[n],
    }
    for n in ids
]
links = [[idx[a], idx[b]] for a, b in G.edges()]

out = {
    "w": W,
    "h": H,
    "commit": (src.get("built_at_commit") or "")[:7],
    "nodes": nodes,
    "links": links,
}
Path("data/codebase-graph.json").write_text(json.dumps(out, separators=(",", ":")))
print(f"{len(nodes)} nodes, {len(links)} links, {len(comps)} components")
print("bytes:", Path("data/codebase-graph.json").stat().st_size)

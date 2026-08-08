import Link from "next/link";
import graph from "@/data/codebase-graph.json";

// The knowledge graph of this repo, built by graphify (Graphify-Labs) and
// baked to fixed coordinates offline — the page ships positions, not a physics
// engine. No client JS: hover tooltips are native SVG <title>.
// ponytail: re-bake with scripts/bake-graph.py after big refactors; it is a
// snapshot, not a live view.
const COLORS = [
  "#ff6b6b", "#ffa94d", "#ffd43b", "#a9e34b", "#38d9a9",
  "#4dabf7", "#748ffc", "#da77f2", "#f783ac", "#c0c8d4",
];

const communities = new Set(graph.nodes.map((n) => n.c)).size;

export default function CodebaseGraph() {
  return (
    <section id="graph" className="section">
      <div className="container-wide">
        <header className="sec-head" data-reveal>
          <div>
            <p className="sec-idx caption">[03] — CODEBASE GRAPH</p>
            <h2 className="sec-title">THIS SITE, AS A GRAPH_</h2>
          </div>
          <p className="sec-note caption">
            {graph.nodes.length} NODES · {graph.links.length} EDGES · {communities} COMMUNITIES
          </p>
        </header>

        <figure className="graph-figure glass" data-reveal>
          <svg
            className="graph-svg"
            viewBox={`0 0 ${graph.w} ${graph.h}`}
            role="img"
            aria-label={`Knowledge graph of this codebase: ${graph.nodes.length} nodes and ${graph.links.length} edges across ${communities} communities.`}
          >
            <g className="graph-edges">
              {graph.links.map(([a, b], i) => (
                <line
                  key={i}
                  x1={graph.nodes[a].x}
                  y1={graph.nodes[a].y}
                  x2={graph.nodes[b].x}
                  y2={graph.nodes[b].y}
                  stroke={COLORS[graph.nodes[a].c % COLORS.length]}
                />
              ))}
            </g>
            <g className="graph-nodes">
              {graph.nodes.map((n, i) => (
                <circle
                  key={i}
                  cx={n.x}
                  cy={n.y}
                  r={Math.min(3 + n.d * 0.42, 8)}
                  fill={COLORS[n.c % COLORS.length]}
                >
                  <title>{`${n.l} — ${n.d} connection${n.d === 1 ? "" : "s"}`}</title>
                </circle>
              ))}
            </g>
          </svg>

          <figcaption className="graph-cap caption">
            {"// every file, function and import in this repo · hover a node to name it"}
          </figcaption>
        </figure>

        <p className="graph-note" data-reveal>
          Built with{" "}
          <a href="https://github.com/Graphify-Labs/graphify" target="_blank" rel="noreferrer">
            graphify
          </a>{" "}
          by Graphify-Labs — deterministic AST parsing, every edge traceable to a
          file and line, zero tokens spent.{" "}
          <Link href="/blog/codebase-knowledge-graph-without-embeddings">
            I wrote about what it found →
          </Link>
        </p>
      </div>
    </section>
  );
}

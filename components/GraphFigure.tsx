"use client";

import dynamic from "next/dynamic";
import graph from "@/data/codebase-graph.json";
import { colorFor } from "@/lib/graphColors";
import { useHeavyFx } from "@/lib/useHeavyFx";

// Three.js only ships to devices that can afford it; everyone else keeps the
// server-rendered SVG, which is also what search engines and no-JS visitors see.
const GraphCanvas = dynamic(() => import("@/components/GraphCanvas"), { ssr: false });

const communities = new Set(graph.nodes.map((n) => n.c)).size;

export default function GraphFigure() {
  const heavyFx = useHeavyFx();

  return (
    <figure className={`graph-figure glass${heavyFx ? " is-3d" : ""}`} data-reveal>
      <div className="graph-badge caption">
        <strong>CODEBASE KNOWLEDGE GRAPH</strong>
        <span>
          {graph.nodes.length} nodes · {graph.links.length} edges · {communities} communities
        </span>
      </div>

      {heavyFx ? (
        <GraphCanvas />
      ) : (
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
                stroke={colorFor(graph.nodes[a].c)}
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
                fill={colorFor(n.c)}
              >
                <title>{`${n.l} — ${n.d} connection${n.d === 1 ? "" : "s"}`}</title>
              </circle>
            ))}
          </g>
        </svg>
      )}

      <figcaption className="graph-cap caption">
        {heavyFx
          ? "// every file, function and import in this repo · hover a node to name it"
          : "// every file, function and import in this repo · tap a node to name it"}
      </figcaption>
    </figure>
  );
}

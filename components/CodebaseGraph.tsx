import Link from "next/link";
import GraphFigure from "@/components/GraphFigure";

// The knowledge graph of this repo, built by graphify (Graphify-Labs).
// ponytail: coordinates are baked by scripts/bake-graph.py — a snapshot, not a
// live view. Re-run it after `graphify update .` when the structure moves.
export default function CodebaseGraph() {
  return (
    <section id="graph" className="section">
      <div className="container-wide">
        <header className="sec-head" data-reveal>
          <div>
            <p className="sec-idx caption">[03] — CODEBASE GRAPH</p>
            <h2 className="sec-title">THIS SITE, AS A GRAPH_</h2>
          </div>
          <p className="sec-note caption">100% EXTRACTED · 0 TOKENS</p>
        </header>

        <GraphFigure />

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

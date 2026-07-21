import { projects, type Project } from "@/data/content";
import ParticleWave from "@/components/ParticleWave";

function WorkCard({ p, i }: { p: Project; i: number }) {
  return (
    <article
      className={`card${p.span ? ` card-${p.span}` : ""}`}
      data-reveal
      tabIndex={0}
      aria-label={`${p.title} — ${p.client}`}
    >
      <div className="card-top caption">
        <span className="accent">[{String(i + 1).padStart(2, "0")}]</span>
        <span>{p.tag}</span>
      </div>
      <div className="card-meta">
        <h3>{p.title}</h3>
        <p className="caption">
          {p.client} — {p.role} · {p.period}
        </p>
        <p className="card-desc">{p.desc}</p>
      </div>
    </article>
  );
}

export default function WorkGrid() {
  return (
    <section id="work" className="section">
      <div className="container-wide">
        <header className="sec-head" data-reveal>
          <div>
            <p className="sec-idx caption">[01] — SELECTED WORK</p>
            <h2 className="sec-title">SHIPPED &amp; IN PRODUCTION_</h2>
          </div>
          <p className="sec-note caption">INTERACTIVE 3D FIELD · MOVE YOUR CURSOR</p>
        </header>
        <div className="work-stage">
          {/* Interactive Three.js particle wave behind the cards */}
          <ParticleWave />
          <div className="bento">
            {projects.map((p, i) => (
              <WorkCard key={p.title} p={p} i={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
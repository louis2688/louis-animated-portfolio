import { projectsDone } from "@/data/content";

// Strip protocol + trailing slash for a compact display label.
function cleanUrl(u: string) {
  return u.replace(/^https?:\/\//, "").replace(/\/+$/, "");
}

export default function ProjectsDone() {
  return (
    <section id="projects" className="section">
      <div className="container-wide">
        <header className="sec-head" data-reveal>
          <div>
            <p className="sec-idx caption">[02] — SIDE PROJECTS &amp; TOOLS</p>
            <h2 className="sec-title">PROJECTS DONE_</h2>
          </div>
          <p className="sec-note caption">{projectsDone.length} SHIPPED · LIVE + SOURCE</p>
        </header>

        <div className="projects-grid">
          {projectsDone.map((p, i) => (
            <article className="project-card" data-reveal key={p.github}>
              <div className="project-top caption">
                <span className="accent">[{String(i + 1).padStart(2, "0")}]</span>
                {p.live ? (
                  <span className="proj-live">● LIVE</span>
                ) : (
                  <span className="proj-src">◦ SOURCE</span>
                )}
              </div>

              <h3>{p.name}</h3>
              {p.desc ? (
                <p className="project-desc">{p.desc}</p>
              ) : (
                <p className="project-desc project-desc-empty" aria-hidden="true">
                  {"—"}
                </p>
              )}

              <div className="project-links">
                {p.live && (
                  <a className="proj-link" href={p.live} target="_blank" rel="noreferrer">
                    <span>[ LIVE&nbsp;→ ]</span>
                    <span className="proj-url">{cleanUrl(p.live)}</span>
                  </a>
                )}
                <a className="proj-link" href={p.github} target="_blank" rel="noreferrer">
                  <span>[ GITHUB&nbsp;→ ]</span>
                  <span className="proj-url">{cleanUrl(p.github)}</span>
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
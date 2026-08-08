import Link from "next/link";
import { tools } from "@/data/content";

// Reuses the projects-grid / project-card styles — same card shape, different
// content. The "by" line is the point: none of this is my work.
export default function Tools() {
  return (
    <section id="tools" className="section">
      <div className="container-wide">
        <header className="sec-head" data-reveal>
          <div>
            <p className="sec-idx caption">[03] — WORKBENCH</p>
            <h2 className="sec-title">TOOLS I BUILD WITH_</h2>
          </div>
          <p className="sec-note caption">BUILT BY OTHERS · CREDITED</p>
        </header>

        <div className="projects-grid">
          {tools.map((t, i) => (
            <article className="project-card" data-reveal key={t.href}>
              <div className="project-top caption">
                <span className="accent">[{String(i + 1).padStart(2, "0")}]</span>
                <span className="proj-src">BY {t.by.toUpperCase()}</span>
              </div>

              <h3>{t.name}</h3>
              <p className="project-desc">{t.desc}</p>

              <div className="project-links">
                <a className="proj-link" href={t.href} target="_blank" rel="noreferrer">
                  <span>[ SITE&nbsp;→ ]</span>
                  <span className="proj-url">{t.href.replace(/^https?:\/\//, "")}</span>
                </a>
                {t.post && (
                  <Link className="proj-link" href={t.post}>
                    <span>[ I WROTE ABOUT IT&nbsp;→ ]</span>
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

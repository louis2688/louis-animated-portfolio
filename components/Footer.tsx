import { socials } from "@/data/content";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container-wide">
        <nav className="footer-links" aria-label="Social links">
          {socials.map((s) => (
            <a key={s.label} href={s.href}>
              {s.label}
            </a>
          ))}
        </nav>
        <div className="footer-base caption">
          <span>
            ©2026 LOUIS MADRIGAL — ALL SYSTEMS OPERATIONAL <span className="ok">●</span>
          </span>
          <span>
            NEXT.JS + GSAP · TERMINAL-MONO <a href="#top">[↑ TOP]</a>
          </span>
        </div>
      </div>
    </footer>
  );
}
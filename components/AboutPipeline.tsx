"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { pipeline, profile, socials } from "@/data/content";

gsap.registerPlugin(ScrollTrigger);

export default function AboutPipeline() {
  const root = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      // Blue progress line draws down the track as you scroll.
      if (!reduce) {
        gsap.to(progressRef.current, {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: listRef.current,
            start: "top 75%",
            end: "bottom 45%",
            scrub: 0.4,
          },
        });
      } else {
        gsap.set(progressRef.current, { scaleY: 1 });
      }

      // Stages light up while they cross the viewport band.
      gsap.utils.toArray<HTMLElement>(".stage").forEach((el) => {
        ScrollTrigger.create({
          trigger: el,
          start: "top 68%",
          end: "bottom 30%",
          toggleClass: { targets: el, className: "is-active" },
        });
      });
    },
    { scope: root }
  );

  return (
    <section id="about" ref={root} className="section">
      <div className="container-wide">
        <header className="sec-head" data-reveal>
          <div>
            <p className="sec-idx caption">[02] — ABOUT &amp; PIPELINE</p>
            <h2 className="sec-title">HOW THE WORK GETS DONE_</h2>
          </div>
          <p className="sec-note caption">PROFILE · PROCESS · {profile.timezone}</p>
        </header>

        <div className="split">
          <div className="about-side" data-reveal>
            {profile.bio.map((para) => (
              <p key={para.slice(0, 24)} className="about-bio">
                {para}
              </p>
            ))}

            <ul className="facts">
              {profile.facts.map((f) => (
                <li key={f.k}>
                  <span className="marker">[+]</span>
                  <strong>{f.k}</strong>
                  <span>{f.v}</span>
                </li>
              ))}
            </ul>

            <div className="socials">
              {socials.map((s) => {
                const ext = s.href.startsWith("http");
                return (
                  <a
                    key={s.label}
                    className="social-row"
                    href={s.href}
                    target={ext ? "_blank" : undefined}
                    rel={ext ? "noreferrer" : undefined}
                  >
                    <span className="accent">[→]</span> {s.label}
                  </a>
                );
              })}
            </div>
          </div>

          <div className="pipeline" id="pipeline" ref={listRef}>
            <div className="pipe-track" aria-hidden="true">
              <span ref={progressRef} className="pipe-progress" />
            </div>
            <ol>
              {pipeline.map((st, i) => (
                <li key={st.name} className="stage">
                  <p className="stage-idx caption">
                    <span>[{String(i + 1).padStart(2, "0")}]</span> · {st.tools}
                  </p>
                  <h3>{st.name}</h3>
                  <p>{st.desc}</p>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
"use client";

import { useRef, useState } from "react";
import { projects, type Project } from "@/data/content";

function WorkCard({ p, i }: { p: Project; i: number }) {
  const vid = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  const play = () => {
    const v = vid.current;
    if (!v) return;
    v.play()
      .then(() => setPlaying(true))
      .catch(() => {
        /* autoplay refused or src missing — card still works as a still */
      });
  };

  const stop = () => {
    const v = vid.current;
    if (!v) return;
    v.pause();
    v.currentTime = 0;
    setPlaying(false);
  };

  return (
    <article
      className={`card${p.span ? ` card-${p.span}` : ""}`}
      data-reveal
      tabIndex={0}
      aria-label={`${p.title} — ${p.client}`}
      onMouseEnter={play}
      onMouseLeave={stop}
      onFocus={play}
      onBlur={stop}
    >
      <video
        ref={vid}
        className="card-video"
        src={p.video}
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden="true"
      />
      <div className="card-shade" aria-hidden="true" />
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
      <span className="card-play caption" aria-hidden="true">
        {playing ? "● PLAYING" : "▶ HOVER TO PLAY"}
      </span>
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
          <p className="sec-note caption">HOVER A CARD TO PLAY · 2017—2026</p>
        </header>
        <div className="bento">
          {projects.map((p, i) => (
            <WorkCard key={p.title} p={p} i={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
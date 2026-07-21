"use client";

import { useRef } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { heroStats, profile } from "@/data/content";
const HeroParticles = dynamic(() => import("@/components/HeroParticles"), {
  ssr: false,
});

gsap.registerPlugin(ScrollTrigger);

export default function Hero({ entered }: { entered: boolean }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      // Intro plays once the welcome overlay is dismissed.
      if (entered && !reduce) {
        gsap
          .timeline({ defaults: { ease: "power4.out" } })
          .from(".hero-line > span", { yPercent: 118, duration: 1.1, stagger: 0.12 }, 0.1)
          .from(
            "[data-h]",
            { y: 24, autoAlpha: 0, duration: 0.8, ease: "power3.out", stagger: 0.08 },
            "-=0.7"
          );
      }

      if (!reduce) {
        gsap.to(".hero-media", {
          yPercent: 16,
          ease: "none",
          scrollTrigger: {
            trigger: root.current,
            start: "top top",
            end: "bottom top",
            scrub: true,
          },
        });
      }
    },
    { scope: root, dependencies: [entered], revertOnUpdate: true }
  );

  return (
    <section id="top" ref={root} className="hero">
      <div className="hero-media" id="reel-slot" aria-hidden="true">
        <HeroParticles />
      </div>

      <div className="container-wide hero-inner">
        <p className="kicker caption" data-h>
          [LM — v2.026] {profile.role} · {profile.location.toUpperCase()}
        </p>

        <h1 className="hero-title">
          <span className="hero-line">
            <span>AI-NATIVE</span>
          </span>
          <span className="hero-line">
            <span>FULL STACK</span>
          </span>
          <span className="hero-line">
            <span className="accent">ENGINEER_</span>
          </span>
        </h1>

        <p className="hero-sub" data-h>
          Nine years shipping fintech, enterprise platforms and AI systems that serve millions —
          currently building LLM copilots, RAG pipelines and autonomous agents in production.
        </p>

        <div className="hero-cta" data-h>
          <a className="btn btn-primary" href="#work">
            [ VIEW WORK ↓ ]
          </a>
          <a className="btn btn-ghost" href="#contact">
            [ CONTACT ]
          </a>
        </div>

        <div className="tui" data-h aria-hidden="true">
          <span className="tui-cmd">
            <span className="accent">▌ </span>
            deploy --stack next+spring --uptime 99.9<span className="cursor">▮</span>
          </span>
          <span className="tui-tags">[AWS] [GCP] [K8S]</span>
        </div>

        <ul className="hero-stats" data-h>
          {heroStats.map((s) => (
            <li key={s.k}>
              <strong>{s.v}</strong>
              <span className="caption">{s.k}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="hero-scroll caption" data-h aria-hidden="true">
        SCROLL ▼
      </div>
    </section>
  );
}
"use client";

import { useEffect, useRef } from "react";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import WorkGrid from "@/components/WorkGrid";
import ProjectsDone from "@/components/ProjectsDone";
import CodebaseGraph from "@/components/CodebaseGraph";
import Tools from "@/components/Tools";
import AboutPipeline from "@/components/AboutPipeline";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import { loadGsap } from "@/lib/gsap";

export default function Site() {
  const mainRef = useRef<HTMLElement>(null);

  // Shared scroll-reveal for anything tagged data-reveal. GSAP loads lazily.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let ctx: { revert: () => void } | undefined;
    let cancelled = false;
    loadGsap().then(({ gsap }) => {
      if (cancelled || !mainRef.current) return;
      ctx = gsap.context(() => {
        gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
          gsap.from(el, {
            y: 36,
            autoAlpha: 0,
            duration: 0.9,
            ease: "power3.out",
            clearProps: "transform",
            scrollTrigger: { trigger: el, start: "top 86%" },
          });
        });
      }, mainRef.current);
    });
    return () => {
      cancelled = true;
      ctx?.revert();
    };
  }, []);

  return (
    <>
      <Nav />
      <main ref={mainRef}>
        <Hero />
        <WorkGrid />
        <ProjectsDone />
        <CodebaseGraph />
        <Tools />
        <AboutPipeline />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
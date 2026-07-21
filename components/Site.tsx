"use client";

import { useEffect, useRef, useState } from "react";
import WelcomeOverlay from "@/components/WelcomeOverlay";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import WorkGrid from "@/components/WorkGrid";
import AboutPipeline from "@/components/AboutPipeline";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import { loadGsap } from "@/lib/gsap";

export default function Site() {
  const [entered, setEntered] = useState(false);
  const mainRef = useRef<HTMLElement>(null);

  // Lock scroll while the welcome overlay is up.
  useEffect(() => {
    document.body.style.overflow = entered ? "" : "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [entered]);

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
      {!entered && <WelcomeOverlay onEnter={() => setEntered(true)} />}
      <Nav />
      <main ref={mainRef}>
        <Hero entered={entered} />
        <WorkGrid />
        <AboutPipeline />
        <Contact />
      </main>
      <Footer />
    </>
  );
}

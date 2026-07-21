"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import WelcomeOverlay from "@/components/WelcomeOverlay";
import Nav from "@/components/Nav";
import Hero from "@/components/Hero";
import WorkGrid from "@/components/WorkGrid";
import AboutPipeline from "@/components/AboutPipeline";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

gsap.registerPlugin(useGSAP, ScrollTrigger);

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

  // Shared scroll-reveal for anything tagged data-reveal.
  useGSAP(
    () => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
        gsap.from(el, {
          y: 36,
          autoAlpha: 0,
          duration: 0.9,
          ease: "power3.out",
          // Drop GSAP's leftover inline transform so the CSS :hover lift works.
          clearProps: "transform",
          scrollTrigger: { trigger: el, start: "top 86%" },
        });
      });
    },
    { scope: mainRef }
  );

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
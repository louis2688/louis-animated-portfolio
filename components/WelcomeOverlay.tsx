"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

export default function WelcomeOverlay({ onEnter }: { onEnter: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);
  const leaving = useRef(false);

  const { contextSafe } = useGSAP(
    () => {
      // Match the rest of the site: no motion for reduced-motion users.
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        gsap.set("[data-w]", { autoAlpha: 1, y: 0 });
        return;
      }
      gsap.from("[data-w]", {
        y: 28,
        autoAlpha: 0,
        duration: 0.9,
        stagger: 0.09,
        ease: "power3.out",
        delay: 0.15,
      });
    },
    { scope: root }
  );

  const handleEnter = contextSafe(() => {
    if (leaving.current) return;
    leaving.current = true;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onEnter();
      return;
    }
    gsap
      .timeline({ onComplete: onEnter })
      .to("[data-w]", {
        y: -24,
        autoAlpha: 0,
        duration: 0.45,
        stagger: 0.05,
        ease: "power2.in",
      })
      .to(root.current, { autoAlpha: 0, duration: 0.6, ease: "power2.inOut" }, "-=0.2");
  });

  // Keep the latest handler reachable from the stable keydown listener below.
  const enterRef = useRef(handleEnter);
  enterRef.current = handleEnter;

  // While the modal is up: make the page behind it inert (real focus trap),
  // and let the physical Enter/Space key fire the button even if focus wanders.
  useEffect(() => {
    const bg = document.querySelectorAll("header.nav, main, footer.footer");
    bg.forEach((el) => el.setAttribute("inert", ""));

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        enterRef.current();
      } else if (e.key === "Tab") {
        // The overlay holds a single focusable control — hold focus on it.
        e.preventDefault();
        btnRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      bg.forEach((el) => el.removeAttribute("inert"));
    };
  }, []);

  return (
    <div ref={root} className="overlay" role="dialog" aria-modal="true" aria-label="Welcome">
      <div className="overlay-inner">
        <p className="overlay-kicker caption" data-w>
          {"// PORTFOLIO — v2.026"}
        </p>
        <p className="overlay-title" data-w>
          WELCOME TO
          <br />
          LOUIS MADRIGAL&apos;S
          <br />
          PORTFOLIO<span className="cursor">▮</span>
        </p>
        <button ref={btnRef} className="btn-neon" data-w autoFocus onClick={handleEnter}>
          [ ENTER ]
        </button>
        <p className="overlay-hint caption" data-w>
          PRESS ENTER ↵
        </p>
      </div>
    </div>
  );
}
"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Welcome splash. Intro and exit are pure CSS so the first screen paints
 * without waiting on GSAP (which loads lazily in the background). Keeps the
 * focus trap, Enter/Space key, and reduced-motion handling.
 */
export default function WelcomeOverlay({ onEnter }: { onEnter: () => void }) {
  const btnRef = useRef<HTMLButtonElement>(null);
  const leavingRef = useRef(false);
  const [leaving, setLeaving] = useState(false);

  const handleEnter = () => {
    if (leavingRef.current) return;
    leavingRef.current = true;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      onEnter();
      return;
    }
    setLeaving(true);
    window.setTimeout(onEnter, 640); // matches the CSS fade-out
  };

  // Keep the latest handler reachable from the stable keydown listener.
  const enterRef = useRef(handleEnter);
  enterRef.current = handleEnter;

  // Make the page behind the modal inert, and let Enter/Space fire the button.
  useEffect(() => {
    const bg = document.querySelectorAll("header.nav, main, footer.footer");
    bg.forEach((el) => el.setAttribute("inert", ""));

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " " || e.key === "Spacebar") {
        e.preventDefault();
        enterRef.current();
      } else if (e.key === "Tab") {
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
    <div
      className={`overlay${leaving ? " is-leaving" : ""}`}
      role="dialog"
      aria-modal="true"
      aria-label="Welcome"
    >
      <div className="overlay-inner">
        <p className="overlay-kicker caption">{"// PORTFOLIO — v2.026"}</p>
        <p className="overlay-title">
          WELCOME TO
          <br />
          LOUIS MADRIGAL&apos;S
          <br />
          PORTFOLIO<span className="cursor">▮</span>
        </p>
        <button ref={btnRef} className="btn-neon" autoFocus onClick={handleEnter}>
          [ ENTER ]
        </button>
        <p className="overlay-hint caption">PRESS ENTER ↵</p>
      </div>
    </div>
  );
}

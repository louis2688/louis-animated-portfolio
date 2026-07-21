"use client";

import { useEffect, useState } from "react";

type NavX = Navigator & {
  deviceMemory?: number;
  connection?: { saveData?: boolean };
};

/**
 * Decides whether to run the heavy WebGL particle fields. Returns false during
 * SSR and the first client render, then flips to true only on capable devices:
 * enough CPU/RAM, a desktop-width viewport, motion allowed, and no data-saver.
 * Phones, low-end, reduced-motion and Save-Data users skip Three.js entirely
 * and fall back to CSS — a big win for mobile performance.
 */
export function useHeavyFx(): boolean {
  const [on, setOn] = useState(false);

  useEffect(() => {
    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const nav = navigator as NavX;

    const decide = () => {
      const cores = navigator.hardwareConcurrency || 8;
      const mem = nav.deviceMemory ?? 8;
      const saveData = nav.connection?.saveData ?? false;
      const wideEnough = window.innerWidth >= 900;
      setOn(!motion.matches && !saveData && cores >= 6 && mem >= 4 && wideEnough);
    };

    decide();
    motion.addEventListener?.("change", decide);
    return () => motion.removeEventListener?.("change", decide);
  }, []);

  return on;
}

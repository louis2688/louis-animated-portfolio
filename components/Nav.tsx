"use client";

import { useEffect, useState } from "react";
import { navLinks } from "@/data/content";

export default function Nav() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [menuOpen, setMenuOpen] = useState(false);

  // Sync with whatever the pre-paint script in layout.tsx applied.
  useEffect(() => {
    if (document.documentElement.getAttribute("data-theme") === "light") {
      setTheme("light");
    }
  }, []);

  // Close the mobile drawer on Escape.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [menuOpen]);

  const toggle = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    if (next === "light") {
      document.documentElement.setAttribute("data-theme", "light");
    } else {
      document.documentElement.removeAttribute("data-theme");
    }
    try {
      localStorage.setItem("lm-theme", next);
    } catch {
      /* private mode — theme just won't persist */
    }
  };

  return (
    <header className="nav">
      <div className="container-wide nav-row">
        <a href="#top" className="nav-brand" aria-label="Louis Madrigal — back to top">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="Louis Madrigal" className="nav-logo" width={32} height={36} />
        </a>

        <nav
          id="nav-menu"
          className={`nav-links${menuOpen ? " is-open" : ""}`}
          aria-label="Sections"
        >
          {navLinks.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setMenuOpen(false)}>
              {l.label}
            </a>
          ))}
        </nav>

        <div className="nav-actions">
          <button
            className="nav-theme"
            onClick={toggle}
            aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
          >
            {theme === "dark" ? "[ ◐ DARK ]" : "[ ◑ LIGHT ]"}
          </button>

          <button
            type="button"
            className={`nav-burger${menuOpen ? " is-open" : ""}`}
            onClick={() => setMenuOpen((o) => !o)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="nav-menu"
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </div>
    </header>
  );
}
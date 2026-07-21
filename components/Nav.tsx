"use client";

import { useEffect, useState } from "react";
import { navLinks } from "@/data/content";

export default function Nav() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  // Sync with whatever the pre-paint script in layout.tsx applied.
  useEffect(() => {
    if (document.documentElement.getAttribute("data-theme") === "light") {
      setTheme("light");
    }
  }, []);

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
        <a href="#top" className="nav-brand" aria-label="Back to top">
          LM<span className="cursor">▮</span>
        </a>
        <nav className="nav-links" aria-label="Sections">
          {navLinks.map((l) => (
            <a key={l.href} href={l.href}>
              {l.label}
            </a>
          ))}
        </nav>
        <button
          className="nav-theme"
          onClick={toggle}
          aria-label={theme === "dark" ? "Switch to light theme" : "Switch to dark theme"}
        >
          {theme === "dark" ? "[ ◐ DARK ]" : "[ ◑ LIGHT ]"}
        </button>
      </div>
    </header>
  );
}
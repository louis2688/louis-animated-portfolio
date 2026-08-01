"use client";

import { useState } from "react";
import { profile } from "@/data/content";

type Status = "idle" | "sending" | "sent" | "error";

export default function Contact() {
  const [status, setStatus] = useState<Status>("idle");
  const [note, setNote] = useState<string | null>(null);

  // ponytail: POSTs to /api/contact (Resend, activated by env var RESEND_API_KEY).
  // If the API is unconfigured or unreachable, we fall back to the old mailto compose.
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    const fields = {
      name: String(f.get("name") ?? ""),
      email: String(f.get("email") ?? ""),
      company: String(f.get("company") ?? ""),
      message: String(f.get("message") ?? ""),
      contact_time: String(f.get("contact_time") ?? ""),
    };
    const mailtoFallback = () => {
      const subject = `Project inquiry — ${fields.name}`;
      const body = [
        `Name: ${fields.name}`,
        `Email: ${fields.email}`,
        `Company: ${fields.company || "—"}`,
        "",
        fields.message,
      ].join("\n");
      window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent(
        subject
      )}&body=${encodeURIComponent(body)}`;
      setNote("// api unreachable — opened your mail app as a fallback");
      setStatus("error");
    };
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(fields),
      });
      if (res.ok) {
        form.reset();
        setNote(null);
        setStatus("sent");
      } else if (res.status === 400) {
        // The API rejected the input — show why instead of pretending it's down.
        const { error } = await res.json().catch(() => ({ error: "invalid input" }));
        setNote(`// ${error} — fix and resend`);
        setStatus("idle");
      } else {
        // ponytail: infra failures (503 unconfigured, 429, 500, 502…) → mailto, never lose a lead.
        mailtoFallback();
      }
    } catch {
      mailtoFallback();
    }
  };

  const btnLabel =
    status === "sending"
      ? "[ SENDING… ]"
      : status === "sent"
        ? "[ MESSAGE SENT ✓ ]"
        : "[ SEND MESSAGE → ]";

  return (
    <section id="contact" className="section">
      <div className="container-wide">
        <header className="sec-head" data-reveal>
          <div>
            <p className="sec-idx caption">[04] — CONTACT</p>
            <h2 className="sec-title">LET&apos;S BUILD SOMETHING_</h2>
          </div>
          <p className="sec-note caption">USUALLY REPLIES &lt; 24H</p>
        </header>

        <div className="glass contact-wrap" data-reveal>
          <div className="contact-info">
            <p className="avail">
              <span className="pulse" aria-hidden="true" />
              AVAILABLE FOR CONTRACTS
            </p>
            <p className="contact-copy">
              Fintech APIs, enterprise platforms, LLM copilots — or the whole stack. Tell me what
              you are shipping and where it hurts.
            </p>
            <ul className="contact-rows caption">
              <li>
                [@] <a href={`mailto:${profile.email}`}>{profile.email}</a>
              </li>
              <li>
                [#] <a href={profile.phoneHref}>{profile.phone}</a>
              </li>
              <li>
                [⌂] {profile.location} ({profile.timezone})
              </li>
            </ul>
          </div>

          <form className="contact-form" onSubmit={handleSubmit}>
            <label className="field">
              <span className="caption">{"// NAME"}</span>
              <input name="name" required autoComplete="name" placeholder="Jane Doe" />
            </label>
            <label className="field">
              <span className="caption">{"// EMAIL"}</span>
              <input
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="jane@studio.com"
              />
            </label>
            <label className="field">
              <span className="caption">{"// COMPANY (OPTIONAL)"}</span>
              <input name="company" autoComplete="organization" placeholder="Studio / team" />
            </label>
            <label className="field">
              <span className="caption">{"// MESSAGE"}</span>
              <textarea
                name="message"
                required
                minLength={10}
                maxLength={5000}
                rows={5}
                placeholder="What are we building?"
              />
            </label>
            {/* Honeypot: display:none keeps browser/password-manager autofill away
                (off-screen fields still get filled), and the name avoids autofill
                heuristics — a real visitor's autofill must never trip the trap. */}
            <input
              name="contact_time"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              style={{ display: "none" }}
            />
            <button className="btn btn-primary" type="submit" disabled={status === "sending"}>
              {btnLabel}
            </button>
            <p className="form-note caption">
              {note ?? "// delivered straight to my inbox — no tracking"}
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
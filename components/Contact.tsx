"use client";

import { useState } from "react";
import { profile } from "@/data/content";

export default function Contact() {
  const [sent, setSent] = useState(false);

  // ponytail: no backend — compose a mail in the visitor's own client.
  // Swap for a POST to /api/contact (or a form service) when one exists.
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const subject = `Project inquiry — ${f.get("name")}`;
    const body = [
      `Name: ${f.get("name")}`,
      `Email: ${f.get("email")}`,
      `Company: ${f.get("company") || "—"}`,
      "",
      `${f.get("message")}`,
    ].join("\n");
    window.location.href = `mailto:${profile.email}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
    setSent(true);
  };

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
              <textarea name="message" required rows={5} placeholder="What are we building?" />
            </label>
            <button className="btn btn-primary" type="submit">
              {sent ? "[ MAIL CLIENT OPENED ✓ ]" : "[ SEND MESSAGE → ]"}
            </button>
            <p className="form-note caption">{"// opens your mail app — no data leaves this page"}</p>
          </form>
        </div>
      </div>
    </section>
  );
}
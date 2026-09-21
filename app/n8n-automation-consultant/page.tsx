import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL, profile } from "@/data/content";

// Beachhead landing page: "n8n consultant" is the winnable head term (KD 7)
// and "ai automation consultant" the volume prize (590/mo, KD 26) — this page
// is the site's dedicated target for both. Proof, not promises: a live n8n
// product, a technical architecture post, and n8n in production at GrowthOS.
const DESC =
  "n8n consultant and AI automation engineer for hire — I build production n8n workflows, secure multi-tenant chat deployments and AI agent automation. Builder of Chatflowgate. Remote, GMT+8, 9+ years shipping.";

export const metadata: Metadata = {
  title: { absolute: "n8n Consultant & AI Automation Expert — Louis Madrigal" },
  description: DESC,
  alternates: { canonical: "/n8n-automation-consultant" },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/n8n-automation-consultant`,
    title: "n8n Consultant & AI Automation Expert — Louis Madrigal",
    description: DESC,
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: "n8n Consultant & AI Automation Expert — Louis Madrigal",
    description: DESC,
    images: ["/opengraph-image"],
  },
};

const offers = [
  {
    tag: "WORKFLOWS",
    title: "PRODUCTION N8N WORKFLOWS",
    desc: "Workflows that survive contact with real traffic — error handling, retries, idempotency and monitoring, not just nodes that work in the editor. I run n8n in production behind GrowthOS's community-discovery agents.",
    link: { href: "/blog/n8n-error-handling-production", label: "ERROR HANDLING PLAYBOOK" },
  },
  {
    tag: "SECURITY",
    title: "SECURE CHAT & WEBHOOK DEPLOYMENTS",
    desc: "n8n's chat trigger exposes a bare public webhook — fine for demos, a liability in production. I built Chatflowgate, a multi-tenant gateway that adds tenant auth, origin checks, rate limiting and conversation history in front of it.",
    link: { href: "/blog/multi-tenant-n8n-chat-gateway", label: "READ THE ARCHITECTURE" },
  },
  {
    tag: "AI AGENTS",
    title: "LLM & AGENT AUTOMATION",
    desc: "Wiring LLMs into n8n the way I wire them into products at my day job — copilots, RAG retrieval and multi-agent flows for a national-scale fintech. Guardrails and evals included, because automation that hallucinates is a liability.",
    link: { href: "/blog/production-rag-pipelines-lessons", label: "PRODUCTION RAG NOTES" },
  },
  {
    tag: "RESCUE",
    title: "WORKFLOW AUDITS & RESCUES",
    desc: "A workflow someone built that nobody understands, breaking quietly at 3am. I audit it, document it, harden it — or rebuild it small enough that your team can own it.",
  },
];

const faqs = [
  {
    q: "Why hire an n8n consultant instead of building it in-house?",
    a: "n8n's editor makes the first 80% look easy — the paid-for part is the last 20%: error handling, security around public webhooks, rate limits, idempotent retries, and knowing when a workflow should be code instead. I hand over documented workflows your team can maintain, not a black box.",
  },
  {
    q: "Can you secure a customer-facing n8n chat deployment?",
    a: "Yes — that exact problem is why I built Chatflowgate. The chat trigger's public webhook gets a gateway in front of it: per-tenant site keys, origin allowlists, rate limiting and stored conversation history, with the n8n webhook URL kept server-side.",
  },
  {
    q: "Do you integrate LLMs and AI agents into n8n?",
    a: "Yes. My day job is LLM copilots and RAG pipelines at a national-scale fintech; I bring the same discipline — evaluation sets, guardrails, fallbacks for when the model is wrong — to n8n automations so they are trustworthy enough to run unattended.",
  },
  {
    q: "How do engagements work?",
    a: "Contract and remote from GMT+8 (full APAC overlap, mornings with Europe, evenings with the US). Scoped builds, audits, or ongoing support. Start with the contact form or email — I usually reply within 24 hours.",
  },
  {
    q: "Self-hosted n8n or n8n Cloud?",
    a: "Either works. Self-hosting keeps data on your infrastructure and removes per-execution fees, at the cost of running it; n8n Cloud takes the ops work off your plate. I'll recommend one based on your data sensitivity and volume, and I can set up self-hosted n8n with queue mode and workers when a single instance stops being enough.",
  },
];

// Long-tail copy the page was missing — kept to capabilities the site already
// evidences (Chatflowgate, n8n behind GrowthOS, production LLM/RAG work).
const useCases = [
  {
    title: "AI support & sales chat",
    desc: "A customer-facing assistant that answers from your own docs, with the public chat webhook secured behind a gateway — the pattern I productized as Chatflowgate.",
  },
  {
    title: "Lead capture & routing",
    desc: "Form, webhook or inbox → enrich → score → your CRM → the right person pinged. Deduplicated and idempotent, so a retry never creates a second lead.",
  },
  {
    title: "Document & inbox processing",
    desc: "LLMs that read invoices, contracts or support email, pull out the fields that matter and route them — with validation on every output, because a model that is usually right still needs checking when it isn't.",
  },
  {
    title: "AI agent workflows",
    desc: "Multi-step agents that research, decide and act across your tools — the kind of agent workflows n8n runs behind GrowthOS, with guardrails and logging on every step.",
  },
  {
    title: "Ops syncs & reporting",
    desc: "Scheduled syncs between the tools your team already uses, alerts when something drifts, and reports that land on time — the glue work nobody wants to own.",
  },
];

const steps = [
  {
    title: "Tell me what's breaking",
    desc: "Send the workflow you want built or fixed through the contact form or email. I usually reply within 24 hours.",
  },
  {
    title: "Scope it",
    desc: "A short call or async thread to map the trigger, the systems involved and what \"done\" means. You get a written scope before any build starts.",
  },
  {
    title: "Build or audit",
    desc: "In your n8n, Cloud or self-hosted, with error handling, retries and alerting designed in rather than bolted on. Existing workflows get audited and hardened, or rebuilt smaller.",
  },
  {
    title: "Hand over",
    desc: "Documented workflows your team can maintain, not a black box. Ongoing support if you want it, never a lock-in.",
  },
];

const vsPoints = [
  {
    title: "Cost at volume",
    desc: "Zapier and Make meter every step. n8n counts a whole workflow run as one execution, and self-hosted n8n has no per-run fees at all — a real difference once a ten-step workflow runs thousands of times a day.",
  },
  {
    title: "Your data stays yours",
    desc: "Self-hosted n8n runs on your own infrastructure, so customer data never passes through a third-party automation vendor.",
  },
  {
    title: "Real code when you need it",
    desc: "Code nodes run JavaScript or Python inline, so the one step that doesn't fit a drag-and-drop box doesn't force a rewrite.",
  },
  {
    title: "AI-native",
    desc: "Agent, LLM and vector-store nodes are built in, so agents and RAG live inside the workflow instead of behind glue code.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Service",
      name: "n8n Consulting & AI Automation",
      serviceType: offers.map((o) => o.title),
      provider: { "@id": `${SITE_URL}/#person` },
      areaServed: { "@type": "Place", name: "Worldwide (remote)" },
      url: `${SITE_URL}/n8n-automation-consultant`,
    },
    {
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
    {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: "Services", item: `${SITE_URL}/services` },
        { "@type": "ListItem", position: 3, name: "n8n & AI Automation" },
      ],
    },
  ],
};

// Build-time constants only — jsonLdSafe escapes "<" so the JSON-LD can never
// break out of its script tag (same hardened pattern as every other page here).
const jsonLdSafe = (o: object) => JSON.stringify(o).replace(/</g, "\\u003c");

export default function N8nConsultantPage() {
  return (
    <main className="container project-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdSafe(jsonLd) }}
      />

      <Link href="/services" className="back-link">
        [ ← ALL SERVICES ]
      </Link>

      <p className="sec-idx caption">[SERVICES] — N8N & AI AUTOMATION</p>
      <h1 className="project-page-title">N8N CONSULTANT & AI AUTOMATION_</h1>
      <p className="project-page-lede">
        I build and harden n8n automations for production — and I have the
        receipts: Chatflowgate, a live multi-tenant gateway for n8n chat, and
        n8n running the agent workflows behind GrowthOS. {profile.location},
        working with teams worldwide.
      </p>

      <div className="services-grid">
        {offers.map((o, i) => (
          <article className="glass service-card" key={o.title}>
            <p className="caption service-tag">
              <span className="accent">[{String(i + 1).padStart(2, "0")}]</span> {o.tag}
            </p>
            <h2>{o.title}</h2>
            <p>{o.desc}</p>
            {o.link && (
              <Link className="proj-link" href={o.link.href}>
                <span>[ {o.link.label}&nbsp;→ ]</span>
              </Link>
            )}
          </article>
        ))}
      </div>

      <section className="post-body">
        <h2>What I automate with n8n</h2>
        <p>Typical n8n builds — each designed to run unattended, not just to pass a demo.</p>
        <ul>
          {useCases.map((u) => (
            <li key={u.title}>
              <strong>{u.title}</strong> — {u.desc}
            </li>
          ))}
        </ul>

        <h2>How an n8n engagement works</h2>
        <ol>
          {steps.map((s) => (
            <li key={s.title}>
              <strong>{s.title}.</strong> {s.desc}
            </li>
          ))}
        </ol>
        <p>
          I work remotely from GMT+8: full overlap with Australia and APAC,
          mornings with Europe, evenings with the US.
        </p>

        <h2>n8n vs Zapier and Make</h2>
        <p>Sometimes Zapier is the right answer. n8n wins once a workflow matters:</p>
        <ul>
          {vsPoints.map((v) => (
            <li key={v.title}>
              <strong>{v.title}</strong> — {v.desc}
            </li>
          ))}
        </ul>
        <p>
          Zapier or Make is the better call when the team is non-technical, the
          workflow is a few steps and volume is low. If that’s you, I’ll say so.
        </p>
      </section>

      <div className="project-page-actions">
        <Link className="btn btn-primary" href="/#contact">
          [ START A PROJECT → ]
        </Link>
        <a className="btn btn-ghost" href={`mailto:${profile.email}`}>
          [ EMAIL ME ]
        </a>
      </div>

      <section className="services-faq">
        <h2 className="caption services-faq-title">{"// COMMON QUESTIONS"}</h2>
        {faqs.map((f) => (
          <details key={f.q} className="glass faq-item">
            <summary>{f.q}</summary>
            <p>{f.a}</p>
          </details>
        ))}
      </section>
    </main>
  );
}

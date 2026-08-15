import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL, profile } from "@/data/content";

// The commercial-intent page: /services exists so searches like "hire AI
// developer Philippines" have a dedicated target instead of only the homepage.
const DESC =
  "Hire Louis Madrigal for contract AI and full-stack development — LLM copilots, RAG pipelines, AI agents and n8n automation, Next.js and Spring Boot platforms. Remote from the Philippines (GMT+8), 9+ years shipping production systems.";

export const metadata: Metadata = {
  title: { absolute: "Hire an AI Full Stack Developer — Louis Madrigal" },
  description: DESC,
  alternates: { canonical: "/services" },
  openGraph: {
    type: "website",
    url: `${SITE_URL}/services`,
    title: "Hire an AI Full Stack Developer — Louis Madrigal",
    description: DESC,
    images: ["/opengraph-image"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hire an AI Full Stack Developer — Louis Madrigal",
    description: DESC,
    images: ["/opengraph-image"],
  },
};

const services = [
  {
    tag: "LLM / RAG",
    title: "LLM COPILOTS & RAG PIPELINES",
    desc: "Retrieval pipelines, copilots and evaluation harnesses that survive production — built on lessons from shipping them at a national-scale fintech serving millions of users.",
    link: { href: "/blog/production-rag-pipelines-lessons", label: "READ THE FIELD NOTES" },
  },
  {
    tag: "AI AGENTS",
    title: "AI AGENTS & WORKFLOW AUTOMATION",
    desc: "Autonomous multi-agent systems and n8n-based automation with real guardrails — the pattern behind Chatflowgate and the agent platforms I built for a Fortune 500 telco.",
    link: { href: "/blog/multi-tenant-n8n-chat-gateway", label: "SEE THE ARCHITECTURE" },
  },
  {
    tag: "FULL STACK",
    title: "FULL-STACK PRODUCT ENGINEERING",
    desc: "React, Next.js, Node and Java Spring Boot — server-rendered frontends and typed APIs, like the SSR migration that cut first paint 40% on a national-scale mobile wallet.",
    link: { href: "/blog/nextjs-ssr-40-percent-faster-first-paint", label: "HOW THE 40% HAPPENED" },
  },
  {
    tag: "CLOUD",
    title: "CLOUD ARCHITECTURE & HARDENING",
    desc: "AWS, GCP, Kubernetes, serverless and identity — including AWS Lambda architecture and Okta SSO for 10,000+ enterprise users with ops cost down 25%.",
  },
];

const faqs = [
  {
    q: "How do engagements work?",
    a: "Contract and remote. Scoped projects (a pipeline, a migration, an integration) or an ongoing fractional role on your team — whichever fits the problem. Every engagement starts with a short call to define scope before anything is billed.",
  },
  {
    q: "What timezone do you work in?",
    a: "GMT+8 (Metro Manila, Philippines). That gives full overlap with APAC and Australia, mornings with Europe, and evenings with US time zones — I have shipped for North American teams (Telus International, Accenture) for years on that overlap.",
  },
  {
    q: "What stack do you work with?",
    a: "React, Next.js, Node.js, Java Spring Boot and Python on AWS, GCP and Kubernetes. On the AI side: LLM copilots, RAG pipelines, agent frameworks and n8n automation, wired into real products rather than demos.",
  },
  {
    q: "How do I start?",
    a: "Use the contact form or email louismadrigal26@gmail.com with a couple of lines about what you are shipping and where it hurts. I usually reply within 24 hours.",
  },
];

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Service",
      name: "AI & Full Stack Development — Contract",
      serviceType: services.map((s) => s.title),
      provider: { "@id": `${SITE_URL}/#person` },
      areaServed: { "@type": "Place", name: "Worldwide (remote)" },
      url: `${SITE_URL}/services`,
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
        { "@type": "ListItem", position: 2, name: "Services" },
      ],
    },
  ],
};

// Build-time constants only — jsonLdSafe escapes "<" so the JSON-LD can never
// break out of its script tag (same hardened pattern as the blog pages).
const jsonLdSafe = (o: object) => JSON.stringify(o).replace(/</g, "\\u003c");

export default function ServicesPage() {
  return (
    <main className="container project-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdSafe(jsonLd) }}
      />

      <Link href="/" className="back-link">
        [ ← BACK TO HOME ]
      </Link>

      <p className="sec-idx caption">[SERVICES] — CONTRACT & REMOTE</p>
      <h1 className="project-page-title">HIRE AN AI FULL STACK DEVELOPER_</h1>
      <p className="project-page-lede">
        Nine-plus years shipping fintech, enterprise platforms and production AI
        systems — {profile.location}, working with teams worldwide. These are the
        four things clients hire me for.
      </p>

      <div className="services-grid">
        {services.map((s, i) => (
          <article className="glass service-card" key={s.title}>
            <p className="caption service-tag">
              <span className="accent">[{String(i + 1).padStart(2, "0")}]</span> {s.tag}
            </p>
            <h2>{s.title}</h2>
            <p>{s.desc}</p>
            {s.link && (
              <Link className="proj-link" href={s.link.href}>
                <span>[ {s.link.label}&nbsp;→ ]</span>
              </Link>
            )}
          </article>
        ))}
      </div>

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

import type { Metadata } from "next";
import Link from "next/link";
import { SITE_URL } from "@/data/content";
import { getPosts } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Field notes on AI and full-stack engineering — LLM copilots, RAG pipelines, Next.js and production systems — by Louis Madrigal.",
  alternates: {
    canonical: "/blog",
    types: { "application/rss+xml": "/blog/rss.xml" },
  },
};

// Escapes "<" so build-time JSON-LD can never break out of its script tag.
const jsonLdSafe = (o: object) => JSON.stringify(o).replace(/</g, "\\u003c");

export default function BlogIndexPage() {
  const posts = getPosts();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Field Notes — Louis Madrigal",
    url: `${SITE_URL}/blog`,
    description:
      "AI and full-stack engineering writing by Louis Madrigal — Senior AI Full Stack Developer.",
    author: { "@id": `${SITE_URL}/#person` },
    blogPost: posts.map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      url: `${SITE_URL}/blog/${p.slug}`,
      datePublished: p.date,
    })),
  };

  return (
    <main className="container project-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdSafe(jsonLd) }}
      />

      <Link href="/" className="back-link">
        [ ← BACK TO HOME ]
      </Link>

      <p className="sec-idx caption">[BLOG] — WRITING</p>
      <h1 className="sec-title">FIELD NOTES_</h1>

      <div className="blog-list">
        {posts.map((p) => (
          <article key={p.slug} className="glass blog-card">
            <p className="caption blog-card-date">{p.date}</p>
            <h2 className="blog-card-title">
              <Link href={`/blog/${p.slug}`}>{p.title}</Link>
            </h2>
            <p className="blog-card-desc">{p.description}</p>
            {p.tags.length > 0 && (
              <ul className="blog-tags">
                {p.tags.map((t) => (
                  <li key={t} className="blog-tag">
                    [{t}]
                  </li>
                ))}
              </ul>
            )}
          </article>
        ))}
        {posts.length === 0 && (
          <p className="caption">NO POSTS YET — CHECK BACK SOON.</p>
        )}
      </div>
    </main>
  );
}

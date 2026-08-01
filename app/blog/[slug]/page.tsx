import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SITE_URL } from "@/data/content";
import { getPost, getPosts } from "@/lib/blog";

const SITE = SITE_URL;

// Escapes "<" so build-time JSON-LD can never break out of its script tag.
const jsonLdSafe = (o: object) => JSON.stringify(o).replace(/</g, "\\u003c");

/* ---------- tiny markdown renderer ----------
   ponytail: covers exactly what the posts use (##/### headings, paragraphs,
   fenced code, -/1. lists, **bold**, `code`, [text](url)). Swap for a real
   markdown lib only if posts ever need more. */

const INLINE_RE = /`([^`]+)`|\*\*([^*]+)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;

function inline(text: string): ReactNode[] {
  const out: ReactNode[] = [];
  let last = 0;
  let key = 0;
  for (const m of text.matchAll(INLINE_RE)) {
    if (m.index > last) out.push(text.slice(last, m.index));
    if (m[1] !== undefined) out.push(<code key={key++}>{m[1]}</code>);
    else if (m[2] !== undefined) out.push(<strong key={key++}>{m[2]}</strong>);
    else
      out.push(
        <a key={key++} href={m[4]}>
          {m[3]}
        </a>,
      );
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}

function renderMarkdown(body: string): ReactNode[] {
  const lines = body.split(/\r?\n/);
  const blocks: ReactNode[] = [];
  let i = 0;
  let key = 0;
  const isBlockStart = (l: string) =>
    /^(## |### |- |\d+\. |```)/.test(l) || l.trim() === "";
  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith("```")) {
      const code: string[] = [];
      i++;
      while (i < lines.length && !lines[i].startsWith("```")) code.push(lines[i++]);
      i++; // closing fence
      blocks.push(
        <pre key={key++}>
          <code>{code.join("\n")}</code>
        </pre>,
      );
    } else if (line.startsWith("### ")) {
      blocks.push(<h3 key={key++}>{inline(line.slice(4))}</h3>);
      i++;
    } else if (line.startsWith("## ")) {
      blocks.push(<h2 key={key++}>{inline(line.slice(3))}</h2>);
      i++;
    } else if (line.startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length && lines[i].startsWith("- ")) items.push(lines[i++].slice(2));
      blocks.push(
        <ul key={key++}>
          {items.map((t, j) => (
            <li key={j}>{inline(t)}</li>
          ))}
        </ul>,
      );
    } else if (/^\d+\. /.test(line)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\. /.test(lines[i]))
        items.push(lines[i++].replace(/^\d+\. /, ""));
      blocks.push(
        <ol key={key++}>
          {items.map((t, j) => (
            <li key={j}>{inline(t)}</li>
          ))}
        </ol>,
      );
    } else if (line.trim() === "") {
      i++;
    } else {
      const para: string[] = [line];
      i++;
      while (i < lines.length && !isBlockStart(lines[i])) para.push(lines[i++]);
      blocks.push(<p key={key++}>{inline(para.join(" "))}</p>);
    }
  }
  return blocks;
}

/* ---------- page ---------- */

export function generateStaticParams() {
  return getPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) return { title: "Post not found" };
  return {
    // absolute: frontmatter titles already run long — skip the " — Louis Madrigal"
    // template so the <title> stays near the ~60-char search-snippet budget.
    title: { absolute: post.title },
    description: post.description,
    alternates: {
      canonical: `/blog/${slug}`,
      types: { "application/rss+xml": "/blog/rss.xml" },
    },
    openGraph: {
      type: "article",
      url: `${SITE}/blog/${slug}`,
      title: `${post.title} — Louis Madrigal`,
      description: post.description,
      publishedTime: post.date,
      authors: ["Louis Madrigal"],
      images: ["/opengraph-image"],
    },
    twitter: {
      card: "summary_large_image",
      title: `${post.title} — Louis Madrigal`,
      description: post.description,
      images: ["/opengraph-image"],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPost(slug);
  if (!post) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "BlogPosting",
        headline: post.title,
        description: post.description,
        datePublished: post.date,
        author: { "@id": `${SITE}/#person` },
        mainEntityOfPage: `${SITE}/blog/${slug}`,
        image: `${SITE}/opengraph-image`,
        keywords: post.tags.join(", "),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: SITE },
          { "@type": "ListItem", position: 2, name: "Blog", item: `${SITE}/blog` },
          { "@type": "ListItem", position: 3, name: post.title },
        ],
      },
    ],
  };

  return (
    <main className="container project-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdSafe(jsonLd) }}
      />

      <Link href="/blog" className="back-link">
        [ ← BACK TO BLOG ]
      </Link>

      <p className="sec-idx caption">{post.date}</p>
      <h1 className="project-page-title">{post.title}</h1>

      <div className="post-body">{renderMarkdown(post.body)}</div>

      <div className="glass post-cta">
        <p>
          Louis is available for contract work — AI systems, full-stack
          platforms and everything in between.
        </p>
        <a className="btn btn-primary" href="/#contact">
          [ GET IN TOUCH → ]
        </a>
      </div>
    </main>
  );
}

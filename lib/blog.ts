// Build-time blog helper. Reads content/blog/*.md and parses the simple
// frontmatter contract (---, key: value lines, ---, markdown body).
// ponytail: hand-rolled ~15-line parser; swap for gray-matter only if the
// frontmatter contract ever grows beyond flat "key: value" lines.
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

export type Post = {
  slug: string;
  title: string;
  description: string;
  date: string; // YYYY-MM-DD
  tags: string[];
  body: string;
};

const BLOG_DIR = path.join(process.cwd(), "content", "blog");

function parsePost(slug: string, raw: string): Post {
  const m = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  const meta: Record<string, string> = {};
  for (const line of (m?.[1] ?? "").split(/\r?\n/)) {
    const i = line.indexOf(":");
    // Strip optional surrounding quotes so `title: "Foo"` renders as Foo.
    if (i > 0)
      meta[line.slice(0, i).trim()] = line
        .slice(i + 1)
        .trim()
        .replace(/^(["'])(.*)\1$/, "$2");
  }
  return {
    slug,
    title: meta.title ?? slug,
    description: meta.description ?? "",
    date: meta.date ?? "",
    tags: meta.tags
      ? meta.tags.split(",").map((t) => t.trim()).filter(Boolean)
      : [],
    body: m ? raw.slice(m[0].length) : raw,
  };
}

export function getPosts(): Post[] {
  let files: string[];
  try {
    files = readdirSync(BLOG_DIR).filter((f) => f.endsWith(".md"));
  } catch {
    return []; // directory missing — other agents may still be writing it
  }
  return files
    .map((f) =>
      parsePost(f.slice(0, -3), readFileSync(path.join(BLOG_DIR, f), "utf8")),
    )
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getPost(slug: string): Post | undefined {
  return getPosts().find((p) => p.slug === slug);
}

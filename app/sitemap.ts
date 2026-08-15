import type { MetadataRoute } from "next";
import { projectsDone, projectSlug, SITE_URL } from "@/data/content";
import { getPosts } from "@/lib/blog";

const SITE = SITE_URL;

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const projects: MetadataRoute.Sitemap = projectsDone.map((p) => ({
    url: `${SITE}/projects/${projectSlug(p.name)}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));
  const posts: MetadataRoute.Sitemap = getPosts().map((p) => ({
    url: `${SITE}/blog/${p.slug}`,
    lastModified: p.date,
    changeFrequency: "monthly",
    priority: 0.7,
  }));
  return [
    { url: SITE, lastModified: now, changeFrequency: "monthly", priority: 1 },
    ...projects,
    {
      url: `${SITE}/services`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${SITE}/n8n-automation-consultant`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: `${SITE}/blog`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...posts,
  ];
}
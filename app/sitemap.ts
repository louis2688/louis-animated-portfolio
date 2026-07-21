import type { MetadataRoute } from "next";
import { projectsDone, projectSlug } from "@/data/content";

const SITE = "https://louismadrigal-portfolio.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const projects: MetadataRoute.Sitemap = projectsDone.map((p) => ({
    url: `${SITE}/projects/${projectSlug(p.name)}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));
  return [
    { url: SITE, lastModified: now, changeFrequency: "monthly", priority: 1 },
    ...projects,
  ];
}
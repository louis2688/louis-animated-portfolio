import type { MetadataRoute } from "next";
import { projectsDone, projectSlug, SITE_URL } from "@/data/content";

const SITE = SITE_URL;

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
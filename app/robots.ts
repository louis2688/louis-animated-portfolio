import type { MetadataRoute } from "next";
import { SITE_URL } from "@/data/content";

const SITE = SITE_URL;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE}/sitemap.xml`,
    host: SITE,
  };
}
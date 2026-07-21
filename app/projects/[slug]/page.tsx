import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { projectsDone, projectSlug } from "@/data/content";

const SITE = "https://louismadrigal-portfolio.vercel.app";

function cleanUrl(u: string) {
  return u.replace(/^https?:\/\//, "").replace(/\/+$/, "");
}

function findProject(slug: string) {
  return projectsDone.find((p) => projectSlug(p.name) === slug);
}

export function generateStaticParams() {
  return projectsDone.map((p) => ({ slug: projectSlug(p.name) }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const p = findProject(slug);
  if (!p) return { title: "Project not found" };
  const description = p.desc || `${p.name} — a project built by Louis Madrigal.`;
  return {
    title: p.name,
    description,
    alternates: { canonical: `/projects/${slug}` },
    openGraph: {
      type: "article",
      url: `${SITE}/projects/${slug}`,
      title: `${p.name} — Louis Madrigal`,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: `${p.name} — Louis Madrigal`,
      description,
    },
  };
}

export default async function ProjectPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const p = findProject(slug);
  if (!p) notFound();

  const description = p.desc || `${p.name} — a project built by Louis Madrigal.`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: p.name,
    description,
    url: p.live || p.github,
    applicationCategory: "WebApplication",
    operatingSystem: "Web",
    author: { "@type": "Person", name: "Louis Madrigal", url: SITE },
  };

  return (
    <main className="container project-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Link href="/#projects" className="back-link">
        [ ← BACK TO PROJECTS ]
      </Link>

      <p className="sec-idx caption">
        PROJECT{p.live ? " · ● LIVE" : " · ◦ SOURCE"}
      </p>
      <h1 className="project-page-title">{p.name}</h1>
      <p className="project-page-lede">{description}</p>

      <div className="project-page-actions">
        {p.live && (
          <a className="btn btn-primary" href={p.live} target="_blank" rel="noreferrer">
            [ VISIT LIVE → ]
          </a>
        )}
        <a className="btn btn-ghost" href={p.github} target="_blank" rel="noreferrer">
          [ VIEW SOURCE → ]
        </a>
      </div>

      <ul className="project-page-meta">
        {p.live && (
          <li>
            <span className="caption">LIVE</span>
            <a href={p.live} target="_blank" rel="noreferrer">
              {cleanUrl(p.live)}
            </a>
          </li>
        )}
        <li>
          <span className="caption">SOURCE</span>
          <a href={p.github} target="_blank" rel="noreferrer">
            {cleanUrl(p.github)}
          </a>
        </li>
        <li>
          <span className="caption">BY</span>
          <Link href="/">Louis Madrigal — Senior AI Full Stack Developer</Link>
        </li>
      </ul>
    </main>
  );
}

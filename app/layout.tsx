import type { Metadata, Viewport } from "next";
import { JetBrains_Mono } from "next/font/google";
import { SITE_URL } from "@/data/content";
import "./globals.css";

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "700", "800"],
  display: "swap",
});

const SITE = SITE_URL;
const DESC =
  "Hire Louis Madrigal — Senior AI Full Stack Developer with 9+ years building LLM copilots, RAG pipelines and autonomous agents, plus React, Next.js and Spring Boot platforms that serve millions. Available for contract and remote work from Metro Manila, Philippines.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default:
      "Louis Madrigal — Senior AI Full Stack Developer for Hire | LLM, RAG & Next.js",
    template: "%s — Louis Madrigal",
  },
  description: DESC,
  applicationName: "Louis Madrigal — Portfolio",
  keywords: [
    "Louis Madrigal",
    "hire AI developer Philippines",
    "freelance full stack developer Philippines",
    "Senior Full Stack Developer",
    "AI Full Stack Developer",
    "AI Engineer",
    "LLM developer for hire",
    "RAG pipeline developer",
    "AI agent developer",
    "Next.js developer",
    "React developer",
    "Node.js",
    "Java Spring Boot",
    "AWS",
    "Metro Manila",
    "Philippines",
  ],
  authors: [{ name: "Louis Madrigal", url: "https://github.com/louis2688" }],
  creator: "Louis Madrigal",
  publisher: "Louis Madrigal",
  alternates: { canonical: "/" },
  icons: { icon: [{ url: "/logo.svg", type: "image/svg+xml" }] },
  openGraph: {
    type: "website",
    url: SITE,
    siteName: "Louis Madrigal — Portfolio",
    title: "Louis Madrigal — Senior AI Full Stack Developer for Hire",
    description: DESC,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Louis Madrigal — Senior AI Full Stack Developer for Hire",
    description: DESC,
  },
  robots: { index: true, follow: true },
  category: "technology",
};

export const viewport: Viewport = {
  themeColor: "#050609",
  colorScheme: "dark light",
};

// Applies a saved light theme before paint so there is no dark flash.
const themeInit = `try{if(localStorage.getItem("lm-theme")==="light")document.documentElement.setAttribute("data-theme","light")}catch(e){}`;

const SKILLS = [
  "React",
  "Next.js",
  "Node.js",
  "Java Spring Boot",
  "Python",
  "AWS",
  "GCP",
  "Kubernetes",
  "LLM",
  "RAG",
  "AI Agents",
];

const person = {
  "@type": "Person",
  "@id": `${SITE}/#person`,
  name: "Louis Anthony M. Madrigal",
  alternateName: "Louis Madrigal",
  jobTitle: "Senior AI Full Stack Developer",
  description:
    "Senior AI Full Stack Developer with 9+ years shipping fintech, enterprise platforms and production AI systems.",
  url: SITE,
  email: "louismadrigal26@gmail.com",
  telephone: "+63 949 186 1717",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Metro Manila",
    addressCountry: "PH",
  },
  sameAs: [
    "https://github.com/louis2688",
    "https://www.linkedin.com/in/louismadrigal/",
  ],
  knowsAbout: SKILLS,
  hasOccupation: {
    "@type": "Occupation",
    name: "Senior AI Full Stack Developer",
    occupationLocation: { "@type": "Country", name: "Philippines" },
    skills: SKILLS.join(", "),
  },
};

// ProfessionalService signals that the work is for hire, which is what a
// prospective client's search actually looks for.
const service = {
  "@type": "ProfessionalService",
  "@id": `${SITE}/#service`,
  name: "Louis Madrigal — AI & Full Stack Development",
  description:
    "Contract and remote software development: LLM copilots, RAG pipelines, autonomous agents, and React/Next.js/Spring Boot platforms.",
  url: SITE,
  provider: { "@id": `${SITE}/#person` },
  areaServed: { "@type": "Place", name: "Worldwide" },
  availableLanguage: ["en", "fil"],
  serviceType: [
    "AI application development",
    "LLM and RAG engineering",
    "Full stack web development",
    "Backend API development",
    "Cloud architecture",
  ],
};

const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [person, service],
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={mono.variable} suppressHydrationWarning>
      <body>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {children}
      </body>
    </html>
  );
}
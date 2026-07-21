import type { Metadata, Viewport } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  weight: ["400", "500", "700", "800"],
  display: "swap",
});

const SITE = "https://louismadrigal-portfolio.vercel.app";
const DESC =
  "Portfolio of Louis Madrigal — Senior AI Full Stack Developer with 9+ years shipping fintech, enterprise platforms and AI systems (LLM copilots, RAG pipelines, autonomous agents) that serve millions of users. Metro Manila, Philippines.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: "Louis Madrigal — Senior AI Full Stack Developer",
    template: "%s — Louis Madrigal",
  },
  description: DESC,
  applicationName: "Louis Madrigal — Portfolio",
  keywords: [
    "Louis Madrigal",
    "Senior Full Stack Developer",
    "AI Full Stack Developer",
    "AI Engineer",
    "Next.js developer",
    "React developer",
    "Node.js",
    "Java Spring Boot",
    "LLM",
    "RAG",
    "AI Agents",
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
    title: "Louis Madrigal — Senior AI Full Stack Developer",
    description: DESC,
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Louis Madrigal — Senior AI Full Stack Developer",
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

// Person structured data for richer search results.
const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Louis Anthony M. Madrigal",
  alternateName: "Louis Madrigal",
  jobTitle: "Senior AI Full Stack Developer",
  url: SITE,
  email: "louismadrigal26@gmail.com",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Metro Manila",
    addressCountry: "PH",
  },
  sameAs: [
    "https://github.com/louis2688",
    "https://www.linkedin.com/in/louismadrigal/",
  ],
  knowsAbout: [
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
  ],
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
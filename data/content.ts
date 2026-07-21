// All portfolio copy lives here — edit this file, not the components.
// Source: Louis_Madrigal_2026_v2.docx

export const profile = {
  name: "LOUIS ANTHONY M. MADRIGAL",
  shortName: "LOUIS MADRIGAL",
  role: "SENIOR AI FULL STACK DEVELOPER",
  location: "Metro Manila, Philippines",
  timezone: "GMT+8",
  email: "louismadrigal26@gmail.com",
  phone: "+63 949 186 1717",
  phoneHref: "tel:+639491861717",
  bio: [
    "Nine-plus years of progressive experience across enterprise platforms, fintech systems and cloud-native architectures — leading production incident response, mentoring teams and shipping applications that serve millions of users.",
    "Current focus: LLM copilots, RAG pipelines and autonomous agents wired into real products, with 30–50% backend performance gains to show for the plumbing underneath.",
  ],
  facts: [
    { k: "BASE", v: "Metro Manila, Philippines" },
    { k: "EXPERIENCE", v: "9+ years · 11 roles" },
    { k: "FOCUS", v: "AI systems · fintech · enterprise platforms" },
    { k: "STACK", v: "React · Next.js · Spring Boot · Node · Python" },
    { k: "CLOUD", v: "AWS · GCP · Azure · Docker · Kubernetes" },
    { k: "EDUCATION", v: "BS Information Technology" },
  ],
};

export const heroStats = [
  { v: "9+", k: "YEARS SHIPPING" },
  { v: "99.9%", k: "PROD UPTIME" },
  { v: "30–50%", k: "BACKEND PERF GAINS" },
  { v: "15+", k: "APIS IN PRODUCTION" },
];

export const navLinks = [
  { label: "WORK", href: "#work" },
  { label: "PROJECTS", href: "#projects" },
  { label: "ABOUT", href: "#about" },
  { label: "PIPELINE", href: "#pipeline" },
  { label: "CONTACT", href: "#contact" },
];

// ponytail: THETECHNGANI href is a placeholder — drop in the real URL when ready.
export const socials = [
  { label: "EMAIL", href: "mailto:louismadrigal26@gmail.com" },
  { label: "GITHUB", href: "https://github.com/louis2688" },
  { label: "LINKEDIN", href: "https://www.linkedin.com/in/louismadrigal/" },
  { label: "THETECHNGANI", href: "#" },
  { label: "PHONE", href: "tel:+639491861717" },
  { label: "RESUME", href: "https://docs.google.com/document/d/1Yhvrn8TQPvSiar0MjhmrGyVA1yjQlXvhQ4r4ESppTJA/edit?usp=sharing" },
];

export type Project = {
  title: string;
  client: string;
  role: string;
  period: string;
  tag: string;
  desc: string;
  span?: "lg" | "wide";
};

export const projects: Project[] = [
  {
    title: "DIGITAL WALLET AT NATIONAL SCALE",
    client: "GCASH PHILIPPINES",
    role: "Senior Full Stack Developer",
    period: "2025—2026",
    tag: "FINTECH / AI",
    desc: "LLM copilots, RAG pipelines and high-throughput payment APIs for one of the Philippines' largest mobile wallets. SSR cut first paint by 40%.",
    span: "lg",
  },
  {
    title: "ENTERPRISE TELECOM PLATFORMS",
    client: "TELUS INTERNATIONAL",
    role: "Senior Full Stack Developer",
    period: "2024—2025",
    tag: "AI AGENTS",
    desc: "Autonomous multi-agent systems plus 15+ production APIs for a Fortune 500 telco.",
  },
  {
    title: "SERVERLESS CRM & IDENTITY",
    client: "ACCENTURE",
    role: "Senior Software Engineer",
    period: "2021—2023",
    tag: "CLOUD / OKTA",
    desc: "AWS Lambda architecture and Okta SSO for 10,000+ enterprise users; ops cost down 25%.",
  },
  {
    title: "CUSTOM CRM PLATFORM",
    client: "S5 GROUP OF COMPANIES",
    role: "Lead Developer — team of 5",
    period: "2021—2022",
    tag: "LEAD / GDPR",
    desc: "2x load-speed gains, GDPR-compliant identity and sub-second queries over 50k+ records.",
    span: "wide",
  },
  {
    title: "REALTIME MOBILE & DATAVIZ",
    client: "MULTISYS TECHNOLOGIES",
    role: "Web & Mobile Developer",
    period: "2019—2020",
    tag: "MOBILE / PIXIJS",
    desc: "React Native apps from one codebase, PixiJS visualizations driven by RxJS event streams.",
    span: "wide",
  },
  {
    title: "THETECHNGANI",
    client: "FOUNDER — CONTENT BRAND",
    role: "Tech community",
    period: "ONGOING",
    tag: "COMMUNITY",
    desc: "Development insights, tutorials and industry trends for Filipino engineers.",
    span: "wide",
  },
];

export const pipeline = [
  {
    name: "DISCOVER",
    desc: "Requirements, domain mapping, user flows. Every build starts with the problem, not the stack.",
    tools: "AGILE · SPRINT ZERO",
  },
  {
    name: "ARCHITECT",
    desc: "System design, data models, cloud topology. Microservices only where they earn their keep.",
    tools: "SPRING BOOT · POSTGRES · AWS/GCP",
  },
  {
    name: "BUILD",
    desc: "Server-rendered frontends and typed APIs — the 40% faster first paint at GCash came from here.",
    tools: "REACT · NEXT.JS · NODE · TS",
  },
  {
    name: "INTEGRATE AI",
    desc: "LLM copilots, RAG pipelines and multi-agent workflows wired into real products, not demos.",
    tools: "CLAUDE · GPT · OLLAMA · N8N",
  },
  {
    name: "HARDEN",
    desc: "OAuth2, JWT, Okta, PCI-DSS compliance and 90%+ test coverage before anything ships.",
    tools: "OKTA · JEST · CYPRESS",
  },
  {
    name: "SHIP",
    desc: "Containerized deploys behind CI/CD gates — release cycles cut from hours to under 20 minutes.",
    tools: "DOCKER · K8S · GITHUB ACTIONS",
  },
  {
    name: "OBSERVE",
    desc: "99.9% uptime, production incident response and the tuning behind 30–50% backend gains.",
    tools: "CLOUDWATCH · GRAFANA",
  },
];

export type ProjectDone = {
  name: string;
  desc?: string;
  live?: string;
  github: string;
};

// "Projects Done" — side projects & tools. Screenshots not supplied, so cards are text-only.
// Drop a screenshot path onto any entry later and wire it into ProjectsDone.tsx.
export const projectsDone: ProjectDone[] = [
  { name: "GrowthOS", live: "https://www.launchlift.app", github: "https://github.com/louis2688/growthos" },
  { name: "Business Operation Management System", live: "https://boms-delta.vercel.app/", github: "https://github.com/louis2688/boms" },
  { name: "Brain Injury Management System", live: "https://bims-sigma.vercel.app", github: "https://github.com/louis2688/bims" },
  { name: "ChatLayer", desc: "Secure n8n chat, multi-tenant.", live: "https://chatlayer.vercel.app", github: "https://github.com/louis2688/chatlayer" },
  { name: "PresyoGasPH", desc: "Track fuel prices across Metro Manila.", live: "https://presyogasph.vercel.app", github: "https://github.com/louis2688/PresyoGasPH" },
  { name: "Tempest CRM", desc: "AI-powered CRM.", live: "https://ai-powered-crm-lemon.vercel.app", github: "https://github.com/louis2688/ai-powered-crm" },
  { name: "PinoyAppBuilder", desc: "A collection of apps built by Pinoy devs.", live: "https://pinoyappbuilder.vercel.app", github: "https://github.com/louis2688/pinoyappbuilder" },
  { name: "LargaNa", desc: "Ride-hailing app.", live: "https://largana.vercel.app", github: "https://github.com/louis2688/LargaNa" },
  { name: "AI Engineering OS", desc: "AI-powered engineering OS.", live: "https://aeios-five.vercel.app", github: "https://github.com/louis2688/AIEOS" },
  { name: "Louis Jarvis AI Assistant", desc: "A simple AI-powered Jarvis assistant.", live: "https://jarvis-ai-louis.vercel.app", github: "https://github.com/louis2688/Custom-Jarvis-AI" },
  { name: "SVR Booking", desc: "A vehicle booking app.", live: "https://svr-booking-dar.vercel.app", github: "https://github.com/louis2688/svr-booking" },
];

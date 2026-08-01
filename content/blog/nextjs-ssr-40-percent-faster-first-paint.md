---
title: "Next.js SSR Migration: Cutting First Paint by 40%"
description: How a CSR to SSR migration cut first paint by 40% on a national-scale fintech frontend — what moved the number in Next.js, and when SSR isn't worth it.
date: 2026-06-10
tags: nextjs, ssr, performance, web-vitals
---

On a mobile wallet, first paint is not a vanity metric. Users open the app to pay for something that is happening right now — a jeepney fare, a bill due today, a store clerk waiting. Every second of blank screen is a second of doubt. At GCash, a national-scale mobile wallet serving millions of users, I worked on migrating a client-side rendered frontend to server-side rendering with Next.js. First paint dropped by 40%. This is what actually did it, what didn't, and what I'd skip next time.

## Why CSR was the bottleneck

The original app was a classic single-page app. The HTML response was essentially an empty `<div id="root">` and a script tag. Before the user saw anything meaningful, the browser had to:

1. Download the JavaScript bundle
2. Parse and execute it
3. Fire the API calls the components needed
4. Render the result

That's a serial waterfall, and every step ran on the user's device. Our users are overwhelmingly on mid-range Android phones over mobile networks. A bundle that parses instantly on an M-series MacBook takes real, painful time on a device with a fraction of the single-core performance. And the API waterfall couldn't even start until the JS had executed — the server sat idle while the phone did all the work.

The lesson that took me too long to internalize: on CSR, your time-to-first-paint is gated by your slowest user's device, not your fastest server.

## What actually moved the number

Four changes, in descending order of impact.

### 1. Render the shell on the server

The single biggest win was boring: return real HTML. The layout, navigation, balance card skeleton, and above-the-fold content came back in the initial response instead of being assembled client-side.

Before, sketched:

```tsx
"use client";

export default function Home() {
  const { data, isLoading } = useHomeData(); // fires after JS loads
  if (isLoading) return <Spinner />;
  return <Dashboard data={data} />;
}
```

After:

```tsx
// Server component — data fetch runs next to the data, not on the phone
export default async function Home() {
  const home = await getHomeData();
  return <Dashboard data={home} />;
}
```

The fetch now runs in the data center, milliseconds from the backend, instead of over a mobile radio. The phone's first job is painting HTML — something browsers are extremely good at — not booting a framework.

### 2. Stream the slow parts

Not everything above the fold is equally fast to fetch. One slow upstream call used to hold the whole page hostage. Streaming with Suspense fixed that: the shell flushes immediately, slow sections arrive when ready.

```tsx
export default async function Home() {
  const core = await getCoreData(); // fast, blocking
  return (
    <Shell>
      <Dashboard data={core} />
      <Suspense fallback={<PromoSkeleton />}>
        <Promotions /> {/* slow upstream — streams in later */}
      </Suspense>
    </Shell>
  );
}
```

This decoupled our first paint from our slowest dependency. It also changed team behavior: once the page stopped waiting for slow services, nobody could hide a slow endpoint behind "the page is loading anyway."

### 3. Delete client JavaScript

SSR doesn't help much if you ship the same bundle and re-run everything on the client. We audited what actually needed interactivity. Most of the page didn't — static content, formatted amounts, lists. Those became server components with zero client-side JS. Client components shrank to the genuinely interactive islands: forms, buttons, the parts that respond to touch.

Less JS shipped means less to download, less to parse, and — the part I underestimated — less to hydrate.

### 4. Cache the shell at the edge

Server rendering moves work from the phone to your servers. At millions of users, that bill arrives fast. The escape hatch is caching: the logged-out shell and non-personalized sections are identical for everyone, so serve them from the CDN.

```
Cache-Control: public, s-maxage=300, stale-while-revalidate=600
```

Five minutes fresh, ten minutes of serving stale while revalidating in the background. Most requests never touch the origin, and the ones that do are the genuinely personalized ones.

## What surprised me

**Hydration is not free.** Our first cut server-rendered everything and hydrated everything. First paint improved, but time-to-interactive barely moved — the phone still parsed and executed nearly the same JS, just later. The paint was faster; the app wasn't. The real gains came from step 3, cutting the client bundle, not from SSR alone. SSR without JS reduction is a nicer loading screen.

**Personalization fights cacheability.** A wallet home screen is personal — your balance, your transactions. Personal responses can't be shared-cached, which threatens the whole edge strategy. The pattern that worked: server-render and cache the anonymous shell, then fetch personal data client-side after paint, into slots that are laid out and sized in the cached HTML. You paint fast for everyone and personalize a beat later without layout shift. It feels like a step backward — client fetching again! — but it's client fetching for one small payload, after the page is already visible.

**The migration is organizational, not technical.** Moving data fetching to the server means the frontend team now owns server capacity, timeouts, and upstream retries. Half our incidents during the migration were about server-side fetch behavior nobody had needed to think about before, like an upstream timeout taking down rendering instead of showing a spinner. Budget for that.

## When not to bother

SSR is not a default. I'd skip it when:

- **The app lives behind a login and sessions are long.** A dashboard someone keeps open all day loads once. Optimizing first paint there is optimizing the least common event in the product.
- **Your users are on fast devices and networks.** The CSR tax is real but small on modern hardware. If your audience is developers on fiber, measure before migrating.
- **You can't cache and can't afford the servers.** SSR converts client CPU into server CPU. If every page is fully personalized and traffic is high, you're buying a fleet to save milliseconds. Do the bundle diet first — it's cheaper and helps regardless.
- **The bundle is the actual problem.** If your JS is bloated, SSR hides the symptom. Cutting the bundle helps CSR and SSR alike; do it before any migration, not after.

The 40% didn't come from a framework flag. It came from doing less work on the user's device: real HTML first, streaming for the slow parts, aggressively less JavaScript, and a CDN doing the repetitive rendering. The framework made those patterns ergonomic — but the patterns are the point.

## Work with me

I build and speed up production web systems — fintech scale, measurable results. [Get in touch](/#contact) if you want this kind of work done on yours.

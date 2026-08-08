---
title: A Codebase Knowledge Graph With No Embeddings
description: I ran a knowledge graph over my own Next.js codebase — 207 nodes, zero tokens, no vector store. What it confirmed, what it caught, and where graphs beat RAG.
date: 2026-08-09
tags: knowledge-graph, code-analysis, rag, tooling
---

I spend most of my time building retrieval systems that answer questions over documents. So when I found [graphify](https://github.com/Graphify-Labs/graphify) — a tool by Graphify-Labs that turns a codebase into a queryable knowledge graph using deterministic AST parsing instead of embeddings — I wanted to know whether the no-vector-store claim held up on real code.

I pointed it at this portfolio. Small target on purpose: 37 files, about 13,700 words of source. If a tool is going to tell me something I don't already know, it should struggle most on a codebase I wrote myself last week.

## What came back

```
207 nodes · 271 edges · 21 communities
Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS
Token cost: 0 input · 0 output
```

That last line is the interesting one. The whole graph was built by parsing syntax trees — no model call, no embedding pass, no API bill. The `update` subcommand re-extracts changed files with a SHA256 cache, so re-running after an edit costs nothing but disk.

The extraction breakdown matters too. Every edge is labelled `EXTRACTED`, `INFERRED`, or `AMBIGUOUS`, and on this run all 271 were extracted — meaning each one traces to a real import or call site with a file and line number, not a guess. A retrieval system that tells you which claims it is confident about is doing something most RAG pipelines skip.

## What it confirmed

The most-connected nodes it reported:

```
compilerOptions  16 edges
getPosts()       11 edges
SITE_URL          8 edges
projectSlug()     8 edges
loadGsap()        7 edges
```

`getPosts()` sitting near the top is correct and slightly uncomfortable. It reads the markdown files for this blog, and the graph shows it feeding the blog index, the static params generator, the RSS route and the sitemap. One function is the load-bearing wall under every piece of content routing on the site. That's fine at 5 posts. It's the first thing I'd cache at 500.

`SITE_URL` is the one that actually paid for the run. Expanding it:

```
SITE_URL  (data/content.ts L4)
  <-- layout.tsx           [imports]
  <-- sitemap.ts           [imports]
  <-- robots.ts            [imports]
  <-- blog/page.tsx        [imports]
  <-- blog/[slug]/page.tsx [imports]
  <-- projects/[slug]/page.tsx [imports]
  <-- rss.xml/route.ts     [imports]
```

Seven importers. A week earlier this site had its production domain hardcoded as a string in four separate files, which is exactly how a canonical URL ends up pointing at a stale deployment in one place and the real domain in another. Hoisting it to a single constant made the later domain switch a one-line edit. I knew that in the abstract. Seeing seven inbound edges on one node is the version you can show someone.

It also reported no import cycles, which on a Next.js app with shared data modules is worth knowing rather than assuming.

## Where it earns its keep

Here is the honest limit: on 37 files, a graph mostly confirms what the author already knows. I wrote this codebase. Nothing in the report genuinely surprised me.

The value shows up on the axes that scale:

- **Determinism.** Every edge has a file and a line. When a tool says `sitemap() calls getPosts()`, that is a parsed fact, not a plausible-sounding sentence. I have spent enough time chasing confidently wrong LLM answers about code to weight this heavily.
- **Cost curve.** Zero tokens at 37 files is a nice trick. Zero tokens at 3,700 files is a different product. Embedding a large monorepo, then re-embedding it every sprint, is a line item.
- **Persistence.** The graph is a JSON file on disk. Query it next month without re-reading anything.

## Graphs and vectors solve different problems

I wrote previously about [what shipping RAG pipelines to production actually taught me](/blog/production-rag-pipelines-lessons), and the biggest lesson there was that retrieval quality beats model choice. This is the same argument from another direction.

Embedding retrieval answers fuzzy questions. *What does this project say about authentication?* Cosine similarity over chunks is a good tool for that, because the question is semantic and the answer might be phrased ten different ways.

Graph traversal answers structural questions. *What breaks if I change this function?* That is not a similarity problem. There is a correct answer, it is finite, and it is derivable from the syntax tree. Asking an embedding index for it means hoping the right chunks surface — and when they don't, you get an answer that is fluent and incomplete, which is the worst failure mode in code work.

Chunk-based retrieval also destroys exactly the information you need here. A function and its caller usually live in different files, so they land in different chunks with no edge between them. The relationship is the thing you were asking about, and chunking is the step that threw it away.

The practical read: use vectors for prose, use graphs for structure, and be suspicious of any tool that claims one covers both.

## Would I run it on a client codebase

Yes, and that is the real test. The first week on an unfamiliar enterprise repo is spent building a mental model that the codebase already contains — which modules are hubs, what depends on the thing you were asked to change, where the cycles are. A zero-cost deterministic pass at the structure is a faster starting point than grep and hope.

Two caveats from one run. The god-node list is degree-ranked, so config objects like `compilerOptions` outrank real abstractions — read past the top entry. And one file in my repo produced zero nodes and dropped out of the graph silently apart from a warning; on a big codebase I'd want to check what didn't get parsed before trusting coverage.

Neither is a reason to skip it. Both are reasons to read the report rather than the headline number.

Credit where it belongs: graphify is built by [Graphify-Labs](https://github.com/Graphify-Labs/graphify), not by me. I'm just a user who wanted to see whether the deterministic approach survived contact with a real repo. It did.

## Work with me

I build retrieval and AI systems for production — and I'm equally happy being the person who tells you your codebase doesn't need one. [Get in touch](/#contact)

---
title: Building GrowthOS: Turning a Goal into an AI Agent Workflow
description: The engineering story behind GrowthOS: designing an AI agent workflow that turns a marketing goal into channels, plans, and spam-safe copy for indie hackers.
date: 2026-08-02
tags: ai-agents, indie-hacking, llm, product
---

By day I build LLM copilots and autonomous agents for a national-scale fintech. Nights and weekends over the past few months, I built GrowthOS — an AI platform that turns a marketing goal into executable growth campaigns for indie hackers. This is the engineering story of building an AI marketing agent solo: what the workflow actually looks like, and why the LLM turned out to be the least interesting part.

## Growth is a planning problem

The naive version of this product is a chat box. "Help me market my app" in, a wall of confident advice out, and by tomorrow it's buried in scroll history. I built that version in a weekend and it was useless, which was the most instructive thing about it.

What indie hackers lack isn't ideas — it's decomposition. "Get my first users" is fuzzy. It has to become channels (which specific communities), each channel a plan (what to do there, in what order), each plan concrete todos (a thing you can finish today). That decomposition is the product. The LLM helps at every step, but the structure carries the value.

So GrowthOS is built around a strict hierarchy — Goal → Channels → Plans → Todos — with every node persisted to a dashboard. Agents write into the structure; nothing lives only in chat.

```ts
type Todo = {
  planId: string;
  action: string;          // one concrete task, finishable in a sitting
  copy?: string;           // pre-drafted, eval-gated (see below)
  utmUrl?: string;         // generated per channel, per task
  imagePrompt?: string;
  postingWindow?: string;  // when this community is actually awake
};
```

Making a todo a row instead of a paragraph is what makes everything else attachable. UTM links, image prompts, optimal posting windows — those aren't extra features, they're columns hanging off a stable entity. You can't attach a tracking link to a paragraph in a chat log.

The trade-off: schema-constrained generation is fussier than free text. Structured output fails, retries add latency, and forcing decomposition occasionally flattens a genuinely good freeform suggestion. I take the trade every time. Chat output evaporates; rows compound.

## Live search beats a stale model

Ask any LLM which subreddits to post your dev tool in and you get a plausible list frozen at its training cutoff. My first version did exactly this. Some recommendations had banned self-promotion since then. One had gone quiet entirely. Model memory is a cache with no invalidation.

So channel discovery in GrowthOS is handled by agents that run real-time web search: find the subreddits, communities and niche directories where the target audience is active right now, and check what is actually happening there before recommending anything. Every channel suggestion is grounded in something the agent just read, not something the model once memorized.

This is the same lesson as retrieval in RAG: the model is a reasoning engine, not a database. Fresh context in, useful answer out.

The community finder also became a free standalone tool, separate from the campaign flow — partly a top-of-funnel play, mostly because it was the piece I kept wanting by itself.

## Red-teaming my own copywriter

The failure mode that scared me most wasn't bad copy. It was copy that gets a user banned. Reddit and niche communities have immune systems: no-self-promo rules, disclosure norms, moderators who have seen every drive-by launch post. An AI marketing tool that generates generic promotional copy is a ban-generation machine.

So every copywriting prompt in GrowthOS is battle-tested against an adversarial eval suite before it ships. I call them compliance evals. The suite generates drafts across a spread of scenarios, then attacks each one: does it read community-native or like an ad? Does it lead with value or with the link? Does it disclose that the poster built the thing? Does it trip known spam triggers?

```python
CHECKS = [
    ("missing_disclosure", lambda d: mentions_product(d) and not discloses(d)),
    ("link_first",         lambda d: d.strip().startswith("http")),
    ("spam_phrases",       lambda d: any(p in d.lower() for p in SPAM_PHRASES)),
    ("no_value",           lambda d: value_sentences(d) < 2),
]

def gate(prompt_version):
    drafts = generate(prompt_version, scenarios=SCENARIOS)
    failures = [(name, d) for d in drafts
                for name, check in CHECKS if check(d)]
    return len(failures) == 0, failures
```

A prompt change that fails the gate doesn't ship, exactly like a failing test suite. This slowed me down early, and it was still the right call: a copy generator you can't trust in public is worse than none at all.

## What the day job carried over

Almost everything above is a transplant from shipping agents in production. The mapping, roughly:

- The golden question set from my [production RAG pipelines](/blog/production-rag-pipelines-lessons) work became the compliance eval suite. Same discipline: measure before you tune, gate before you ship.
- Designing the failure path first became the persistent dashboard. When an agent run dies mid-campaign, the hierarchy holds partial state — you lose one todo, not the plan.
- Intent routing became agent scoping. Not every step needs a big model with search access. Decomposing into small, single-purpose agent calls is cheaper and far easier to debug than one god-agent holding every tool.

The solo-builder twist: there's no reviewer between the agent and the user. At work, output passes through people before it reaches anyone. On a side project, the eval suite is the reviewer. That isn't a compromise — it's more rigor than most teams apply to prompts, forced on me by having no other safety net.

## Ship it

GrowthOS is live and free during early access at [launchlift.app](https://www.launchlift.app/). If you're building an agent product, my compressed advice: the model is the easy part. The schema, the grounding, and the evals are the product.

## Work with me

I design and ship AI agent systems — for a national-scale fintech by day, for indie products like GrowthOS on my own time. [Get in touch](/#contact)

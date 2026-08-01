---
title: "Production RAG Pipelines: What Shipping Them Actually Taught Me"
description: "Field notes on production RAG pipelines from a national-scale fintech — retrieval quality, evaluation harnesses, latency budgets, and guardrails."
date: 2026-07-29
tags: rag, llm, retrieval, production
---

A RAG demo takes an afternoon. Loader, splitter, vector store, prompt — done, and it answers your first ten questions beautifully. The production version took me months, and almost none of that time went into the parts the tutorials cover.

I've built LLM copilots and RAG pipelines at GCash, one of the Philippines' largest mobile wallets, on systems serving millions of users, and AI agents on enterprise telecom platforms at Telus International before that. Different domains, same lesson: the gap between demo and production is not the model. It's everything around retrieval.

These are the field notes. Patterns and mistakes, no proprietary internals.

## Retrieval quality beats model choice

The most common failure I saw was blaming the LLM for answers that were wrong before the LLM ever ran. If the retriever hands the model the wrong passages, no model upgrade saves you. Garbage in, confident garbage out.

Three things moved retrieval quality more than any model swap:

**Chunking that respects document structure.** Fixed-size splitting is where everyone starts and where the first bugs live. A 500-token window that cuts a fee table in half produces a chunk that says fees exist and another that says what they are, and neither retrieves well alone. In fintech, where the corpus is policy documents, FAQs, and procedure guides, splitting on headings and keeping tables intact beat every clever token-count heuristic I tried.

```python
def chunk_by_heading(doc: str, max_tokens: int = 700) -> list[dict]:
    """Split on markdown headings; only fall back to size splits
    inside a section, never across one."""
    chunks = []
    for section in re.split(r"(?=^#{1,3} )", doc, flags=re.M):
        title = section.split("\n", 1)[0].strip("# ")
        for piece in split_if_oversized(section, max_tokens):
            chunks.append({
                "text": piece,
                "metadata": {
                    "section": title,       # for filtering
                    "doc_type": ...,        # policy / faq / procedure
                    "effective_date": ...,  # newest wins on conflict
                },
            })
    return chunks
```

**Metadata filters before vector search.** Pure semantic search across a whole corpus retrieves things that are similar but wrong — last year's policy, a different product's FAQ. Attaching document type and effective date at ingestion, then filtering before the similarity search, killed a whole class of "confidently outdated" answers. This is boring database thinking, and it outperformed every embedding upgrade.

**Hybrid search.** Embeddings are bad at exact identifiers — product codes, error codes, transaction types. Users search for exactly those. Combining BM25-style keyword matching with vector search and merging the results fixed queries that pure semantic retrieval simply could not handle. If your users type codes and IDs, you need lexical search. Full stop.

## Evaluate before you scale

My biggest early mistake: tuning by vibes. Change the chunk size, ask five familiar questions, feel good, ship. Then a regression shows up in a query nobody on the team thought to try.

The fix is unglamorous: a golden question set. Fifty to a couple hundred real questions — pulled from actual user queries where possible — each with the doc IDs that should be retrieved and the facts the answer must contain. Run it on every pipeline change, exactly like a test suite.

You don't need an evaluation platform to start. A script is enough:

```python
def score_retrieval(golden_set, retriever, k=5):
    hits, misses = 0, []
    for case in golden_set:
        got = {c.doc_id for c in retriever.search(case.question, k=k)}
        if got & set(case.expected_doc_ids):
            hits += 1
        else:
            misses.append(case.question)
    return hits / len(golden_set), misses

def check_groundedness(answer: str, chunks: list[str], judge) -> bool:
    """Every claim in the answer must be supported by a retrieved chunk.
    LLM-as-judge is imperfect — spot-check it by hand weekly."""
    return judge.supports(answer=answer, evidence=chunks)
```

Two metrics carried most of the weight. Retrieval hit rate: did the right document land in the top k at all? If not, nothing downstream matters, so debug retrieval first. Groundedness: is every claim in the answer supported by the retrieved text? This is the hallucination catch, and it's the one that matters in a regulated domain, because a fluent answer inventing a policy detail is worse than no answer.

The golden set is also where trade-offs become visible instead of anecdotal. Bigger chunks improved answer completeness and hurt retrieval precision on my corpus. Without the harness, that's two engineers arguing. With it, it's a number.

## Latency and cost are architecture problems

A RAG call is an embedding call plus a vector search plus an LLM call, and users compare it to search boxes that respond instantly. On payment-scale traffic, you cannot brute-force this. The same discipline behind the 30–50% backend performance gains I've squeezed out of conventional services applies here — measure, cache, cut work.

What actually helped:

- **Cache embeddings.** Query distributions are heavily skewed; the same questions arrive constantly. Hashing normalized query text to a cached embedding is cheap and safe.
- **Cache full answers for the head of the distribution.** For high-frequency questions against a slow-changing corpus, a semantic cache — reuse the answer when a new query is close enough to a cached one — skips the whole pipeline. The trade-off is staleness, so invalidate on document updates, which is another reason metadata like effective dates earns its keep.
- **Skip retrieval entirely when it adds nothing.** Greetings, chitchat, account-specific questions that need an API call rather than a document — none of these should touch the vector store. A lightweight intent router in front of the pipeline cut a surprising amount of cost and latency. The naive version retrieves on every turn; the production version treats retrieval as one tool among several.

None of this is exotic. It's the same caching-and-routing engineering that keeps any high-throughput API at 99.9% uptime, applied to a pipeline people assume is special because an LLM sits at the end.

## Guardrails: plan for empty and plan for wrong

Retrieval will come back empty, and worse, it will come back plausible-but-wrong. The demo ignores both. Production cannot, especially when the subject is someone's money.

Rules I now treat as defaults:

- **Empty or low-confidence retrieval means saying so.** If nothing clears the similarity threshold, the model must decline and route to a human or a help page — not answer from parametric memory. An LLM asked about a topic with no supporting context will improvise, and in fintech an improvised answer about fees or limits is an incident.
- **Ground every answer in citations.** Forcing the model to cite retrieved chunks, and rejecting answers that cite nothing, converts silent hallucination into a detectable failure you can log and alert on.
- **Fallbacks are product decisions, not exception handlers.** What the user sees when the pipeline fails — a graceful handoff versus a stack-trace-shaped apology — matters more to trust than the median-case answer quality. Decide it deliberately, early.
- **Log the full retrieval trace.** Query, filters, retrieved chunk IDs, scores, final answer. When someone reports a bad answer — and they will — this trace is the difference between a five-minute diagnosis and a shrug. It also becomes the feed for the next round of golden questions.

I keep relearning the same meta-lesson from years of backend work: the reliability of a system is set by how it behaves at the edges, not the happy path. RAG is no exception; it just fails more fluently.

If I had to compress all of this into one line: treat RAG as a retrieval system with an LLM attached, not an LLM with a retrieval accessory. The teams that debug retrieval first, measure before tuning, and design the failure paths ship copilots that survive contact with real users. The rest ship demos.

## Work with me

I build LLM copilots, RAG pipelines, and the production systems underneath them — currently at national-scale fintech, previously enterprise telecom, always with the boring reliability work included. [Get in touch](/#contact)

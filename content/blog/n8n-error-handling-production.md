---
title: "n8n Error Handling in Production: Retries, Alerts, Idempotency"
description: "How to make n8n workflows fail safely: an error workflow that links to the failed run, retries that don't make things worse, error outputs, and idempotent webhooks."
date: 2026-09-22
tags: n8n, error-handling, reliability, automation
---

n8n workflows rarely fail loudly. They fail at 3am, halfway through a batch, after the CRM update ran but before the Slack message did — and the first person to notice is a customer asking why they got two invoices. The editor makes the happy path easy to build. Production is everything else.

I run n8n in production behind the agent workflows at GrowthOS, and I have spent years on systems where a silent failure costs real money — payment APIs at GCash, agent platforms at Telus. The discipline transfers directly. This is the checklist I apply to an n8n workflow before I call it done.

## 1. Give every workflow an error workflow

Any n8n workflow can name an **error workflow** in its settings. When a production execution fails, n8n starts that workflow with an **Error Trigger** node carrying what went wrong: the workflow name, the node that failed, the error message and a link to the failed execution.

Build one shared error workflow and point every production workflow at it:

- **Error Trigger** → a **Code** node that formats the message → **Slack**, email, or whatever your team actually reads.
- Set it under **Settings → Error workflow** on each workflow. Make it part of your definition of done; the workflow you forget is the one that breaks.

The formatting step, including the case where the trigger itself failed and there is no execution to link to:

```js
// Code node, "Run Once for All Items"
const { workflow, execution, trigger } = $input.first().json;
const where = execution?.lastNodeExecuted ?? "the trigger";
const message = execution?.error?.message ?? trigger?.error?.message ?? "unknown error";

return [{
  json: {
    text: [
      `n8n: "${workflow.name}" failed at ${where}`,
      message,
      execution?.url ?? "(no execution link: the trigger failed)",
    ].join("\n"),
  },
}];
```

The execution link is the part that matters. An alert that says "something failed" gets ignored by week two. An alert that links straight to the failed run, with its input data still attached, gets fixed. n8n builds that link from your instance's base URL, so set it correctly if you self-host.

Two caveats. The error workflow only fires for production executions, not manual test runs. And it doesn't fire when a node handles its own failure — which is the next tool.

## 2. Retry what's transient, fail fast on what isn't

Most nodes have **Retry On Fail** in their settings, with a maximum number of tries and a wait between them. It is the cheapest reliability win in n8n, and the easiest to misuse.

Retry when the failure is about timing: a 429 rate limit, a 503, a network timeout, an LLM provider having a bad minute. Don't retry when the failure is about the data: a 400, a 401, a validation error. Retrying a bad request three times just fails three times slower — and if the node isn't idempotent, a retry can succeed twice.

Defaults that hold up well:

- **External APIs and LLM calls:** retries on, a few tries, a few seconds apart.
- **Writes that aren't idempotent** (sending an email, charging a card, creating a record without a unique key): retries off until you have made them idempotent. Section 4 covers how.
- **Rate-limited APIs:** fix the rate instead of retrying into it. The HTTP Request node's batching option spaces requests out; retries are for the occasional spike, not the steady state.

The built-in wait is fixed rather than exponential. If a strict API needs real backoff, build it with a Wait node and a retry counter.

## 3. Catch failures per item with error outputs

By default, a failing node stops the whole workflow. For a batch — 200 leads, 50 invoices — that is usually wrong. One malformed record shouldn't block the other 199.

Set the node's **On Error** setting to **Continue (using error output)**. The node grows a second output: successful items leave through the top, failed items through the bottom with the error attached. Route that bottom branch somewhere durable — a failed-items table, a sheet, a queue — with enough context to replay it later. Avoid plain **Continue**: it sends the error down the happy path as if it were data.

Two rules keep this honest:

- **Every error output goes somewhere.** An error branch that ends in nothing is just a slower way to lose data.
- **Alert on volume, not on every item.** One failed record in a batch is a row in a table. Half the batch failing is an incident. Count failures at the end of the run and alert when the count crosses a threshold.

And when the data is wrong in a way n8n can't see — an LLM returned a field you can't parse, a total that doesn't add up — fail on purpose with a **Stop and Error** node. It raises a real error, so your error workflow fires. A silent "success" with garbage output is the worst failure mode there is.

## 4. Make webhooks and writes idempotent

Retries — yours, n8n's, or the sender's — mean the same event will eventually arrive twice. Stripe retries webhook deliveries, and so do most platforms that send them. If your workflow creates a record or sends a message on every delivery, duplicates are only a matter of time.

The fix is an **idempotency key**: a value that is identical for the same event however many times it arrives. Use the sender's event ID, or a natural key like source plus record ID. Check the key before any side effect, and record it after the side effect succeeds.

```js
// Code node, "Run Once for Each Item": derive a stable key per event
return {
  json: {
    ...$json,
    idempotencyKey: `${$json.source}:${$json.eventId}`,
  },
};
```

Store processed keys in a table with a unique constraint and let the database reject duplicates — that is the race-safe version. For simpler flows, n8n's **Remove Duplicates** node can drop items it has already seen in previous executions.

Webhooks have a second trap: the sender's timeout. If your workflow takes 40 seconds and the sender gives up at 10, it retries while your first run is still going. For slow work, set the **Webhook** node to respond immediately and do the processing after the acknowledgement. Pair that with the idempotency key, and a duplicate delivery becomes a no-op instead of a double charge.

## 5. Put limits on everything

- **Workflow timeouts.** Set a timeout in the workflow settings so a hung HTTP call or a stuck loop fails, and alerts, instead of running forever.
- **LLM output.** Treat model output as untrusted input. Parse it against a schema — n8n's Structured Output Parser does a first pass — reject what doesn't fit, and decide in advance what happens when the model is wrong: retry once, fall back, or route it to a human. It is the same discipline I apply to production LLM work at a national-scale fintech. An automation that hallucinates unattended is a liability, not a feature.
- **Execution data.** Save failed production executions so you can debug them, and prune old execution data if you self-host. History grows fast, and a full disk takes down every workflow at once.

## Trade-offs, honestly

**This is more work than the happy path.** An error workflow, retry settings, error branches and idempotency checks can double the node count of a small workflow. For an internal automation that one person runs and watches, skip most of it; a failure alert is enough.

**Error outputs can hide problems.** Continuing past failures keeps batches moving, but if nobody reads the failed-items table, you have built a very tidy place for data to disappear. The alert-on-volume rule exists because of this.

**Sometimes the answer is code.** When a workflow needs transactions, complex retry logic or real test coverage, n8n should become the orchestrator and the hard part should move into a small service it calls. Knowing where that line sits matters more than any single setting.

## Work with me

If your n8n workflows are breaking quietly — or you are about to put one in front of customers — I do [n8n workflow audits](/n8n-automation-consultant): I find the failure modes, harden what is worth keeping and document it so your team can own it. For customer-facing chat, here is how I [secure multi-tenant n8n chat](/blog/multi-tenant-n8n-chat-gateway). Or just [get in touch](/#contact).
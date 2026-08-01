---
title: Designing a Secure Multi-Tenant Chat Gateway for n8n
description: "How to put a secure multi-tenant gateway in front of n8n chat webhooks: tenant auth via site keys, origin checks, rate limits, and conversation history."
date: 2026-07-08
tags: n8n, multi-tenant, webhook-security, architecture
---

n8n's chat trigger is a great demo tool. You drop a Chat Trigger node into a workflow, toggle it on, and n8n hands you a public webhook URL plus a hosted chat page. Ten minutes and you have an AI assistant answering questions from your workflow. I have built enough production systems — payment APIs at GCash, agent platforms at Telus — to know what happens next: someone pastes that webhook into a customer-facing site, and now a bare, unauthenticated endpoint is the entire security model.

This post is the architecture I ended up with instead: a gateway that sits between an embeddable chat widget and the n8n webhook. It is the design behind [Chatflowgate](https://www.chatflowgate.com/), but the pattern is generic. If you run n8n chat for more than one customer, or even one customer you care about, you will want most of this.

## What a bare n8n webhook doesn't give you

The chat trigger URL is a capability token. Anyone who has it can invoke your workflow. That means:

- **No caller identity.** You cannot tell customer A's traffic from customer B's, or either from a bot hammering the endpoint.
- **No rate limiting.** If the workflow calls an LLM, every request costs you money. A `while true; do curl ...; done` loop against your webhook is a denial-of-wallet attack.
- **No origin control.** The URL works from any site, any script, any country. Once it leaks — and URLs embedded in client-side code always leak — you can't un-leak it without breaking every integration.
- **No conversation history.** n8n gives you per-session memory inside the workflow if you wire it up, but nothing durable you can show a user next week or debug against.
- **No multi-tenancy.** One webhook, one workflow, one blob of traffic. Serving multiple customers means duplicating workflows and hoping nobody pastes the wrong URL.

None of this is a knock on n8n. The webhook is a trigger primitive, not a product surface. The mistake is exposing a primitive to the public internet.

## The gateway pattern

The fix is one hop of indirection:

```
browser widget  →  gateway  →  tenant's n8n webhook
   (public)       (your API)      (secret, server-side)
```

The widget only ever knows two things: the gateway URL and a **public site key**. The n8n webhook URL lives in the gateway's database, per tenant, and never reaches the client. The gateway does the boring, load-bearing work on every message:

1. **Tenant lookup** by site key. Unknown key, dead request.
2. **Origin check.** The site key is public by design — it ships in page source. So it can't be the whole story. Each tenant registers the domains they'll embed on, and the gateway rejects requests whose `Origin` header isn't on the list. A stolen site key is useless from someone else's site.
3. **Rate limiting**, keyed per tenant and per client IP, with limits that follow the tenant's plan.
4. **Persistence.** Every message in and out is written to a conversations table, scoped by tenant ID. History, audit trail, debugging — all fall out of this one table.
5. **Proxy** to the tenant's n8n webhook, server to server.

Site key plus origin allowlist is the same trust model Stripe uses for publishable keys and Google for Maps API keys. It is not secret-based auth — it is "public identifier, verified context." For an embeddable widget that must run in untrusted browsers, that is the honest option. Anything stronger requires the tenant's site to run server-side code, which kills the copy-paste embed.

## The proxy handler

The core of the gateway is smaller than people expect. A sketch, Next.js route handler style:

```ts
export async function POST(req: Request, { params }: { params: { siteKey: string } }) {
  const tenant = await getTenantBySiteKey(params.siteKey);
  if (!tenant) return new Response("unknown site key", { status: 401 });

  const origin = req.headers.get("origin") ?? "";
  if (!tenant.allowedOrigins.includes(origin)) {
    return new Response("origin not allowed", { status: 403 });
  }

  const allowed = await rateLimit(`${tenant.id}:${clientIp(req)}`, tenant.limits);
  if (!allowed) return new Response("slow down", { status: 429 });

  const { sessionId, message } = await req.json();
  await saveMessage(tenant.id, sessionId, "user", message);

  // The n8n webhook URL never leaves the server.
  const res = await fetch(tenant.n8nWebhookUrl, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ sessionId, chatInput: message }),
    signal: AbortSignal.timeout(30_000),
  });
  if (!res.ok) return new Response("workflow error", { status: 502 });

  const { output } = await res.json();
  await saveMessage(tenant.id, sessionId, "assistant", output);
  return Response.json({ output });
}
```

Real code adds input validation, CORS headers, and structured errors, but the shape holds. Note the timeout: an n8n workflow that hangs should fail your request, not pin a connection open forever.

The embed side is deliberately dumb — one script tag:

```html
<script
  src="https://your-gateway.example/widget.js"
  data-site-key="pk_live_9f2c..."
  defer
></script>
```

The script reads its own `data-site-key`, mounts the widget, and talks only to the gateway. No n8n URL anywhere in the page.

## Trade-offs, honestly

**The extra hop costs latency.** Every message now does browser → gateway → n8n instead of browser → n8n. In practice this is tens of milliseconds against an LLM call that takes seconds, so nobody notices. But it is not free, and if your workflow were sub-100ms the math would change.

**Webhook timeouts are your problem now.** n8n workflows can run long — a RAG lookup plus an LLM call plus a tool call adds up. The gateway has to pick a timeout, surface a decent error when it fires, and decide whether a timed-out request was actually processed. I log the outbound request before the fetch so a timeout still leaves an audit trail. There is no clean answer here, only a documented one.

**Streaming gets harder.** The n8n chat webhook responds with a complete payload; it doesn't stream tokens. So the gateway can't fake token-by-token streaming without lying. The options are: accept full-response latency and show a typing indicator, or move the LLM call out of n8n into the gateway and stream from there — which defeats the point of letting customers own their workflows. Chatflowgate takes the first option. I'd rather ship an honest spinner than a fake stream.

**One more moving part.** The gateway is a service you now deploy, monitor, and keep up. For a single internal chatbot, that's over-engineering — use the bare webhook behind your VPN and move on. The gateway earns its keep the moment there's a second tenant or a public embed.

## Where this ended up

I built this pattern once for myself, then realized every n8n user shipping a customer-facing chat has the same gap between "demo webhook" and "production surface." That became Chatflowgate: the widget, the gateway, tenant management, and conversation history as a hosted product, with your n8n webhook kept where it belongs — server-side and secret.

## Work with me

I build production AI systems — LLM copilots, RAG pipelines, and the boring infrastructure that keeps them safe at scale. If you need someone who has done this for millions of users, [Get in touch](/#contact).

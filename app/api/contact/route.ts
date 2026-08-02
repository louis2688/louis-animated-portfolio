const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ponytail: in-memory per-IP counter resets on cold start — upgrade to
// Upstash Ratelimit or a Vercel WAF rule if abuse actually happens.
const hits = new Map<string, { n: number; t: number }>();
const LIMIT = 5;
const WINDOW_MS = 3600_000;

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const now = Date.now();
    const h = hits.get(ip);
    if (!h || now - h.t > WINDOW_MS) hits.set(ip, { n: 1, t: now });
    else if (++h.n > LIMIT) {
      return Response.json({ error: "too many requests" }, { status: 429 });
    }

    const data = await req.json();
    // Strip CR/LF from anything that reaches the mail subject — header-injection hygiene.
    const name = String(data.name ?? "").replace(/[\r\n]+/g, " ").trim();
    const email = String(data.email ?? "").trim();
    const company = String(data.company ?? "").trim().slice(0, 200);
    const message = String(data.message ?? "").trim();
    const trap = String(data.contact_time ?? "").trim();

    // Honeypot: bots fill this hidden field. Pretend success, send nothing —
    // but log it so a silently dropped real lead is at least diagnosable.
    if (trap) {
      console.warn("contact honeypot hit", { name, email });
      return Response.json({ ok: true });
    }

    if (name.length < 1 || name.length > 100) {
      return Response.json({ error: "name must be 1–100 characters" }, { status: 400 });
    }
    if (email.length > 254 || !EMAIL_RE.test(email)) {
      return Response.json({ error: "invalid email" }, { status: 400 });
    }
    if (message.length < 10 || message.length > 5000) {
      return Response.json({ error: "message must be 10–5000 characters" }, { status: 400 });
    }

    const key = process.env.RESEND_API_KEY;
    if (!key) return Response.json({ error: "unconfigured" }, { status: 503 });

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        // launchlift.app is the one verified domain on the free Resend tier;
        // any address at it may send, so the portfolio borrows it.
        from: "Louis Madrigal Portfolio <portfolio@launchlift.app>",
        to: ["louismadrigal26@gmail.com"],
        reply_to: email,
        subject: `Portfolio inquiry — ${name}`,
        text: [
          `Name: ${name}`,
          `Email: ${email}`,
          `Company: ${company || "—"}`,
          "",
          message,
        ].join("\n"),
      }),
    });
    if (!res.ok) return Response.json({ error: "email provider rejected the send" }, { status: 502 });

    return Response.json({ ok: true });
  } catch {
    return Response.json({ error: "unexpected error" }, { status: 500 });
  }
}

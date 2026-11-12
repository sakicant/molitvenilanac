import { Redis } from "@upstash/redis";

// Works with either the direct Upstash integration (UPSTASH_REDIS_REST_*)
// or Vercel's KV / Marketplace naming (KV_REST_API_*).
const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
const redis = url && token ? new Redis({ url, token }) : null;

const KEY = "molitveni-lanac";
const EMPTY = { month: "", note: "", slots: {} };

function clean(body) {
  const out = { month: String(body.month || "").slice(0, 120), note: "", slots: {} };
  if (body.slots && typeof body.slots === "object") {
    for (const k of Object.keys(body.slots)) {
      if (Array.isArray(body.slots[k])) {
        out.slots[k] = body.slots[k]
          .map((x) => String(x).trim().slice(0, 80))
          .filter(Boolean)
          .slice(0, 50);
      }
    }
  }
  return out;
}

export default async function handler(req, res) {
  if (!redis) {
    return res.status(500).json({ error: "storage_not_configured" });
  }

  if (req.method === "GET") {
    const data = await redis.get(KEY);
    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json(data || EMPTY);
  }

  if (req.method === "POST") {
    const pass = req.headers["x-leader-pass"];
    if (!process.env.LEADER_PASSWORD || pass !== process.env.LEADER_PASSWORD) {
      return res.status(401).json({ error: "unauthorized" });
    }
    let body = req.body;
    if (typeof body === "string") {
      try { body = JSON.parse(body); } catch { return res.status(400).json({ error: "bad_json" }); }
    }
    if (!body || typeof body !== "object") {
      return res.status(400).json({ error: "bad_body" });
    }
    await redis.set(KEY, clean(body));
    return res.status(200).json({ ok: true });
  }

  res.setHeader("Allow", "GET, POST");
  return res.status(405).json({ error: "method_not_allowed" });
}

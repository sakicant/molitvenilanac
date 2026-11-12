import { Redis } from "@upstash/redis";

// Works with either the direct Upstash integration (UPSTASH_REDIS_REST_*)
// or Vercel's KV / Marketplace naming (KV_REST_API_*).
const url = process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN;
const redis = url && token ? new Redis({ url, token }) : null;

const KEY = "molitveni-lanac";
const EMPTY = { month: "", note: "", slots: {} };

// Početni raspored, uvezen iz postojećeg Excela. Prikazuje se dok baza
// još nema spremljenih podataka; čim voditelj nešto spremi, koristi se baza.
const SEED = { month: "", note: "", slots: {"00:00":["Lovro"],"00:30":["Lovro"],"01:00":[],"01:30":[],"02:00":[],"02:30":[],"03:00":[],"03:30":[],"04:00":["Vanko"],"04:30":["Vanko"],"05:00":["Plenčići"],"05:30":["Plenčići","Mate"],"06:00":["Frane","Mate"],"06:30":["Frane","Mateja ŠS","Pažani","teta Sanja"],"07:00":[],"07:30":[],"08:00":["Duje"],"08:30":["Duje"],"09:00":["Isabella","Anđela"],"09:30":["Isabella","Anđela"],"10:00":["Mateja Š."],"10:30":["Mateja Š.","Nevena"],"11:00":[],"11:30":[],"12:00":["Vera","Matej"],"12:30":["Vera"],"13:00":[],"13:30":[],"14:00":[],"14:30":[],"15:00":[],"15:30":[],"16:00":["Ivan"],"16:30":["Nevena"],"17:00":["Vilma i Vesela"],"17:30":[],"18:00":[],"18:30":[],"19:00":[],"19:30":[],"20:00":[],"20:30":["teta Sanja"],"21:00":["Kučić"],"21:30":["Kuvačići"],"22:00":["Dija"],"22:30":["Dija"],"23:00":["Antonija","Pažani","Zorana"],"23:30":["Zorana"]} };

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
    return res.status(200).json(data || SEED);
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

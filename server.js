// Simple Herpstat → Supabase relay server
import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.text({ type: "*/*" })); // accept any payload

app.post("/herpstat", async (req, res) => {
  try {
    const incomingKey =
      req.headers["x-api-key"] ||
      req.headers["authorization"]?.replace(/^Bearer\s+/i, "") ||
      req.query.key ||
      "";

    // Compare to our environment key
    if (incomingKey.trim() !== (process.env.HERPSTAT_KEY || "").trim()) {
      console.error("❌ Unauthorized: bad key", incomingKey);
      return res.status(401).send("Unauthorized");
    }

    console.log("📥 Received from Herpstat:", req.body.slice(0, 200));

    // Forward to Supabase
    const r = await fetch(process.env.SUPABASE_URL, {
      method: "POST",
      headers: {
        "Content-Type": req.headers["content-type"] || "text/plain",
        "x-api-key": process.env.HERPSTAT_KEY,
      },
      body: req.body,
    });

    console.log("✅ Forwarded to Supabase →", r.status);
    res.status(200).send("OK");
  } catch (err) {
    console.error("Relay error:", err);
    res.status(500).send("Relay failed");
  }
});

app.get("/", (_, res) => res.send("🐍 Herpstat relay online"));
app.listen(process.env.PORT || 8080, () => console.log("Listening..."));

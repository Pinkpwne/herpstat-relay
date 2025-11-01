// Simple Herpstat → Supabase relay server
import express from "express";
import fetch from "node-fetch";

const app = express();
app.use(express.text({ type: "*/*" })); // accept any payload

app.post("/herpstat", async (req, res) => {
  try {
    console.log("📥 Received from Herpstat:");
    console.log(req.body.slice(0, 200));

    const r = await fetch(
      process.env.SUPABASE_URL + "?key=" + process.env.HERPSTAT_KEY,
      {
        method: "POST",
        headers: {
          "Content-Type": req.headers["content-type"] || "text/plain",
          "User-Agent": "HerpstatRelay",
        },
        body: req.body,
      }
    );

    console.log("Forwarded to Supabase →", r.status);
    res.status(200).send("OK");
  } catch (err) {
    console.error("Relay error:", err);
    res.status(500).send("Relay failed");
  }
});

app.get("/", (_, res) => res.send("🐍 Herpstat relay online"));
app.listen(process.env.PORT || 8080, () => console.log("Listening..."));

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { customAlphabet } from "nanoid";

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const nanoid = customAlphabet(
  "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ",
  7
);

const PORT = process.env.PORT || 4000;
const APP_BASE_URL = process.env.APP_BASE_URL;

app.use(cors());
app.use(express.json());

function getBaseUrl(req) {
  if (APP_BASE_URL) return APP_BASE_URL.replace(/\/$/, "");
  return `${req.protocol}://${req.get("host")}`;
}

app.post("/api/shorten", async (req, res) => {
  try {
    const { longUrl, expiresInDays } = req.body || {};

    if (!longUrl || typeof longUrl !== "string") {
      return res.status(400).json({ error: "longUrl is required" });
    }

    let url;
    try {
      url = new URL(longUrl);
    } catch {
      return res.status(400).json({ error: "longUrl must be a valid URL" });
    }

    let expiresAtDate = null;
    if (expiresInDays !== null && expiresInDays !== undefined) {
      const days = Number(expiresInDays);
      if (!Number.isFinite(days) || days <= 0) {
        return res
          .status(400)
          .json({ error: "expiresInDays must be a positive number" });
      }
      const now = Date.now();
      expiresAtDate = new Date(now + days * 24 * 60 * 60 * 1000);
    }

    let shortCode;
    let created;

    for (let i = 0; i < 5; i += 1) {
      shortCode = nanoid();
      try {
        created = await prisma.link.create({
          data: {
            shortCode,
            longUrl: url.toString(),
            expiresAt: expiresAtDate,
          },
        });
        break;
      } catch (err) {
        if (err?.code === "P2002") {
          continue;
        }
        throw err;
      }
    }

    if (!created) {
      return res.status(500).json({ error: "Failed to create short URL" });
    }

    const baseUrl = getBaseUrl(req);
    return res.status(201).json({
      shortCode: created.shortCode,
      shortUrl: `${baseUrl}/${created.shortCode}`,
      longUrl: created.longUrl,
      expiresAt: created.expiresAt,
      createdAt: created.createdAt,
    });
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.get("/:code", async (req, res) => {
  try {
    const { code } = req.params;
    const link = await prisma.link.findUnique({
      where: { shortCode: code },
    });

    if (!link) {
      return res.status(404).send("Not found");
    }

    if (link.expiresAt && link.expiresAt <= new Date()) {
      return res.status(410).send("Link expired");
    }

    return res.redirect(302, link.longUrl);
  } catch (err) {
    return res.status(500).send("Server error");
  }
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on port ${PORT}`);
});

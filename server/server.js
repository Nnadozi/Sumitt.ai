import express from "express";
import bodyParser from "body-parser";
import fetch from "node-fetch";
import dotenv from "dotenv";
import * as cheerio from "cheerio";
import axios from "axios";
import puppeteer from "puppeteer";
import rateLimit from "express-rate-limit";
import { textSummarizationPrompt, imageSummarizationPrompt } from "./prompts.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json({ limit: "10mb" }));

// ✅ Rate limiter: 5 requests per minute per IP
const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5, // Limit each IP to 5 requests per windowMs
  message: { error: "You are sending requests too fast. Please slow down." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply the limiter only to the /api/summarize route
app.use("/api/summarize", limiter);

const fetchWithPuppeteer = async (url) => {
  console.log("🚀 Launching Puppeteer...");
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "domcontentloaded" });
  const content = await page.evaluate(() => document.body.innerText);
  await browser.close();
  return content;
};

const detectPaywall = ($) =>
  ["subscribe to continue", "log in to access", "membership required",
   "this article is for subscribers", "join now to read", "please subscribe to get full access"]
    .some((keyword) => $("body").text().toLowerCase().includes(keyword));

const fetchContentFromUrl = async (url) => {
  try {
    const { data } = await axios.get(url, { timeout: 5000 });
    const $ = cheerio.load(data);
    if ($("body").text().trim().length < 100 || detectPaywall($)) {
      console.log("⚠️ Paywall detected. Using Puppeteer...");
      return { error: "Paywall detected. Unable to summarize this content." };
    }
    return { content: $("body").text() };
  } catch {
    console.warn("Cheerio failed. Trying Puppeteer...");
    const content = await fetchWithPuppeteer(url);
    return /subscribe|log in/.test(content)
      ? { error: "Paywall detected. Unable to summarize this content." }
      : { content };
  }
};

app.post("/api/summarize", async (req, res) => {
  let { userInput, options } = req.body;
  if (!userInput) return res.status(400).json({ error: "User input is required." });

  const urlPattern = /^(https?:\/\/)?([a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(:\d+)?(\/[^\s]*)?)$/;
  const base64Pattern = /^data:image\/(png|jpeg|jpg);base64,/;

  if (urlPattern.test(userInput)) {
    console.log("Type is web URL!");
    const result = await fetchContentFromUrl(userInput);
    if (result.error) return res.status(403).json({ error: result.error });
    userInput = result.content;
  }

  const apiUrl = "https://api.openai.com/v1/chat/completions";
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.EXPO_PUBLIC_API_KEY}`,
  };

  try {
    const requestBody = base64Pattern.test(userInput)
      ? {
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: imageSummarizationPrompt(options) },
            {
              role: "user",
              content: [
                { type: "text", text: imageSummarizationPrompt(options) },
                { type: "image_url", image_url: { url: userInput } },
              ],
            },
          ],
        }
      : {
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: textSummarizationPrompt(options) },
            { role: "user", content: userInput },
          ],
        };

    const response = await fetch(apiUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) throw new Error(await response.text());
    res.json(await response.json());
  } catch (error) {
    console.error("Summarization error:", error.message);
    res.status(500).json({ error: "An unexpected error occurred.", details: error.message });
  }
});

app.get("/", (req, res) => res.send("Server is running! Use /api/summarize."));

app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));

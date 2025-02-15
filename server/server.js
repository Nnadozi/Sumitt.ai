import express from "express";
import bodyParser from "body-parser";
import fetch from "node-fetch";
import dotenv from "dotenv";
import * as cheerio from "cheerio";
import axios from "axios";
import puppeteer from "puppeteer";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

/**
 * Fetches website content using Puppeteer for JavaScript-heavy sites.
 */
const fetchWithPuppeteer = async (url) => {
  console.log("🚀 Launching Puppeteer to fetch content...");
  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  await page.goto(url, { waitUntil: "domcontentloaded" });

  const content = await page.evaluate(() => document.body.innerText);
  await browser.close();

  return content;
};

/**
 * Detects paywall messages in HTML content.
 */
const detectPaywall = ($) => {
  const paywallKeywords = [
    "subscribe to continue",
    "log in to access",
    "membership required",
    "this article is for subscribers",
    "join now to read",
    "please subscribe to get full access",
  ];

  return paywallKeywords.some((keyword) =>
    $("body").text().toLowerCase().includes(keyword)
  );
};

/**
 * Tries to fetch content first with Cheerio (fast) and falls back to Puppeteer (slow) if needed.
 */
const fetchContentFromUrl = async (url) => {
  try {
    const response = await axios.get(url, { timeout: 5000 });
    const $ = cheerio.load(response.data);

    if ($("body").text().trim().length < 100 || detectPaywall($)) {
      console.log("⚠️ Content missing or paywall detected. Using Puppeteer...");
      return { error: "Paywall detected. Unable to summarize this content." };
    }

    return { content: $("body").text() };
  } catch (error) {
    console.warn("Cheerio failed. Trying Puppeteer...");
    const puppeteerContent = await fetchWithPuppeteer(url);
    if (puppeteerContent.includes("subscribe") || puppeteerContent.includes("log in")) {
      return { error: "Paywall detected. Unable to summarize this content." };
    }
    return { content: puppeteerContent };
  }
};

/**
 * API Endpoint to summarize content (supports URLs and text input).
 */
app.post("/api/summarize", async (req, res) => {
  const { userInput, options } = req.body;
  if (!userInput) {
    return res.status(400).json({ error: "User input is required." });
  }

  let contentToSummarize = userInput;
  const urlPattern = /^(https?:\/\/)?([a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(:\d+)?(\/[^\s]*)?)$/;

  if (urlPattern.test(userInput)) {
    try {
      console.log("Type is web URL!");
      const result = await fetchContentFromUrl(userInput);
      if (result.error) return res.status(403).json({ error: result.error });
      contentToSummarize = result.content;
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch content from the URL." });
    }
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.EXPO_PUBLIC_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { 
            role: 'system',
            content: `You are a professional summarizer tasked with creating concise, meaningful, and complete summaries of the provided text, regardless of its length or clarity. Follow these instructions:
              1. Always generate a summary based on the provided options when available: ${options}. Follow all the options very strictly. For example, 
              if the format is Q&A, then the summary must be in Q&A format. If the length is 'short', then the summary should be short.
              2. Generate a summary even if the input is minimal or unclear, ensuring the response remains coherent and relevant.
              3. Avoid asking for clarification. Instead, provide thoughtful context, interpretations, or additional details when necessary.
              4. Do not apologize or acknowledge unclear input.
              5. Never display or reference the options object in the response.
              6. Always summarize in the specified language, maintaining accuracy and readability (especially for the pirate language).
              7. The ONLY markdown styles that can be used are bold and italicized text. Do not use ANY OTHER markdown style.
              8. Use this symbol for bullet points: (•)`,
          },
          { role: 'user', content: contentToSummarize },
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text(); 
      console.error("OpenAI API Error:", errorText);
      return res.status(response.status).json({ error: "Failed to generate summary.", details: errorText });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Unexpected error:", error.message);
    res.status(500).json({ error: "An unexpected error occurred.", details: error.message });
  }
});

app.get("/", (req, res) =>
  res.send("Server is running! Use the /api/summarize endpoint for summarization.")
);

app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);

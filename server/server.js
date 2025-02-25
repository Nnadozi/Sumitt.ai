import express from "express";
import bodyParser from "body-parser";
import fetch from "node-fetch";
import dotenv from "dotenv";
import * as cheerio from "cheerio";
import axios from "axios";
import puppeteer from "puppeteer";
import OpenAI from "openai";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

const openai = new OpenAI({
  apiKey: process.env.EXPO_PUBLIC_API_KEY,
});

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
 * Checks if the input is an image URL.
 */
const isImageUrl = (input) => /\.(jpg|jpeg|png|gif|webp)$/i.test(input);

/**
 * Extracts text from an image using OpenAI's GPT-4o Vision API.
 */
const extractTextFromImage = async (imageUrl) => {
  try {
    console.log("🔍 Extracting text from image...");
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Summarize this image." },
            { type: "image_url", image_url: { url: imageUrl } },
          ],
        },
      ],
    });

    return response.choices[0]?.message?.content || null;
  } catch (error) {
    console.error("❌ Image text extraction error:", error.message);
    return null;
  }
};

/**
 * API Endpoint to summarize content (supports URLs, images, and text input).
 */
app.post("/api/summarize", async (req, res) => {
  const { userInput, options } = req.body;
  if (!userInput) {
    return res.status(400).json({ error: "User input is required." });
  }

  let contentToSummarize = userInput;
  const urlPattern = /^(https?:\/\/)?([a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(:\d+)?(\/[^\s]*)?)$/;

  if (urlPattern.test(userInput)) {
    console.log("🌍 Processing web URL...");
    const result = await fetchContentFromUrl(userInput);
    if (result.error) return res.status(403).json({ error: result.error });
    contentToSummarize = result.content;
  } else if (isImageUrl(userInput)) {
    console.log("🖼️ Processing image URL...");
    contentToSummarize = await extractTextFromImage(userInput);
    if (!contentToSummarize) return res.status(400).json({ error: "Failed to extract text from image." });
  }

  try {
    console.log("📝 Summarizing content...");
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a professional AI summarizer. Your job is to create a precise, high-quality summary based on user preferences. You must follow these instructions **exactly**:
          1. **Strictly adhere to the provided options**: ${JSON.stringify(options)}. Do **not** deviate from them.
          2. **Summary length:** Must strictly match the user's chosen length in the provided options.
          3. **Detail level:** Must strictly align with the user's detail preference in the provided options.
          4. **Tone:** Must strictly align with the user's tone preference in the provided options.
          5. **Format:** Ensure the summary follows the specified format (paragraphs, bullet points, mix, or Q&A).
          6. **Reading Level:** The overall reading difficulty and vocabulary level must match the user's preference in the provided options (simple, standard, or advanced).
          7. **Language:** The summary **must** be in the exact language specified by the user in the provided options.
          8. **Markdown Usage:** Only use **bold** and *italicized* text. No other markdown elements are allowed.
          9. **Bullet Points:** When bullet points are required, use **•** as the symbol.
          10. **Do not acknowledge user input issues**: If the input is unclear, infer context but never ask for clarification.
          11. **Do not reference or mention the options**: The response should feel natural, not machine-generated.`,
        },
        { role: "user", content: contentToSummarize },
      ],
    });

    res.json(response.choices[0]);
  } catch (error) {
    console.error("❌ Summarization error:", error.message);
    res.status(500).json({ error: "An unexpected error occurred.", details: error.message });
  }
});

app.get("/", (req, res) =>
  res.send("🚀 Server is running! Use the /api/summarize endpoint for summarization.")
);

app.listen(PORT, () =>
  console.log(`✅ Server running on http://localhost:${PORT}`)
);

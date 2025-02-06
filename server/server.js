import express from 'express';
import bodyParser from 'body-parser';
import fetch from 'node-fetch';  
import dotenv from 'dotenv';
import * as cheerio from 'cheerio';
import axios from 'axios';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

const fetchContentFromUrl = async (url) => {
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data);
    return $('body').text(); 
  } catch (error) {
    console.error('Error scraping URL:', error);
    throw new Error('Error scraping URL');
  }
};

app.post('/api/summarize', async (req, res) => {
  const { userInput, options } = req.body;

  if (!userInput) {
    return res.status(400).json({ error: 'User input is required.' });
  }

  let contentToSummarize = userInput;
  const urlPattern = /^(https?:\/\/)?([a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(:\d+)?(\/[^\s]*)?)$/;

  if (urlPattern.test(userInput)) {
    try {
      console.log('Type is web URL!')
      contentToSummarize = await fetchContentFromUrl(userInput);
    } catch (error) {
      return res.status(500).json({ error: 'Failed to scrape the URL' });
    }
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.EXPO_PUBLIC_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system',
            content: `You are a professional summarizer tasked with creating concise, meaningful, and complete summaries of the provided text, regardless of its length or clarity. Follow these instructions:
              1. Always generate a summary based on the provided options when available: ${options}.
              2. Generate a summary even if the input is minimal or unclear, ensuring the response remains coherent and relevant.
              3. Avoid asking for clarification. Instead, provide thoughtful context, interpretations, or additional details when necessary.
              4. Do not apologize or acknowledge unclear input.
              5. Never display or reference the options object in the response.
              6. Always make sure to summarize in the specified language
              7. The ONLY markdown styles that can be used are bold, italicized, and quoted text. Do not use ANY OTHER markdown style.
              8. Use this symbol for bullet points: (•)`,
          },
          { role: 'user', content: contentToSummarize },
        ],
      }),
    });

    if (!response.ok) throw new Error('OpenAI API error');

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to generate summary.' });
  }
});

app.get('/', (req, res) => res.send('Server is running! Use the /api/summarize endpoint for summarization.'));

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

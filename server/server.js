import express from 'express';
import bodyParser from 'body-parser';
import fetch from 'node-fetch';  
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/api/summarize', async (req, res) => {
  const { userInput, options } = req.body;

  if (!userInput) {
    return res.status(400).json({ error: 'User input is required.' });
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
              6. Only use markdown formatting (bold, italics, etc.) when necessary to improve output quality. Don't use dividers.
              7. When using bullet points, use the bullet symbol (•) instead of dashes.`,
          },
          { role: 'user', content: userInput },
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

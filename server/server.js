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
            content: `You are a professional summarizer. Your goal is to create a concise, meaningful, and complete summary of the provided text, no matter how short or random the input may be. Follow these guidelines:
              1. ALWAYS SUMMARIZE BASED ON THE PROVIDED OPTIONS when available: ${options}.
              2. ALWAYS generate a summary, even if the input text is just a word or lacks substantial details.
              3. EVEN IF the input is too short or unclear, generate a thoughtful, complete response by providing context, interpretations, or relevant details to create a coherent summary.
              4. DO NOT ask for clarification or additional details. Ensure the summary is always generated.
              5. DO NOT apologize.
              6. NEVER DISPLAY THE OPTIONS OBJECT
              7. Avoid using bold, italics, or ANY other type of markdown style.
              8. IF USING BULLET POINTS, DO NOT use dashes ( - ). ALWAYS use bullets instead ( • )
              Input Text:
              {userInput}`, },
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
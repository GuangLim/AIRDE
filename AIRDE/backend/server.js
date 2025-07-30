// backend/server.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import bodyParser from 'body-parser';
import { summarizeText } from './summarizer.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

console.log('✅ Loaded API Key:', process.env.COHERE_API_KEY ? 'Yes' : 'No');

app.post('/summarize', async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ error: 'No text provided.' });
  }

  try {
    const summary = await summarizeText(text);
    res.json({ summary });
  } catch (error) {
    console.error('❌ Error generating summary:', error);
    res.status(500).json({ error: 'Unable to generate summary.' });
  }
});

app.listen(PORT, () => {
  console.log(`🚀 Backend server is running at http://localhost:${PORT}`);
});

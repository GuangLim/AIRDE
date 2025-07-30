import { CohereClient } from 'cohere-ai';
import dotenv from 'dotenv';

dotenv.config();

// ✅ Initialize Cohere client properly
const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY,
});

export async function summarizeText(text) {
  try {
    if (!text || text.trim() === '') {
      throw new Error('No text provided for summarization.');
    }

    const response = await cohere.summarize({
      text: text,
      model: 'summarize-xlarge',
      length: 'medium',
      format: 'paragraph',
      extractiveness: 'auto',
      temperature: 0.3,
    });

    return response.summary;
  } catch (error) {
    console.error('Error generating summary:', error.message);
    throw new Error('Unable to generate summary.');
  }
}

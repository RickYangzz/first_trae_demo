import express, { Request, Response, RequestHandler } from 'express';
import { AiStrategy } from '../services/aiStrategy';
import { GeminiService } from '../services/geminiService';
import { OpenAIService } from '../services/openaiService';
import { InternVLService } from '../services/internvlService';

const router = express.Router();

// Define API routes here

router.post('/guess', async (req: Request, res: Response): Promise<void> => {
  try {
    const { imageData } = req.body;

    if (!imageData) {
      res.status(400).json({ error: 'No image data provided' });
      return;
    }

    // Initialize AI services
    // const geminiService = new GeminiService();
    // const openaiService = new OpenAIService();
    const internvlService = new InternVLService();

    // Create strategy with services in desired order (e.g., Gemini first, then OpenAI, then InternVL)
    // const aiStrategy = new AiStrategy([geminiService, openaiService, internvlService]);
    const aiStrategy = new AiStrategy([internvlService]);

    // Use the strategy to guess the image
    const result = await aiStrategy.guessImage(imageData);

    // Send the AI's guess back to the client
    res.json(result);

  } catch (error) {
    console.error('Error processing image or calling AI:', error);
    // Safely access error message
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    res.status(500).json({ error: 'Internal server error', details: errorMessage });
  }
});

export default router;
import OpenAI from 'openai';
import { AiService } from './aiService';

export class OpenAIService implements AiService {
  private openai: OpenAI;

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set in environment variables.');
    }
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async guessImage(imageData: string): Promise<{ guess: string; confidence: number }> {
    try {
      const fallbackResult = await this.openai.chat.completions.create({
        model: "gpt-4o", // Or another suitable vision model like gpt-4-vision-preview
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: "What is in this picture?" }, // You can make this prompt more specific
              { type: "image_url", image_url: { url: imageData } },
            ],
          },
        ],
      });

      const text = fallbackResult.choices[0].message.content || undefined;

      if (!text) {
        throw new Error('Fallback AI (OpenAI) returned no text.');
      }

      console.log('Fallback AI (OpenAI) response:', text);

      // OpenAI API doesn't provide a confidence score directly in this mode.
      // Returning a placeholder confidence for now.
      return { guess: text, confidence: 1.0 };

    } catch (error) {
      console.error('Error calling fallback AI model (OpenAI):', error);
      throw error; // Re-throw the error to be handled by the caller (e.g., the strategy context)
    }
  }
}
import { GoogleGenerativeAI } from '@google/generative-ai';
import { AiService } from './aiService';

export class GeminiService implements AiService {
  private genAI: GoogleGenerativeAI;

  constructor() {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY is not set in environment variables.');
    }
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }

  async guessImage(imageData: string): Promise<{ guess: string; confidence: number }> {
    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-pro-vision" });

      // Assuming imageData is a base64 string like 'data:image/png;base64,...'
      // Extract the base64 part
      const base64Data = imageData.replace(/^data:image\/png;base64,/, '');

      // Extract mime type from imageData URL
      const mimeMatch = imageData.match(/^data:(.*?);base64,/);
      const mimeType = mimeMatch ? mimeMatch[1] : 'image/png'; // Default to png if not found

      // Prepare image data for Gemini API
      const imagePart = {
        inlineData: {
          data: base64Data,
          mimeType: mimeType,
        },
      };

      const prompt = "What is in this picture?"; // You can make this prompt more specific
      const result = await model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text();

      if (!text) {
        throw new Error('Gemini API returned no text.');
      }

      console.log('Gemini API response:', text);

      // Gemini API doesn't provide a confidence score directly in this mode.
      // Returning a placeholder confidence for now.
      return { guess: text, confidence: 1.0 };

    } catch (error) {
      console.error('Error calling Gemini API:', error);
      throw error; // Re-throw the error to be handled by the caller (e.g., the strategy context)
    }
  }
}
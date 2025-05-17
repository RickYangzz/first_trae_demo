import { AiService } from './aiService';
import OpenAI from 'openai';

export class InternVLService implements AiService {
  private client: OpenAI;

  constructor() {
    const apiKey = process.env.INTERNVL_API_KEY; // Assuming API key is stored in environment variable
    const baseUrl = "https://chat.intern-ai.org.cn/api/v1/"; // Base URL from provided example

    if (!apiKey) {
      throw new Error('INTERNVL_API_KEY is not set in environment variables.');
    }

    this.client = new OpenAI({
      apiKey: apiKey,
      baseURL: baseUrl,
    });
  }

  async guessImage(imageData: string): Promise<{ guess: string; confidence: number }> {
    try {
      // Construct the messages array based on the provided example
      const messages: any[] = [
        {
          role: "user",
          content: [
            { type: "text", text: "What is in this picture?" }, // Prompt
            { type: "image_url", image_url: { url: imageData } }, // Image data
          ],
        },
      ];

      const result = await this.client.chat.completions.create({
        model: "internvl2.5-latest", // Model name from provided example
        messages: messages,
        temperature: 0.8, // Example parameter
        top_p: 0.9, // Example parameter
        max_tokens: 100, // Example parameter
      });

      const text = result.choices[0].message.content || undefined;

      if (!text) {
        throw new Error('InternVL API returned no text.');
      }

      console.log('InternVL API response:', text);

      // InternVL API doesn't provide a confidence score directly in this mode.
      // Returning a placeholder confidence for now.
      return { guess: text, confidence: 1.0 };

    } catch (error) {
      console.error('Error calling InternVL API:', error);
      throw error; // Re-throw the error
    }
  }
}
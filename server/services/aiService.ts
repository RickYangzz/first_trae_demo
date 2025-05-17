// Define the interface for AI image recognition service
export interface AiService {
  guessImage(imageData: string): Promise<{ guess: string; confidence: number }>;
}
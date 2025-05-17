import { AiService } from './aiService';

export class AiStrategy {
  private services: AiService[];

  constructor(services: AiService[]) {
    if (services.length === 0) {
      throw new Error('At least one AI service must be provided.');
    }
    this.services = services;

  }

  async guessImage(imageData: string): Promise<{ guess: string; confidence: number }> {
    for (const service of this.services) {
      try {
        console.log(`Attempting to use service: ${service.constructor.name}`);
        const result = await service.guessImage(imageData);
        console.log(`Successfully used service: ${service.constructor.name}`);
        return result;
      } catch (error) {
        console.error(`Service ${service.constructor.name} failed:`, error);
        // Continue to the next service if the current one fails
      }
    }

    // If all services fail
    throw new Error('All configured AI services failed to process the image.');
  }
}
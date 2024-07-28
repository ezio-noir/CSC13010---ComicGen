import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly API_ENDPOINT: string;
  private readonly API_KEY: string;
  private readonly PROVIDER: string;

  constructor(private readonly configService: ConfigService) {
    this.API_ENDPOINT = this.configService.get('ai.endpoint');
    this.API_KEY = this.configService.get('ai.key');
    this.PROVIDER = this.configService.get('ai.provider');
  }

  async generateImages(prompt: string) {
    try {
      const response = await fetch(this.API_ENDPOINT, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          providers: this.PROVIDER,
          text: prompt,
          resolution: '512x512',
          show_base_64: false,
        }),
      });
      if (!response.ok) throw new Error('Error generating images.');
      return await response.json();
    } catch (error) {
      this.logger.error(error.message);
      throw error;
    }
  }
}

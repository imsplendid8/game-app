import { Process, Processor } from '@nestjs/bull';
import { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { CrawlerService } from '@/crawler/crawler.service';

@Processor('crawler')
export class CrawlerProcessor {
  private readonly logger = new Logger(CrawlerProcessor.name);

  constructor(private crawlerService: CrawlerService) {}

  @Process('run-crawlers')
  async handleCrawlJob(job: Job) {
    this.logger.log('Starting crawler job...');

    try {
      const results = await this.crawlerService.crawlAll();

      job.progress(100);
      return {
        success: true,
        timestamp: new Date(),
        results,
        summary: {
          totalPrograms: results.reduce((sum, r) => sum + r.newCount, 0),
          totalUpdated: results.reduce((sum, r) => sum + r.updatedCount, 0),
          successful: results.filter((r) => r.success).length,
          failed: results.filter((r) => !r.success).length,
        },
      };
    } catch (error) {
      this.logger.error('Fatal error in crawler job:', error instanceof Error ? error.message : String(error));
      throw error;
    }
  }
}

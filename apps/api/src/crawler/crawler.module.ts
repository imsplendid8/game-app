import { Module } from '@nestjs/common';
import { CrawlerService } from './crawler.service';
import { MockAdapter } from './adapters/mock.adapter';

@Module({
  providers: [CrawlerService, MockAdapter],
  exports: [CrawlerService],
})
export class CrawlerModule {}

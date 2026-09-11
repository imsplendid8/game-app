import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CrawlerService } from './crawler.service';
import { CrawlMonitoringService } from '@/modules/crawler/crawl-monitoring.service';
import { CrawlMonitoringController } from '@/modules/crawler/crawl-monitoring.controller';
import { MockAdapter } from './adapters/mock.adapter';
import { SeoulPublicServiceAdapter } from './adapters/seoul-public-service.adapter';
import { MuseumAdapter } from './adapters/museum.adapter';
import { ScienceCenterAdapter } from './adapters/science-center.adapter';
import { FactoryTourAdapter } from './adapters/factory-tour.adapter';
import { BroadcastingAdapter } from './adapters/broadcasting.adapter';
import { CrawlHistory } from '@/modules/crawler/entities/crawl-history.entity';
import { AdapterState } from '@/modules/crawler/entities/adapter-state.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CrawlHistory, AdapterState])],
  providers: [
    CrawlerService,
    CrawlMonitoringService,
    MockAdapter,
    SeoulPublicServiceAdapter,
    MuseumAdapter,
    ScienceCenterAdapter,
    FactoryTourAdapter,
    BroadcastingAdapter,
  ],
  controllers: [CrawlMonitoringController],
  exports: [CrawlerService, CrawlMonitoringService],
})
export class CrawlerModule {}

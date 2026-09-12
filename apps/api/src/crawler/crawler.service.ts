import { Injectable, Logger } from '@nestjs/common';
import { MockAdapter } from './adapters/mock.adapter';
import { SeoulPublicServiceAdapter } from './adapters/seoul-public-service.adapter';
import { MuseumAdapter } from './adapters/museum.adapter';
import { ScienceCenterAdapter } from './adapters/science-center.adapter';
import { FactoryTourAdapter } from './adapters/factory-tour.adapter';
import { BroadcastingAdapter } from './adapters/broadcasting.adapter';
import { CrawlResult, Adapter } from './adapter.interface';

@Injectable()
export class CrawlerService {
  private readonly logger = new Logger(CrawlerService.name);
  private adapters: Map<string, Adapter> = new Map();

  constructor(
    mockAdapter: MockAdapter,
    seoulAdapter: SeoulPublicServiceAdapter,
    museumAdapter: MuseumAdapter,
    scienceCenterAdapter: ScienceCenterAdapter,
    factoryTourAdapter: FactoryTourAdapter,
    broadcastingAdapter: BroadcastingAdapter,
  ) {
    this.registerAdapter(mockAdapter);
    this.registerAdapter(seoulAdapter);
    this.registerAdapter(museumAdapter);
    this.registerAdapter(scienceCenterAdapter);
    this.registerAdapter(factoryTourAdapter);
    this.registerAdapter(broadcastingAdapter);
  }

  registerAdapter(adapter: Adapter): void {
    this.adapters.set(adapter.metadata.name, adapter);
    this.logger.log(`✅ Registered adapter: ${adapter.metadata.name}`);
  }

  async crawlAll(): Promise<CrawlResult[]> {
    this.logger.log('🕷️ Starting crawl for all adapters...');
    const results: CrawlResult[] = [];

    for (const [name, adapter] of this.adapters) {
      if (!adapter.metadata.enabled) {
        this.logger.warn(`⏭️ Skipping disabled adapter: ${name}`);
        continue;
      }

      try {
        this.logger.log(`🔄 Crawling with adapter: ${name}`);
        const programs = await adapter.fetchPrograms();
        results.push({
          adapterName: name,
          success: true,
          programs,
          newCount: programs.length,
          updatedCount: 0,
          crawledAt: new Date(),
        });
        this.logger.log(`✅ Crawled ${programs.length} programs from ${name}`);
      } catch (error) {
        this.logger.error(`❌ Error crawling with adapter ${name}:`, error);
        results.push({
          adapterName: name,
          success: false,
          programs: [],
          newCount: 0,
          updatedCount: 0,
          errors: [error instanceof Error ? error.message : 'Unknown error'],
          crawledAt: new Date(),
        });
      }
    }

    return results;
  }

  async crawlByName(adapterName: string): Promise<CrawlResult> {
    const adapter = this.adapters.get(adapterName);
    if (!adapter) {
      throw new Error(`Adapter not found: ${adapterName}`);
    }

    this.logger.log(`🔄 Crawling with adapter: ${adapterName}`);
    const programs = await adapter.fetchPrograms();

    return {
      adapterName,
      success: true,
      programs,
      newCount: programs.length,
      updatedCount: 0,
      crawledAt: new Date(),
    };
  }

  getAdapters(): Array<{
    name: string;
    enabled: boolean;
    schedule: string;
  }> {
    return Array.from(this.adapters.values()).map((adapter) => ({
      name: adapter.metadata.name,
      enabled: adapter.metadata.enabled,
      schedule: adapter.metadata.schedule,
    }));
  }
}

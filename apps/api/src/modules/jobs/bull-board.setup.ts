import { INestApplication } from '@nestjs/common';
import { Queue } from 'bull';
import { createBullBoard } from '@bull-board/api';
import { ExpressAdapter } from '@bull-board/express';
import { BullAdapter } from '@bull-board/api/bullAdapter';

export function setupBullBoard(
  app: INestApplication,
  queues: Queue[],
): void {
  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath('/admin/queues');

  const bullAdapters = queues.map((queue) => new BullAdapter(queue));

  createBullBoard({
    queues: bullAdapters,
    serverAdapter,
  });

  app.use('/admin/queues', serverAdapter.getRouter());
}

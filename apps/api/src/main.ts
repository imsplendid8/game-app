import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { JobsService } from './modules/jobs/jobs.service';
import { setupBullBoard } from './modules/jobs/bull-board.setup';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  });

  // Swagger Setup
  const config = new DocumentBuilder()
    .setTitle('WithDKIS API')
    .setDescription('Kids Experience Booking Tracker API')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Setup Bull Board for queue monitoring
  if (process.env.NODE_ENV !== 'test') {
    const jobsService = app.get(JobsService);
    const queues = jobsService.getQueues();
    setupBullBoard(app, queues);
  }

  const port = process.env.PORT || 3001;
  await app.listen(port, () => {
    console.log(`✅ WithDKIS API running on http://localhost:${port}`);
    console.log(`📚 Swagger docs available at http://localhost:${port}/api/docs`);
    if (process.env.NODE_ENV !== 'test') {
      console.log(`📊 Bull Board available at http://localhost:${port}/admin/queues`);
    }
  });
}

bootstrap().catch((err) => {
  console.error('❌ Failed to start application:', err);
  process.exit(1);
});

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSource } from '@/database/data-source';
import { HealthModule } from '@/modules/health/health.module';
import { InstitutionsModule } from '@/modules/institutions/institutions.module';
import { ExperiencesModule } from '@/modules/experiences/experiences.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRoot(dataSource.options),
    HealthModule,
    InstitutionsModule,
    ExperiencesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}

import { IsString, IsOptional, IsUrl, IsEnum, IsBoolean, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

enum ExperienceCategory {
  DOCENT = 'DOCENT',
  WORKSHOP = 'WORKSHOP',
  FACTORY_TOUR = 'FACTORY_TOUR',
  EXHIBITION = 'EXHIBITION',
  PERFORMANCE = 'PERFORMANCE',
  EDUCATIONAL = 'EDUCATIONAL',
  OUTDOOR = 'OUTDOOR',
  SPECIAL_EVENT = 'SPECIAL_EVENT',
  OTHER = 'OTHER',
}

export class CreateExperienceDto {
  @IsString()
  @ApiProperty({ description: 'Institution ID' })
  institutionId: string;

  @IsString()
  @ApiProperty({ description: 'Program name' })
  programName: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Program description', required: false })
  description?: string;

  @IsOptional()
  @IsUrl()
  @ApiProperty({ description: 'Program official URL', required: false })
  programUrl?: string;

  @IsOptional()
  @IsUrl()
  @ApiProperty({ description: 'Program booking URL', required: false })
  bookingUrl?: string;

  @IsOptional()
  @IsBoolean()
  @ApiProperty({ description: 'Is recurring program', required: false, default: false })
  isRecurring?: boolean;

  @IsOptional()
  @IsEnum(ExperienceCategory)
  @ApiProperty({ description: 'Experience category', enum: ExperienceCategory, required: false })
  experienceCategory?: ExperienceCategory;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ description: 'Minimum age', required: false })
  targetAgeMin?: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ description: 'Maximum age', required: false })
  targetAgeMax?: number;
}

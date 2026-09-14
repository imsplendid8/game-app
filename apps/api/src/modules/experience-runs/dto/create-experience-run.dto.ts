import { IsString, IsOptional, IsDate, IsNumber, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateExperienceRunDto {
  @IsString()
  @ApiProperty({ description: 'Experience ID' })
  experienceId: string;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ description: 'Run number', required: false })
  runNumber?: number;

  @IsDate()
  @ApiProperty({ description: 'Experience date' })
  experienceDate: Date;

  @IsOptional()
  @IsDate()
  @ApiProperty({ description: 'Booking open at', required: false })
  bookingOpenAt?: Date;

  @IsOptional()
  @IsDate()
  @ApiProperty({ description: 'Booking close at', required: false })
  bookingCloseAt?: Date;

  @IsEnum(['FIRST_COME', 'LOTTERY', 'ALWAYS_AVAILABLE'])
  @ApiProperty({
    description: 'Booking method',
    enum: ['FIRST_COME', 'LOTTERY', 'ALWAYS_AVAILABLE'],
  })
  bookingMethod: string;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ description: 'Capacity', required: false })
  capacity?: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ description: 'Capacity remaining', required: false })
  capacityRemaining?: number;

  @IsOptional()
  @IsNumber()
  @ApiProperty({ description: 'Price in KRW', required: false, default: 0 })
  price?: number;

  @IsEnum(['UNKNOWN', 'OPENING_SOON', 'OPEN', 'CLOSED', 'CANCELLED'])
  @ApiProperty({
    description: 'Status',
    enum: ['UNKNOWN', 'OPENING_SOON', 'OPEN', 'CLOSED', 'CANCELLED'],
    default: 'UNKNOWN',
  })
  status: string;

  @IsEnum(['AVAILABLE', 'CAPTCHA_REQUIRED', 'QUEUE_REQUIRED', 'MANUAL_REQUIRED'])
  @ApiProperty({
    description: 'Automation status',
    enum: ['AVAILABLE', 'CAPTCHA_REQUIRED', 'QUEUE_REQUIRED', 'MANUAL_REQUIRED'],
  })
  automationStatus: string;

  @IsOptional()
  @IsString()
  @ApiProperty({ description: 'Automation note', required: false })
  automationNote?: string;
}

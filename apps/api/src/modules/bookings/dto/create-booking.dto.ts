import { IsUUID, IsArray, IsString, IsOptional, IsInt, Min } from 'class-validator';

export class CreateBookingDto {
  @IsUUID()
  experienceId: string;

  @IsArray()
  selectedChildren: Array<{ id: string; name: string; age: number }>;

  @IsString()
  @IsOptional()
  specialRequests?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  totalPrice?: number;
}

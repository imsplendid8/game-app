import { IsUUID, IsInt, Min, Max, IsString, MinLength } from 'class-validator';

export class CreateReviewDto {
  @IsUUID()
  bookingId: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @IsString()
  @MinLength(10)
  reviewText: string;
}

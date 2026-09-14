import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { BookingsService } from '../bookings/bookings.service';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review)
    private reviewsRepository: Repository<Review>,
    private bookingsService: BookingsService,
  ) {}

  async create(userId: string, createReviewDto: CreateReviewDto): Promise<Review> {
    const booking = await this.bookingsService.findOne(createReviewDto.bookingId);

    if (booking.userId !== userId) {
      throw new BadRequestException('You can only review your own bookings');
    }

    const existingReview = await this.reviewsRepository.findOne({
      where: {
        bookingId: createReviewDto.bookingId,
        userId,
      },
    });

    if (existingReview) {
      throw new BadRequestException('You have already reviewed this booking');
    }

    const review = this.reviewsRepository.create({
      userId,
      bookingId: createReviewDto.bookingId,
      experienceId: booking.experienceId,
      rating: createReviewDto.rating,
      reviewText: createReviewDto.reviewText,
    });

    return await this.reviewsRepository.save(review);
  }

  async findByExperience(experienceId: string, limit = 10, offset = 0): Promise<Review[]> {
    return await this.reviewsRepository.find({
      where: { experienceId },
      relations: ['user'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  async findByBooking(bookingId: string): Promise<Review | null> {
    return await this.reviewsRepository.findOne({
      where: { bookingId },
      relations: ['user'],
    });
  }

  async findByUser(userId: string, limit = 20, offset = 0): Promise<Review[]> {
    return await this.reviewsRepository.find({
      where: { userId },
      relations: ['experience', 'experience.institution'],
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  async markAsHelpful(reviewId: string, userId: string): Promise<Review> {
    const review = await this.reviewsRepository.findOne({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException(`Review with ID ${reviewId} not found`);
    }

    const helpfulByUserIds = review.helpfulByUserIds || [];

    if (!helpfulByUserIds.includes(userId)) {
      helpfulByUserIds.push(userId);
      review.helpfulCount += 1;
      review.helpfulByUserIds = helpfulByUserIds;
      await this.reviewsRepository.save(review);
    }

    return review;
  }

  async getAverageRating(experienceId: string): Promise<{ average: number; count: number }> {
    const result = await this.reviewsRepository
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'average')
      .addSelect('COUNT(review.id)', 'count')
      .where('review.experienceId = :experienceId', { experienceId })
      .getRawOne();

    return {
      average: result.average ? Math.round(parseFloat(result.average) * 100) / 100 : 0,
      count: parseInt(result.count) || 0,
    };
  }
}

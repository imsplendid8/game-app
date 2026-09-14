import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Booking, BookingStatus } from './entities/booking.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { randomBytes } from 'crypto';

@Injectable()
export class BookingsService {
  constructor(
    @InjectRepository(Booking)
    private bookingsRepository: Repository<Booking>,
  ) {}

  async create(userId: string, createBookingDto: CreateBookingDto): Promise<Booking> {
    const confirmationNumber = this.generateConfirmationNumber();

    const booking = this.bookingsRepository.create({
      userId,
      experienceId: createBookingDto.experienceId,
      selectedChildren: createBookingDto.selectedChildren,
      specialRequests: createBookingDto.specialRequests,
      totalPrice: createBookingDto.totalPrice,
      numberOfParticipants: createBookingDto.selectedChildren.length,
      confirmationNumber,
      status: BookingStatus.CONFIRMED,
      experienceDate: new Date(),
    });

    return await this.bookingsRepository.save(booking);
  }

  async findAll(userId: string): Promise<Booking[]> {
    return await this.bookingsRepository.find({
      where: { userId },
      relations: ['experience', 'experience.institution', 'reviews'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Booking> {
    const booking = await this.bookingsRepository.findOne({
      where: { id },
      relations: ['experience', 'experience.institution', 'reviews'],
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    return booking;
  }

  async findOneByUser(userId: string, bookingId: string): Promise<Booking> {
    const booking = await this.findOne(bookingId);

    if (booking.userId !== userId) {
      throw new NotFoundException(`Booking with ID ${bookingId} not found for user ${userId}`);
    }

    return booking;
  }

  async update(id: string, data: Partial<Booking>): Promise<Booking> {
    await this.bookingsRepository.update(id, data);
    return await this.findOne(id);
  }

  async cancel(id: string): Promise<Booking> {
    const booking = await this.findOne(id);
    booking.status = BookingStatus.CANCELLED;
    return await this.bookingsRepository.save(booking);
  }

  async markAsCompleted(id: string): Promise<Booking> {
    const booking = await this.findOne(id);
    booking.status = BookingStatus.COMPLETED;
    return await this.bookingsRepository.save(booking);
  }

  private generateConfirmationNumber(): string {
    return `BK-${randomBytes(4).toString('hex').toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
  }
}

import { Controller, Get, Post, Body, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@ApiTags('Bookings')
@ApiBearerAuth()
@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new booking' })
  async create(
    @CurrentUser() user: any,
    @Body() createBookingDto: CreateBookingDto,
  ) {
    return await this.bookingsService.create(user.id, createBookingDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get user bookings' })
  async findAll(@CurrentUser() user: any) {
    return await this.bookingsService.findAll(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get booking by ID' })
  async findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return await this.bookingsService.findOneByUser(user.id, id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancel booking' })
  async cancel(@Param('id') id: string, @CurrentUser() user: any) {
    await this.bookingsService.findOneByUser(user.id, id);
    return await this.bookingsService.cancel(id);
  }
}

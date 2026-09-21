import { Controller, Get, Post, Body, Param, Delete, Patch, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { JwtPayload } from '../auth/auth.service';

@ApiTags('Bookings')
@ApiBearerAuth()
@Controller('api/bookings')
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new booking' })
  async create(
    @CurrentUser() user: JwtPayload,
    @Body() createBookingDto: CreateBookingDto,
  ) {
    return await this.bookingsService.create(user.sub, createBookingDto);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search and filter bookings' })
  async search(
    @CurrentUser() user: JwtPayload,
    @Query('keyword') keyword?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
    @Query('status') status?: string,
    @Query('sort') sort?: 'newest' | 'oldest' | 'price_low' | 'price_high',
  ) {
    return await this.bookingsService.search(user.sub, {
      keyword,
      dateFrom,
      dateTo,
      status,
      sort,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Get user bookings' })
  async findAll(@CurrentUser() user: JwtPayload) {
    return await this.bookingsService.findAll(user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get booking by ID' })
  async findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    return await this.bookingsService.findOneByUser(user.sub, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update booking (e.g., reschedule date)' })
  async update(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() updateData: any,
  ) {
    await this.bookingsService.findOneByUser(user.sub, id);
    return await this.bookingsService.update(id, updateData);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Cancel booking' })
  async cancel(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    await this.bookingsService.findOneByUser(user.sub, id);
    return await this.bookingsService.cancel(id);
  }
}

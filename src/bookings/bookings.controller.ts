import {
  Controller,
  Post,
  Patch,
  Get,
  Param,
  Body,
  UseGuards,
  ParseUUIDPipe,
  Request,
} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dtos/create-booking.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth/jwt-auth.guard';

@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(private readonly bookingsService: BookingsService) {}

  @Post()
  async create(@Body() dto: CreateBookingDto, @Request() req) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return await this.bookingsService.create(dto, req.user.id);
  }

  @Patch(':id/cancel')
  async cancel(@Param('id', new ParseUUIDPipe()) id: string, @Request() req) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return await this.bookingsService.cancel(id, req.user.id);
  }

  // جلب كل الحجوزات الخاصة بالـ user الحالي
  @Get()
  async findAll(@Request() req) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return await this.bookingsService.findAllByUser(req.user.id);
  }

  // جلب تفاصيل حجز واحد
  @Get(':id')
  async findOne(@Param('id', new ParseUUIDPipe()) id: string, @Request() req) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    return await this.bookingsService.findOneByUser(id, req.user.id);
  }
}

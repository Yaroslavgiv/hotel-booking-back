import { BookingRepository } from '../repositories/BookingRepository';
import { RoomRepository } from '../repositories/RoomRepository';
import { ConflictError } from '../utils/errors';
import { validateDateRange } from '../utils/dateValidator';
import { logger } from '../utils/logger';
import { Booking } from '../models/Booking';

export interface CreateBookingInput {
  roomId: number;
  guestName: string;
  guestEmail: string;
  checkIn: Date;
  checkOut: Date;
}

export class BookingService {
  private bookingRepository: BookingRepository;
  private roomRepository: RoomRepository;

  constructor() {
    this.bookingRepository = new BookingRepository();
    this.roomRepository = new RoomRepository();
  }

  async createBooking(input: CreateBookingInput): Promise<Booking> {
    logger.info('Создание бронирования', { input });

    // Валидация дат
    validateDateRange(input.checkIn, input.checkOut);

    // Проверка существования номера
    await this.roomRepository.findByIdOrFail(input.roomId);

    // Проверка конфликтов
    const conflictingBookings = await this.bookingRepository.findConflictingBookingsForRange(
      input.roomId,
      input.checkIn,
      input.checkOut
    );

    if (conflictingBookings.length > 0) {
      logger.warn('Попытка создать бронирование с конфликтом', {
        roomId: input.roomId,
        checkIn: input.checkIn,
        checkOut: input.checkOut,
        conflicts: conflictingBookings.length,
      });
      throw new ConflictError(
        `Номер недоступен на указанные даты. Найдено ${conflictingBookings.length} конфликтующих бронирований.`
      );
    }

    // Создание бронирования
    const booking = await this.bookingRepository.create({
      ...input,
      isActive: true,
    });

    logger.info('Бронирование успешно создано', { bookingId: booking.id });
    return booking;
  }

  async cancelBooking(id: number): Promise<Booking> {
    logger.info('Отмена бронирования', { bookingId: id });

    const booking = await this.bookingRepository.findByIdOrFail(id);

    if (!booking.isActive) {
      throw new ConflictError('Бронирование уже отменено');
    }

    const cancelledBooking = await this.bookingRepository.cancel(id);

    logger.info('Бронирование успешно отменено', { bookingId: id });
    return cancelledBooking;
  }

  async checkAvailability(
    roomId: number,
    checkIn: Date,
    checkOut: Date
  ): Promise<{ available: boolean; conflictingBookings: Booking[] }> {
    validateDateRange(checkIn, checkOut);

    await this.roomRepository.findByIdOrFail(roomId);

    const conflictingBookings = await this.bookingRepository.findConflictingBookingsForRange(
      roomId,
      checkIn,
      checkOut
    );

    return {
      available: conflictingBookings.length === 0,
      conflictingBookings,
    };
  }
}

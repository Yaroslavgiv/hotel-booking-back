import { Repository, Between } from 'typeorm';
import { AppDataSource } from '../database/dataSource';
import { Booking } from '../models/Booking';
import { NotFoundError } from '../utils/errors';

export class BookingRepository {
  private repository: Repository<Booking>;

  constructor() {
    this.repository = AppDataSource.getRepository(Booking);
  }

  async create(booking: Partial<Booking>): Promise<Booking> {
    const newBooking = this.repository.create(booking);
    return await this.repository.save(newBooking);
  }

  async findById(id: number): Promise<Booking | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['room', 'room.hotel'],
    });
  }

  async findByIdOrFail(id: number): Promise<Booking> {
    const booking = await this.findById(id);
    if (!booking) {
      throw new NotFoundError(`Бронирование с id ${id} не найдено`);
    }
    return booking;
  }

  async findConflictingBookings(
    roomId: number,
    checkIn: Date,
    checkOut: Date
  ): Promise<Booking[]> {
    return await this.repository.find({
      where: {
        roomId,
        isActive: true,
        checkIn: Between(checkIn, checkOut),
      },
    });
  }

  async findConflictingBookingsForRange(
    roomId: number,
    checkIn: Date,
    checkOut: Date
  ): Promise<Booking[]> {
    const startDate = new Date(checkIn);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(checkOut);
    endDate.setHours(23, 59, 59, 999);

    return await this.repository
      .createQueryBuilder('booking')
      .where('booking.roomId = :roomId', { roomId })
      .andWhere('booking.isActive = :isActive', { isActive: true })
      .andWhere(
        '(booking.checkIn <= :checkOut AND booking.checkOut >= :checkIn)',
        { checkIn: startDate, checkOut: endDate }
      )
      .getMany();
  }

  async update(id: number, updates: Partial<Booking>): Promise<Booking> {
    await this.repository.update(id, updates);
    return await this.findByIdOrFail(id);
  }

  async cancel(id: number): Promise<Booking> {
    return await this.update(id, { isActive: false });
  }
}

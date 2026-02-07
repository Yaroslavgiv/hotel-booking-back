import { Repository } from 'typeorm';
import { AppDataSource } from '../database/dataSource';
import { Room } from '../models/Room';
import { NotFoundError } from '../utils/errors';

export class RoomRepository {
  private repository: Repository<Room>;

  constructor() {
    this.repository = AppDataSource.getRepository(Room);
  }

  async findAll(): Promise<Room[]> {
    return await this.repository.find({
      relations: ['hotel'],
    });
  }

  async findByHotelId(hotelId: number): Promise<Room[]> {
    return await this.repository.find({
      where: { hotelId },
      relations: ['hotel'],
    });
  }

  async findById(id: number): Promise<Room | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['hotel', 'bookings'],
    });
  }

  async findByIdOrFail(id: number): Promise<Room> {
    const room = await this.findById(id);
    if (!room) {
      throw new NotFoundError(`Номер с id ${id} не найден`);
    }
    return room;
  }
}

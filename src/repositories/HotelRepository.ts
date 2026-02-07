import { Repository } from 'typeorm';
import { AppDataSource } from '../database/dataSource';
import { Hotel } from '../models/Hotel';
import { NotFoundError } from '../utils/errors';

export class HotelRepository {
  private repository: Repository<Hotel>;

  constructor() {
    this.repository = AppDataSource.getRepository(Hotel);
  }

  async findAll(): Promise<Hotel[]> {
    return await this.repository.find({
      relations: ['rooms'],
    });
  }

  async findById(id: number): Promise<Hotel | null> {
    return await this.repository.findOne({
      where: { id },
      relations: ['rooms'],
    });
  }

  async findByIdOrFail(id: number): Promise<Hotel> {
    const hotel = await this.findById(id);
    if (!hotel) {
      throw new NotFoundError(`Отель с id ${id} не найден`);
    }
    return hotel;
  }
}

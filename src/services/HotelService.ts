import { HotelRepository } from '../repositories/HotelRepository';
import { RoomRepository } from '../repositories/RoomRepository';
import { Hotel } from '../models/Hotel';
import { Room } from '../models/Room';

export class HotelService {
  private hotelRepository: HotelRepository;
  private roomRepository: RoomRepository;

  constructor() {
    this.hotelRepository = new HotelRepository();
    this.roomRepository = new RoomRepository();
  }

  async getAllHotels(): Promise<Hotel[]> {
    return await this.hotelRepository.findAll();
  }

  async getHotelById(id: number): Promise<Hotel> {
    return await this.hotelRepository.findByIdOrFail(id);
  }

  async getAllRooms(): Promise<Room[]> {
    return await this.roomRepository.findAll();
  }

  async getRoomsByHotelId(hotelId: number): Promise<Room[]> {
    await this.hotelRepository.findByIdOrFail(hotelId);
    return await this.roomRepository.findByHotelId(hotelId);
  }
}

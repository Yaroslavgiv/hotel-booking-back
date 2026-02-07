import { HotelService } from '../../services/HotelService';
import { HotelRepository } from '../../repositories/HotelRepository';
import { RoomRepository } from '../../repositories/RoomRepository';
import { NotFoundError } from '../../utils/errors';
import { Hotel } from '../../models/Hotel';
import { Room } from '../../models/Room';

// Моки репозиториев
jest.mock('../../repositories/HotelRepository');
jest.mock('../../repositories/RoomRepository');

const MockedHotelRepository = HotelRepository as jest.MockedClass<typeof HotelRepository>;
const MockedRoomRepository = RoomRepository as jest.MockedClass<typeof RoomRepository>;

describe('HotelService', () => {
  let hotelService: HotelService;
  let mockHotelRepository: jest.Mocked<HotelRepository>;
  let mockRoomRepository: jest.Mocked<RoomRepository>;

  beforeEach(() => {
    jest.clearAllMocks();

    mockHotelRepository = {
      findAll: jest.fn(),
      findById: jest.fn(),
      findByIdOrFail: jest.fn(),
    } as any;

    mockRoomRepository = {
      findAll: jest.fn(),
      findByHotelId: jest.fn(),
      findById: jest.fn(),
      findByIdOrFail: jest.fn(),
    } as any;

    MockedHotelRepository.mockImplementation(() => mockHotelRepository);
    MockedRoomRepository.mockImplementation(() => mockRoomRepository);

    hotelService = new HotelService();
  });

  describe('getAllHotels', () => {
    it('должен вернуть список всех отелей', async () => {
      const mockHotels: Hotel[] = [
        {
          id: 1,
          name: 'Гранд Отель',
          address: 'Москва',
          description: 'Роскошный отель',
        } as Hotel,
        {
          id: 2,
          name: 'Морской Бриз',
          address: 'Санкт-Петербург',
          description: 'Отель у моря',
        } as Hotel,
      ];

      mockHotelRepository.findAll.mockResolvedValue(mockHotels);

      const result = await hotelService.getAllHotels();

      expect(result).toEqual(mockHotels);
      expect(mockHotelRepository.findAll).toHaveBeenCalledTimes(1);
    });

    it('должен вернуть пустой массив, если отелей нет', async () => {
      mockHotelRepository.findAll.mockResolvedValue([]);

      const result = await hotelService.getAllHotels();

      expect(result).toEqual([]);
    });
  });

  describe('getHotelById', () => {
    it('должен вернуть отель по ID', async () => {
      const mockHotel: Hotel = {
        id: 1,
        name: 'Гранд Отель',
        address: 'Москва',
        description: 'Роскошный отель',
      } as Hotel;

      mockHotelRepository.findByIdOrFail.mockResolvedValue(mockHotel);

      const result = await hotelService.getHotelById(1);

      expect(result).toEqual(mockHotel);
      expect(mockHotelRepository.findByIdOrFail).toHaveBeenCalledWith(1);
    });

    it('должен выбросить NotFoundError, если отель не найден', async () => {
      mockHotelRepository.findByIdOrFail.mockRejectedValue(
        new NotFoundError('Отель с id 999 не найден')
      );

      await expect(hotelService.getHotelById(999)).rejects.toThrow(NotFoundError);
    });
  });

  describe('getAllRooms', () => {
    it('должен вернуть список всех номеров', async () => {
      const mockRooms: Room[] = [
        {
          id: 1,
          number: '101',
          type: 'стандарт',
          price: 5000,
          hotelId: 1,
        } as Room,
        {
          id: 2,
          number: '102',
          type: 'люкс',
          price: 10000,
          hotelId: 1,
        } as Room,
      ];

      mockRoomRepository.findAll.mockResolvedValue(mockRooms);

      const result = await hotelService.getAllRooms();

      expect(result).toEqual(mockRooms);
      expect(mockRoomRepository.findAll).toHaveBeenCalledTimes(1);
    });

    it('должен вернуть пустой массив, если номеров нет', async () => {
      mockRoomRepository.findAll.mockResolvedValue([]);

      const result = await hotelService.getAllRooms();

      expect(result).toEqual([]);
    });
  });

  describe('getRoomsByHotelId', () => {
    const hotelId = 1;

    it('должен вернуть номера отеля', async () => {
      const mockRooms: Room[] = [
        {
          id: 1,
          number: '101',
          type: 'стандарт',
          price: 5000,
          hotelId,
        } as Room,
        {
          id: 2,
          number: '102',
          type: 'люкс',
          price: 10000,
          hotelId,
        } as Room,
      ];

      const mockHotel: Hotel = {
        id: hotelId,
        name: 'Гранд Отель',
        address: 'Москва',
      } as Hotel;

      mockHotelRepository.findByIdOrFail.mockResolvedValue(mockHotel);
      mockRoomRepository.findByHotelId.mockResolvedValue(mockRooms);

      const result = await hotelService.getRoomsByHotelId(hotelId);

      expect(result).toEqual(mockRooms);
      expect(mockHotelRepository.findByIdOrFail).toHaveBeenCalledWith(hotelId);
      expect(mockRoomRepository.findByHotelId).toHaveBeenCalledWith(hotelId);
    });

    it('должен выбросить NotFoundError, если отель не найден', async () => {
      mockHotelRepository.findByIdOrFail.mockRejectedValue(
        new NotFoundError('Отель с id 999 не найден')
      );

      await expect(hotelService.getRoomsByHotelId(999)).rejects.toThrow(NotFoundError);
      expect(mockRoomRepository.findByHotelId).not.toHaveBeenCalled();
    });
  });
});

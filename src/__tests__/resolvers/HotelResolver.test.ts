import { HotelResolver } from '../../resolvers/HotelResolver';
import { NotFoundError } from '../../utils/errors';
import { Hotel } from '../../models/Hotel';
import { Room } from '../../models/Room';

// Моки сервисов
jest.mock('../../services/HotelService', () => {
  const mockGetAllHotels = jest.fn();
  const mockGetHotelById = jest.fn();
  const mockGetAllRooms = jest.fn();
  const mockGetRoomsByHotelId = jest.fn();
  
  return {
    HotelService: jest.fn().mockImplementation(() => ({
      getAllHotels: mockGetAllHotels,
      getHotelById: mockGetHotelById,
      getAllRooms: mockGetAllRooms,
      getRoomsByHotelId: mockGetRoomsByHotelId,
    })),
    __mockGetAllHotels: mockGetAllHotels,
    __mockGetHotelById: mockGetHotelById,
    __mockGetAllRooms: mockGetAllRooms,
    __mockGetRoomsByHotelId: mockGetRoomsByHotelId,
  };
});

// Получаем моки из модуля
const HotelServiceModule = require('../../services/HotelService');

describe('HotelResolver', () => {
  const mockGetAllHotels = HotelServiceModule.__mockGetAllHotels;
  const mockGetHotelById = HotelServiceModule.__mockGetHotelById;
  const mockGetAllRooms = HotelServiceModule.__mockGetAllRooms;
  const mockGetRoomsByHotelId = HotelServiceModule.__mockGetRoomsByHotelId;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Query.hotels', () => {
    it('должен вернуть список всех отелей', async () => {
      const mockHotels: Hotel[] = [
        {
          id: 1,
          name: 'Гранд Отель',
          address: 'Москва',
        } as Hotel,
        {
          id: 2,
          name: 'Морской Бриз',
          address: 'Санкт-Петербург',
        } as Hotel,
      ];

      mockGetAllHotels.mockResolvedValue(mockHotels);

      const result = await HotelResolver.Query.hotels();

      expect(result).toEqual(mockHotels);
      expect(mockGetAllHotels).toHaveBeenCalledTimes(1);
    });
  });

  describe('Query.hotel', () => {
    it('должен вернуть отель по ID', async () => {
      const mockHotel: Hotel = {
        id: 1,
        name: 'Гранд Отель',
        address: 'Москва',
      } as Hotel;

      mockGetHotelById.mockResolvedValue(mockHotel);

      const result = await HotelResolver.Query.hotel(null, { id: '1' });

      expect(result).toEqual(mockHotel);
      expect(mockGetHotelById).toHaveBeenCalledWith(1);
    });

    it('должен вернуть null, если отель не найден', async () => {
      mockGetHotelById.mockRejectedValue(
        new NotFoundError('Отель с id 999 не найден')
      );

      const result = await HotelResolver.Query.hotel(null, { id: '999' });

      expect(result).toBeNull();
    });
  });

  describe('Query.rooms', () => {
    it('должен вернуть список всех номеров', async () => {
      const mockRooms: Room[] = [
        {
          id: 1,
          number: '101',
          type: 'стандарт',
          price: 5000,
          hotelId: 1,
        } as Room,
      ];

      mockGetAllRooms.mockResolvedValue(mockRooms);

      const result = await HotelResolver.Query.rooms();

      expect(result).toEqual(mockRooms);
      expect(mockGetAllRooms).toHaveBeenCalledTimes(1);
    });
  });

  describe('Query.roomsByHotel', () => {
    it('должен вернуть номера отеля', async () => {
      const mockRooms: Room[] = [
        {
          id: 1,
          number: '101',
          type: 'стандарт',
          price: 5000,
          hotelId: 1,
        } as Room,
      ];

      mockGetRoomsByHotelId.mockResolvedValue(mockRooms);

      const result = await HotelResolver.Query.roomsByHotel(null, { hotelId: '1' });

      expect(result).toEqual(mockRooms);
      expect(mockGetRoomsByHotelId).toHaveBeenCalledWith(1);
    });
  });

  describe('Hotel.rooms', () => {
    it('должен вернуть номера из отеля, если они уже загружены', async () => {
      const mockRooms: Room[] = [
        {
          id: 1,
          number: '101',
          type: 'стандарт',
          price: 5000,
          hotelId: 1,
        } as Room,
      ];

      const hotel: Hotel = {
        id: 1,
        name: 'Гранд Отель',
        rooms: mockRooms,
      } as Hotel;

      const result = await HotelResolver.Hotel.rooms(hotel);

      expect(result).toEqual(mockRooms);
      expect(mockGetRoomsByHotelId).not.toHaveBeenCalled();
    });

    it('должен загрузить номера из сервиса, если они не загружены', async () => {
      const mockRooms: Room[] = [
        {
          id: 1,
          number: '101',
          type: 'стандарт',
          price: 5000,
          hotelId: 1,
        } as Room,
      ];

      const hotel: Hotel = {
        id: 1,
        name: 'Гранд Отель',
      } as Hotel;

      mockGetRoomsByHotelId.mockResolvedValue(mockRooms);

      const result = await HotelResolver.Hotel.rooms(hotel);

      expect(result).toEqual(mockRooms);
      expect(mockGetRoomsByHotelId).toHaveBeenCalledWith(1);
    });
  });

  describe('Room.hotel', () => {
    it('должен вернуть отель из номера, если он уже загружен', async () => {
      const mockHotel: Hotel = {
        id: 1,
        name: 'Гранд Отель',
        address: 'Москва',
      } as Hotel;

      const room: Room = {
        id: 1,
        number: '101',
        hotel: mockHotel,
        hotelId: 1,
      } as Room;

      const result = await HotelResolver.Room.hotel(room);

      expect(result).toEqual(mockHotel);
      expect(mockGetHotelById).not.toHaveBeenCalled();
    });

    it('должен загрузить отель из сервиса, если он не загружен', async () => {
      const mockHotel: Hotel = {
        id: 1,
        name: 'Гранд Отель',
        address: 'Москва',
      } as Hotel;

      const room: Room = {
        id: 1,
        number: '101',
        hotelId: 1,
      } as Room;

      mockGetHotelById.mockResolvedValue(mockHotel);

      const result = await HotelResolver.Room.hotel(room);

      expect(result).toEqual(mockHotel);
      expect(mockGetHotelById).toHaveBeenCalledWith(1);
    });
  });
});

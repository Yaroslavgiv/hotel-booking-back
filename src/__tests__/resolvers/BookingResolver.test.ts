import { BookingResolver } from '../../resolvers/BookingResolver';
import { ConflictError, ValidationError, NotFoundError } from '../../utils/errors';
import { Booking } from '../../models/Booking';
import { Room } from '../../models/Room';

// Моки сервисов и репозиториев
const mockCreateBooking = jest.fn();
const mockCancelBooking = jest.fn();
const mockCheckAvailability = jest.fn();
const mockFindById = jest.fn();

jest.mock('../../services/BookingService', () => {
  const mockCreateBooking = jest.fn();
  const mockCancelBooking = jest.fn();
  const mockCheckAvailability = jest.fn();
  
  return {
    BookingService: jest.fn().mockImplementation(() => ({
      createBooking: mockCreateBooking,
      cancelBooking: mockCancelBooking,
      checkAvailability: mockCheckAvailability,
    })),
    __mockCreateBooking: mockCreateBooking,
    __mockCancelBooking: mockCancelBooking,
    __mockCheckAvailability: mockCheckAvailability,
  };
});

jest.mock('../../repositories/BookingRepository', () => {
  const mockFindById = jest.fn();
  
  return {
    BookingRepository: jest.fn().mockImplementation(() => ({
      findById: mockFindById,
    })),
    __mockFindById: mockFindById,
  };
});

// Получаем моки из модулей
const BookingServiceModule = require('../../services/BookingService');
const BookingRepositoryModule = require('../../repositories/BookingRepository');

describe('BookingResolver', () => {
  const mockCreateBooking = BookingServiceModule.__mockCreateBooking;
  const mockCancelBooking = BookingServiceModule.__mockCancelBooking;
  const mockCheckAvailability = BookingServiceModule.__mockCheckAvailability;
  const mockFindById = BookingRepositoryModule.__mockFindById;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Query.checkAvailability', () => {
    it('должен вызвать сервис с правильными параметрами', async () => {
      const roomId = '1';
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const checkIn = futureDate.toISOString().split('T')[0];
      futureDate.setDate(futureDate.getDate() + 4);
      const checkOut = futureDate.toISOString().split('T')[0];

      const mockResult = {
        available: true,
        conflictingBookings: [],
      };

      mockCheckAvailability.mockResolvedValue(mockResult);

      const result = await BookingResolver.Query.checkAvailability(
        null,
        { roomId, checkIn, checkOut }
      );

      expect(result).toEqual(mockResult);
      expect(mockCheckAvailability).toHaveBeenCalledWith(
        1,
        new Date(checkIn),
        new Date(checkOut)
      );
    });
  });

  describe('Mutation.createBooking', () => {
    it('должен успешно создать бронирование', async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      const checkIn = futureDate.toISOString().split('T')[0];
      futureDate.setDate(futureDate.getDate() + 4);
      const checkOut = futureDate.toISOString().split('T')[0];

      const input = {
        roomId: '1',
        guestName: 'Иван Иванов',
        guestEmail: 'ivan@example.com',
        checkIn,
        checkOut,
      };

      const mockBooking: Booking = {
        id: 1,
        roomId: 1,
        guestName: input.guestName,
        guestEmail: input.guestEmail,
        checkIn: new Date(input.checkIn),
        checkOut: new Date(input.checkOut),
        isActive: true,
        createdAt: new Date(),
      } as Booking;

      mockCreateBooking.mockResolvedValue(mockBooking);

      const result = await BookingResolver.Mutation.createBooking(null, { input });

      expect(result).toEqual(mockBooking);
      expect(mockCreateBooking).toHaveBeenCalledWith({
        ...input,
        roomId: 1,
        checkIn: new Date(input.checkIn),
        checkOut: new Date(input.checkOut),
      });
    });

    it('должен пробросить ошибку валидации', async () => {
      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);
      const checkIn = pastDate.toISOString().split('T')[0];
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);
      const checkOut = futureDate.toISOString().split('T')[0];

      const input = {
        roomId: '1',
        guestName: 'Иван Иванов',
        guestEmail: 'ivan@example.com',
        checkIn,
        checkOut,
      };

      mockCreateBooking.mockRejectedValue(
        new ValidationError('Дата заезда не может быть в прошлом')
      );

      await expect(
        BookingResolver.Mutation.createBooking(null, { input })
      ).rejects.toThrow(ValidationError);
    });
  });

  describe('Mutation.cancelBooking', () => {
    it('должен успешно отменить бронирование', async () => {
      const id = '1';
      const mockBooking: Booking = {
        id: 1,
        guestName: 'Иван Иванов',
        isActive: false,
      } as Booking;

      mockCancelBooking.mockResolvedValue(mockBooking);

      const result = await BookingResolver.Mutation.cancelBooking(null, { id });

      expect(result).toEqual(mockBooking);
      expect(mockCancelBooking).toHaveBeenCalledWith(1);
    });

    it('должен пробросить ошибку конфликта', async () => {
      const id = '1';

      mockCancelBooking.mockRejectedValue(
        new ConflictError('Бронирование уже отменено')
      );

      await expect(
        BookingResolver.Mutation.cancelBooking(null, { id })
      ).rejects.toThrow(ConflictError);
    });
  });

  describe('Booking.room', () => {
    it('должен вернуть комнату из бронирования, если она уже загружена', async () => {
      const mockRoom: Room = {
        id: 1,
        number: '101',
        type: 'стандарт',
        price: 5000,
        hotelId: 1,
      } as Room;

      const booking: Booking = {
        id: 1,
        room: mockRoom,
      } as Booking;

      const result = await BookingResolver.Booking.room(booking);

      expect(result).toEqual(mockRoom);
      expect(mockFindById).not.toHaveBeenCalled();
    });

    it('должен загрузить комнату из репозитория, если она не загружена', async () => {
      const mockRoom: Room = {
        id: 1,
        number: '101',
        type: 'стандарт',
        price: 5000,
        hotelId: 1,
      } as Room;

      const booking: Booking = {
        id: 1,
      } as Booking;

      const fullBooking: Booking = {
        id: 1,
        room: mockRoom,
      } as Booking;

      mockFindById.mockResolvedValue(fullBooking);

      const result = await BookingResolver.Booking.room(booking);

      expect(result).toEqual(mockRoom);
      expect(mockFindById).toHaveBeenCalledWith(1);
    });

    it('должен вернуть undefined, если бронирование не найдено', async () => {
      const booking: Booking = {
        id: 999,
      } as Booking;

      mockFindById.mockResolvedValue(null);

      const result = await BookingResolver.Booking.room(booking);

      expect(result).toBeUndefined();
    });
  });
});

import { BookingService, CreateBookingInput } from '../../services/BookingService';
import { BookingRepository } from '../../repositories/BookingRepository';
import { RoomRepository } from '../../repositories/RoomRepository';
import { ValidationError, ConflictError, NotFoundError } from '../../utils/errors';
import { Booking } from '../../models/Booking';
import { Room } from '../../models/Room';

// Моки репозиториев
jest.mock('../../repositories/BookingRepository');
jest.mock('../../repositories/RoomRepository');

const MockedBookingRepository = BookingRepository as jest.MockedClass<typeof BookingRepository>;
const MockedRoomRepository = RoomRepository as jest.MockedClass<typeof RoomRepository>;

describe('BookingService', () => {
  let bookingService: BookingService;
  let mockBookingRepository: jest.Mocked<BookingRepository>;
  let mockRoomRepository: jest.Mocked<RoomRepository>;

  beforeEach(() => {
    jest.clearAllMocks();
    
    mockBookingRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      findByIdOrFail: jest.fn(),
      findConflictingBookingsForRange: jest.fn(),
      update: jest.fn(),
      cancel: jest.fn(),
    } as any;

    mockRoomRepository = {
      findById: jest.fn(),
      findByIdOrFail: jest.fn(),
      findAll: jest.fn(),
      findByHotelId: jest.fn(),
    } as any;

    // Заменяем конструкторы репозиториев
    MockedBookingRepository.mockImplementation(() => mockBookingRepository);
    MockedRoomRepository.mockImplementation(() => mockRoomRepository);

    bookingService = new BookingService();
  });

  describe('createBooking', () => {
    const getFutureDate = (daysFromNow: number): Date => {
      const date = new Date();
      date.setDate(date.getDate() + daysFromNow);
      date.setHours(0, 0, 0, 0);
      return date;
    };

    const validInput: CreateBookingInput = {
      roomId: 1,
      guestName: 'Иван Иванов',
      guestEmail: 'ivan@example.com',
      checkIn: getFutureDate(1),
      checkOut: getFutureDate(5),
    };

    const mockRoom: Room = {
      id: 1,
      number: '101',
      type: 'стандарт',
      price: 5000,
      hotelId: 1,
    } as Room;

    it('должен успешно создать бронирование', async () => {
      const mockBooking: Booking = {
        id: 1,
        ...validInput,
        isActive: true,
        createdAt: new Date(),
      } as Booking;

      mockRoomRepository.findByIdOrFail.mockResolvedValue(mockRoom);
      mockBookingRepository.findConflictingBookingsForRange.mockResolvedValue([]);
      mockBookingRepository.create.mockResolvedValue(mockBooking);

      const result = await bookingService.createBooking(validInput);

      expect(result).toEqual(mockBooking);
      expect(mockRoomRepository.findByIdOrFail).toHaveBeenCalledWith(validInput.roomId);
      expect(mockBookingRepository.findConflictingBookingsForRange).toHaveBeenCalledWith(
        validInput.roomId,
        validInput.checkIn,
        validInput.checkOut
      );
      expect(mockBookingRepository.create).toHaveBeenCalledWith({
        ...validInput,
        isActive: true,
      });
    });

    it('должен выбросить ValidationError для даты заезда в прошлом', async () => {
      const invalidInput = {
        ...validInput,
        checkIn: getFutureDate(-1),
      };

      await expect(bookingService.createBooking(invalidInput)).rejects.toThrow(ValidationError);
      expect(mockBookingRepository.create).not.toHaveBeenCalled();
    });

    it('должен выбросить ValidationError, если дата выезда раньше заезда', async () => {
      const invalidInput = {
        ...validInput,
        checkIn: getFutureDate(5),
        checkOut: getFutureDate(1),
      };

      await expect(bookingService.createBooking(invalidInput)).rejects.toThrow(ValidationError);
      expect(mockBookingRepository.create).not.toHaveBeenCalled();
    });

    it('должен выбросить NotFoundError, если номер не существует', async () => {
      mockRoomRepository.findByIdOrFail.mockRejectedValue(new NotFoundError('Номер не найден'));

      await expect(bookingService.createBooking(validInput)).rejects.toThrow(NotFoundError);
      expect(mockBookingRepository.create).not.toHaveBeenCalled();
    });

    it('должен выбросить ConflictError при конфликте с существующими бронированиями', async () => {
      const conflictingBooking: Booking = {
        id: 2,
        roomId: 1,
        guestName: 'Петр Петров',
        checkIn: getFutureDate(3),
        checkOut: getFutureDate(4),
        isActive: true,
      } as Booking;

      mockRoomRepository.findByIdOrFail.mockResolvedValue(mockRoom);
      mockBookingRepository.findConflictingBookingsForRange.mockResolvedValue([conflictingBooking]);

      await expect(bookingService.createBooking(validInput)).rejects.toThrow(ConflictError);
      expect(mockBookingRepository.create).not.toHaveBeenCalled();
    });
  });

  describe('cancelBooking', () => {
    const bookingId = 1;
    const activeBooking: Booking = {
      id: bookingId,
      guestName: 'Иван Иванов',
      isActive: true,
    } as Booking;

    const cancelledBooking: Booking = {
      ...activeBooking,
      isActive: false,
    };

    it('должен успешно отменить активное бронирование', async () => {
      mockBookingRepository.findByIdOrFail.mockResolvedValue(activeBooking);
      mockBookingRepository.cancel.mockResolvedValue(cancelledBooking);

      const result = await bookingService.cancelBooking(bookingId);

      expect(result).toEqual(cancelledBooking);
      expect(mockBookingRepository.findByIdOrFail).toHaveBeenCalledWith(bookingId);
      expect(mockBookingRepository.cancel).toHaveBeenCalledWith(bookingId);
    });

    it('должен выбросить ConflictError при попытке отменить уже отмененное бронирование', async () => {
      const alreadyCancelled: Booking = {
        ...activeBooking,
        isActive: false,
      };

      mockBookingRepository.findByIdOrFail.mockResolvedValue(alreadyCancelled);

      await expect(bookingService.cancelBooking(bookingId)).rejects.toThrow(ConflictError);
      expect(mockBookingRepository.cancel).not.toHaveBeenCalled();
    });

    it('должен выбросить NotFoundError, если бронирование не найдено', async () => {
      mockBookingRepository.findByIdOrFail.mockRejectedValue(new NotFoundError('Бронирование не найдено'));

      await expect(bookingService.cancelBooking(bookingId)).rejects.toThrow(NotFoundError);
      expect(mockBookingRepository.cancel).not.toHaveBeenCalled();
    });
  });

  describe('checkAvailability', () => {
    const getFutureDate = (daysFromNow: number): Date => {
      const date = new Date();
      date.setDate(date.getDate() + daysFromNow);
      date.setHours(0, 0, 0, 0);
      return date;
    };

    const roomId = 1;
    const checkIn = getFutureDate(1);
    const checkOut = getFutureDate(5);

    const mockRoom: Room = {
      id: roomId,
      number: '101',
      type: 'стандарт',
      price: 5000,
      hotelId: 1,
    } as Room;

    it('должен вернуть available: true, если нет конфликтов', async () => {
      mockRoomRepository.findByIdOrFail.mockResolvedValue(mockRoom);
      mockBookingRepository.findConflictingBookingsForRange.mockResolvedValue([]);

      const result = await bookingService.checkAvailability(roomId, checkIn, checkOut);

      expect(result.available).toBe(true);
      expect(result.conflictingBookings).toEqual([]);
    });

    it('должен вернуть available: false и список конфликтов', async () => {
      const conflictingBooking: Booking = {
        id: 2,
        roomId,
        guestName: 'Петр Петров',
        checkIn: getFutureDate(3),
        checkOut: getFutureDate(4),
        isActive: true,
      } as Booking;

      mockRoomRepository.findByIdOrFail.mockResolvedValue(mockRoom);
      mockBookingRepository.findConflictingBookingsForRange.mockResolvedValue([conflictingBooking]);

      const result = await bookingService.checkAvailability(roomId, checkIn, checkOut);

      expect(result.available).toBe(false);
      expect(result.conflictingBookings).toEqual([conflictingBooking]);
    });

    it('должен выбросить ValidationError для некорректных дат', async () => {
      const invalidCheckIn = getFutureDate(-1);

      await expect(
        bookingService.checkAvailability(roomId, invalidCheckIn, checkOut)
      ).rejects.toThrow(ValidationError);
    });

    it('должен выбросить NotFoundError, если номер не существует', async () => {
      mockRoomRepository.findByIdOrFail.mockRejectedValue(new NotFoundError('Номер не найден'));

      await expect(
        bookingService.checkAvailability(roomId, checkIn, checkOut)
      ).rejects.toThrow(NotFoundError);
    });
  });
});

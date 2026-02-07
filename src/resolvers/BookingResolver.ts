import { BookingService } from '../services/BookingService';
import { BookingRepository } from '../repositories/BookingRepository';
import { Booking } from '../models/Booking';

const bookingService = new BookingService();
const bookingRepository = new BookingRepository();

export const BookingResolver = {
  Query: {
    checkAvailability: async (
      _: any,
      { roomId, checkIn, checkOut }: { roomId: string; checkIn: string; checkOut: string }
    ) => {
      return await bookingService.checkAvailability(
        parseInt(roomId),
        new Date(checkIn),
        new Date(checkOut)
      );
    },
  },

  Mutation: {
    createBooking: async (
      _: any,
      { input }: { input: any }
    ): Promise<Booking> => {
      return await bookingService.createBooking({
        ...input,
        roomId: parseInt(input.roomId),
        checkIn: new Date(input.checkIn),
        checkOut: new Date(input.checkOut),
      });
    },

    cancelBooking: async (_: any, { id }: { id: string }): Promise<Booking> => {
      return await bookingService.cancelBooking(parseInt(id));
    },
  },

  Booking: {
    room: async (booking: Booking): Promise<any> => {
      if (booking.room) {
        return booking.room;
      }
      const fullBooking = await bookingRepository.findById(booking.id);
      return fullBooking?.room;
    },
  },
};

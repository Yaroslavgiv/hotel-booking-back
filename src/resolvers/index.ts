import { HotelResolver } from './HotelResolver';
import { BookingResolver } from './BookingResolver';

export const resolvers = {
  Query: {
    ...HotelResolver.Query,
    ...BookingResolver.Query,
  },
  Mutation: {
    ...BookingResolver.Mutation,
  },
  Hotel: HotelResolver.Hotel,
  Room: HotelResolver.Room,
  Booking: BookingResolver.Booking,
};

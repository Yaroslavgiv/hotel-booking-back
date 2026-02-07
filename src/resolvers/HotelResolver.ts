import { HotelService } from '../services/HotelService';
import { Hotel } from '../models/Hotel';
import { Room } from '../models/Room';

const hotelService = new HotelService();

export const HotelResolver = {
  Query: {
    hotels: async (): Promise<Hotel[]> => {
      return await hotelService.getAllHotels();
    },

    hotel: async (_: any, { id }: { id: string }): Promise<Hotel | null> => {
      try {
        return await hotelService.getHotelById(parseInt(id));
      } catch (error) {
        return null;
      }
    },

    rooms: async (): Promise<Room[]> => {
      return await hotelService.getAllRooms();
    },

    roomsByHotel: async (_: any, { hotelId }: { hotelId: string }): Promise<Room[]> => {
      return await hotelService.getRoomsByHotelId(parseInt(hotelId));
    },
  },

  Hotel: {
    rooms: async (hotel: Hotel): Promise<Room[]> => {
      if (hotel.rooms && hotel.rooms.length > 0) {
        return hotel.rooms;
      }
      return await hotelService.getRoomsByHotelId(hotel.id);
    },
  },

  Room: {
    hotel: async (room: Room): Promise<Hotel> => {
      if (room.hotel) {
        return room.hotel;
      }
      return await hotelService.getHotelById(room.hotelId);
    },
  },
};

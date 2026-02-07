import { DataSource } from 'typeorm';
import { Hotel } from '../models/Hotel';
import { Room } from '../models/Room';
import { Booking } from '../models/Booking';

const databasePath = process.env.DATABASE_PATH || './hotel_booking.db';

export const AppDataSource = new DataSource({
  type: 'better-sqlite3',
  database: databasePath,
  entities: [Hotel, Room, Booking],
  synchronize: true,
  logging: false,
});

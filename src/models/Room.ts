import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Hotel } from './Hotel';
import { Booking } from './Booking';

@Entity('rooms')
export class Room {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  number!: string;

  @Column()
  type!: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price!: number;

  @Column()
  hotelId!: number;

  @ManyToOne(() => Hotel, (hotel) => hotel.rooms)
  @JoinColumn({ name: 'hotelId' })
  hotel!: Hotel;

  @OneToMany(() => Booking, (booking) => booking.room)
  bookings!: Booking[];
}

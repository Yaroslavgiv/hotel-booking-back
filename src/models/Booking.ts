import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Room } from './Room';

@Entity('bookings')
export class Booking {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  guestName!: string;

  @Column()
  guestEmail!: string;

  @Column('date')
  checkIn!: Date;

  @Column('date')
  checkOut!: Date;

  @Column()
  roomId!: number;

  @ManyToOne(() => Room, (room) => room.bookings)
  @JoinColumn({ name: 'roomId' })
  room!: Room;

  @Column({ default: true })
  isActive!: boolean;

  @CreateDateColumn()
  createdAt!: Date;
}

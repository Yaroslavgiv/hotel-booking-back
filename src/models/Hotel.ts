import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Room } from './Room';

@Entity('hotels')
export class Hotel {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @Column()
  address!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @OneToMany(() => Room, (room) => room.hotel)
  rooms!: Room[];
}

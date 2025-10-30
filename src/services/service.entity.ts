import { Availability } from 'src/availability/availability.entity';
import { Booking } from 'src/bookings/booking.entity';
import { User } from 'src/users/user.entity';
import { Column, ManyToOne, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

export class Service {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column({ default: 1 })
  capacity: number;

  @ManyToOne(() => User, (user) => user.services, { onDelete: 'CASCADE' })
  owner: User;

  @OneToMany(() => Availability, (availability) => availability.service)
  availabilities: Availability[];

  @OneToMany(() => Booking, (booking) => booking.service)
  bookings: Booking[];
}

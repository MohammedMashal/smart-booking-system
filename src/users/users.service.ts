import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const existing = await this.usersRepo.exists({
      where: { email: createUserDto.email },
    });
    if (existing) throw new ConflictException('user already exist');

    createUserDto.password = await bcrypt.hash(createUserDto.password, 10);
    const user = this.usersRepo.create(createUserDto);

    return await this.usersRepo.save(user);
  }

  async findAll() {
    return await this.usersRepo.find();
  }

  async findOne(id: string) {
    const user = await this.usersRepo.findOneBy({ id });
    if (!user) throw new NotFoundException('user not found');
    return user;
  }

  async findByEmail(email: string) {
    return await this.usersRepo.findOneBy({ email });
  }

  async update(id: string, updateFields: UpdateUserDto) {
    const user = await this.findOne(id);
    Object.assign(user, updateFields);
    return await this.usersRepo.save(user);
  }

  async remove(id: string) {
    return await this.usersRepo.delete(id);
  }
}

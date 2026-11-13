import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm/repository/Repository.js';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(createUserDto);   // plain object -> entity
    return await this.userRepository.save(user);              // entity -> database (INSERT)
  }

  async findAll(): Promise<User[]> {
    return await this.userRepository.find({ relations: { Posts: true } });   // eager load Posts
  }

  async findOne(id: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: { Posts: true },   // eager load Posts
    });
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);    // 404 if missing
    Object.assign(user, updateUserDto);     // merge changed fields
    user.updatedAt = new Date();  
    return await this.userRepository.save(user);   // entity -> database (UPDATE)
  }

  async remove(id: number): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.delete(user);   // entity -> database (DELETE)
  }
}

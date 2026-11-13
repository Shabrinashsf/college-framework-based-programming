import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from '@prisma/client';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // TODO: Implement user creation with Prisma
    return await this.prisma.user.create({
      data: createUserDto,
    });
  }

  async findAll() {
    // TODO: Implement find all users with Prisma
    return await this.prisma.user.findMany({
      include: {
        posts: true,
        likes: true,
      },
    });
  }

  async findOne(id: number): Promise<User> {
    // TODO: Implement find user by id with Prisma
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        posts: true,
        likes: true,
      },
    });
    if (!user) throw new NotFoundException(`User with ID ${id} not found`);
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    // TODO: Implement user update with Prisma
    await this.findOne(id);
    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  async remove(id: number): Promise<void> {
    // TODO: Implement user removal with Prisma
    await this.findOne(id);
    await this.prisma.user.delete({
      where: { id },
    });
  }
}

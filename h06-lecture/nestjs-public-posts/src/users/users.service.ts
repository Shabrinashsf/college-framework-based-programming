import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma.service';
import { handlePrismaError } from '../common/prisma-error.handler';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    try {
      return await this.prisma.user.create({
        data: createUserDto,
      });
    } catch (error) {
      // Duplicate email -> 409 Conflict instead of 500.
      handlePrismaError(error, 'create user');
    }
  }

  async findAll() {
    return this.prisma.user.findMany({
      include: { posts: true },
    });
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { posts: true },
    });
    if (!user) {
      throw new NotFoundException(`User #${id} not found`);
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    await this.findOne(id);
    try {
      return await this.prisma.user.update({
        where: { id },
        data: updateUserDto,
      });
    } catch (error) {
      handlePrismaError(error, 'update user');
    }
  }

  async remove(id: number) {
    await this.findOne(id);
    try {
      return await this.prisma.user.delete({
        where: { id },
      });
    } catch (error) {
      // A user who still has posts -> 400 (foreign key) instead of 500.
      handlePrismaError(error, 'delete user');
    }
  }
}

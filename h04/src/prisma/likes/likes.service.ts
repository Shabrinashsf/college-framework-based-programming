import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreateLikeDto } from './dto/create-like.dto';
import { UpdateLikeDto } from './dto/update-like.dto';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class LikesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createLikeDto: CreateLikeDto) {
    // TODO: Implement like creation with Prisma
    return await this.prisma.like.create({
      data: createLikeDto,
    });
  }

  async findAll() {
    // TODO: Implement find all likes with Prisma
    return await this.prisma.like.findMany();
  }

  async findOne(id: number) {
    // TODO: Implement find like by id with Prisma
    const like = await this.prisma.like.findUnique({
      where: { id },
    });
    if (!like) throw new NotFoundException(`Like with ID ${id} not found`);
    return like;
  }

  async update(id: number, updateLikeDto: UpdateLikeDto) {
    // TODO: Implement like update with Prisma
    await this.findOne(id);
    return this.prisma.like.update({
      where: { id },
      data: updateLikeDto,
    });
  }

  async remove(id: number) {
    // TODO: Implement like removal with Prisma
    await this.findOne(id);
    await this.prisma.like.delete({
      where: { id },
    });
  }
}

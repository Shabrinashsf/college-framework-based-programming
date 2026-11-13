import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class PostsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createPostDto: CreatePostDto) {
    // TODO: Implement post creation with Prisma
    return await this.prisma.post.create({
      data: createPostDto,
    });
  }

  async findAll() {
    // TODO: Implement find all posts with Prisma
    return await this.prisma.post.findMany({
      include: {
        likes: true,
      },
    });
  }

  async findOne(id: number) {
    // TODO: Implement find post by id with Prisma
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        likes: true,
      },
    });
    if (!post) throw new NotFoundException(`Post with ID ${id} not found`);
    return post;
  }

  async update(id: number, updatePostDto: UpdatePostDto) {
    // TODO: Implement post update with Prisma
    await this.findOne(id);
    return this.prisma.post.update({
      where: { id },
      data: updatePostDto,
    });
  }

  async remove(id: number) {
    // TODO: Implement post removal with Prisma
    await this.findOne(id);
    await this.prisma.post.delete({
      where: { id },
    });
  }
}

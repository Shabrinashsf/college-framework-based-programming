import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { handlePrismaError } from '../common/prisma-error.handler';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  async create(createPostDto: CreatePostDto) {
    try {
      return await this.prisma.post.create({
        data: createPostDto,
      });
    } catch (error) {
      handlePrismaError(error, 'create post');
    }
  }

  findAll() {
    return this.prisma.post.findMany({
      include: { replies: { orderBy: { createdAt: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  findOne(id: string) {
    return this.prisma.post.findUnique({
      where: { id },
      include: {
        replies: {
          orderBy: { createdAt: 'asc' },
          include: { replies: true }, // to show "N more replies" under each reply
        },
      },
    });
  }

  findReplies(id: string) {
    return this.prisma.post.findMany({
      where: { replyToId: id },
      orderBy: { createdAt: 'asc' },
    });
  }

  async update(id: string, updatePostDto: UpdatePostDto) {
    try {
      return await this.prisma.post.update({
        where: { id },
        data: updatePostDto,
      });
    } catch (error) {
      handlePrismaError(error, 'update post');
    }
  }

  async remove(id: string) {
    try {
      return await this.prisma.post.delete({
        where: { id },
      });
    } catch (error) {
      handlePrismaError(error, 'delete post');
    }
  }
}

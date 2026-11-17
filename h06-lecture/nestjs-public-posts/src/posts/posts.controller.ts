import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Delete,
  NotFoundException,
  ParseIntPipe,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { handlePrismaError } from '../common/prisma-error.handler';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  // `return await` (not bare `return`) so Prisma errors are caught here
  // and mapped to proper HTTP status codes instead of a generic 500.

  @Post()
  async create(@Body() createPostDto: CreatePostDto) {
    try {
      return await this.postsService.create(createPostDto);
    } catch (error) {
      handlePrismaError(error, 'create post');
    }
  }

  @Get()
  async findAll() {
    try {
      return await this.postsService.findAll();
    } catch (error) {
      handlePrismaError(error, 'fetch posts');
    }
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    try {
      const post = await this.postsService.findOne(id);
      if (!post) {
        throw new NotFoundException('Post not found');
      }
      return post;
    } catch (error) {
      handlePrismaError(error, 'fetch post');
    }
  }

  @Put(':id')
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    try {
      return await this.postsService.update(id, updatePostDto);
    } catch (error) {
      handlePrismaError(error, 'update post');
    }
  }

  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number) {
    try {
      return await this.postsService.remove(id);
    } catch (error) {
      handlePrismaError(error, 'delete post');
    }
  }
}

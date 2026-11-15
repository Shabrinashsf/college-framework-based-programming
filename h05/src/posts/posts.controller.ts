import {
  Body,
  Controller,
  Get,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Redirect,
  Render,
} from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { handlePrismaError } from '../common/prisma-error.handler';

@Controller('posts')
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  private async findOrFail(id: string) {
    const post = await this.postsService.findOne(id);
    if (!post) {
      throw new NotFoundException('Post not found');
    }
    return post;
  }

  // GET /posts -> views/index.ejs
  @Get()
  @Render('index')
  async index() {
    const posts = await this.postsService.findAll();
    return { posts };
  }

  // GET /posts/new -> views/new.ejs
  @Get('new')
  @Render('new')
  newForm() {
    return {};
  }

  // POST /posts -> make a new post / reply, then redirect
  @Post()
  @Redirect('/posts', HttpStatus.SEE_OTHER)
  async create(@Body() dto: CreatePostDto) {
    try {
      const post = await this.postsService.create(dto);
      // if it's a reply, redirect to the parent post
      if (post.replyToId) {
        return { url: `/posts/${post.replyToId}` };
      }
    } catch (error) {
      handlePrismaError(error, 'create post');
    }
  }

  // GET /posts/:id -> views/show.ejs
  @Get(':id')
  @Render('show')
  async show(@Param('id') id: string) {
    const post = await this.findOrFail(id);
    return { post };
  }

  // GET /posts/:id/reply -> views/reply.ejs
  @Get(':id/reply')
  @Render('reply')
  async replyForm(@Param('id') id: string) {
    const post = await this.findOrFail(id);
    return { post };
  }

  // GET /posts/:id/edit -> views/edit.ejs
  @Get(':id/edit')
  @Render('edit')
  async editForm(@Param('id') id: string) {
    const post = await this.findOrFail(id);
    return { post };
  }

  // POST /posts/:id -> update, then redirect to /posts
  @Post(':id')
  @Redirect('/posts', HttpStatus.SEE_OTHER)
  async update(@Param('id') id: string, @Body() dto: UpdatePostDto) {
    try {
      await this.postsService.update(id, dto);
      return { url: `/posts/${id}` };
    } catch (error) {
      handlePrismaError(error, 'update post');
    }
  }

  // POST /posts/:id/delete -> delete, then redirect to /posts
  @Post(':id/delete')
  @Redirect('/posts', HttpStatus.SEE_OTHER)
  async remove(@Param('id') id: string) {
    try {
      const deleted = await this.postsService.remove(id);
      // if the deleted post is a reply, redirect to the parent post
      if (deleted.replyToId) {
        return { url: `/posts/${deleted.replyToId}` };
      }
    } catch (error) {
      handlePrismaError(error, 'delete post');
    }
  }
}

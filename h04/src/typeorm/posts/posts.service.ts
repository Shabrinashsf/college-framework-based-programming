import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './entities/post.entity';
import { NotFoundException } from '@nestjs/common/exceptions/not-found.exception';

@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  async create(createPostDto: CreatePostDto): Promise<Post> {
    // TODO: Implement post creation
    const post = this.postRepository.create(createPostDto);
    return await this.postRepository.save(post);
  }

  async findAll(): Promise<Post[]> {
    // TODO: Implement find all posts
    return await this.postRepository.find({ relations: ['likes', 'author'] });
  }

  async findOne(id: number): Promise<Post> {
    // TODO: Implement find post by id
    const user = await this.postRepository.findOne({
      where: { id },
      relations: ['likes', 'author'],
    });
    if (!user) throw new NotFoundException(`Post with id ${id} not found`);
    return user;
  }

  async update(id: number, updatePostDto: UpdatePostDto): Promise<Post> {
    // TODO: Implement post update
    const user = await this.findOne(id);
    Object.assign(user, updatePostDto);
    return await this.postRepository.save(user);
  }

  async remove(id: number): Promise<void> {
    // TODO: Implement post removal
    const user = await this.findOne(id);
    await this.postRepository.remove(user);
  }
}

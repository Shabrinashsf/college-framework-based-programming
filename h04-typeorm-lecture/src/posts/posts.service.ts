import { Injectable } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './entities/post.entity';
import { Repository } from 'typeorm/repository/Repository.js';
import { InjectRepository } from '@nestjs/typeorm';


@Injectable()
export class PostsService {
  constructor(
    @InjectRepository(Post)
    private readonly postRepository: Repository<Post>,
  ) {}

  create(createPostDto: CreatePostDto) {
    return 'This action adds a new post';
  }

  findAll() {
    return `This action returns all posts`;
  }

  findOne(id: number) {
    return `This action returns a #${id} post`;
  }

  async findByAuthor(authorId: number): Promise<Post[]> {
    return await this.postRepository.find({
      where: { authorId },
      relations: { author: true },   
    })
  }

  update(id: number, updatePostDto: UpdatePostDto) {
    return `This action updates a #${id} post`;
  }

  remove(id: number) {
    return `This action removes a #${id} post`;
  }
}

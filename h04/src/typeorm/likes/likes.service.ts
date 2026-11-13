import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateLikeDto } from './dto/create-like.dto';
import { UpdateLikeDto } from './dto/update-like.dto';
import { Like } from './entities/like.entity';
import { NotFoundException } from '@nestjs/common/exceptions/not-found.exception';

@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(Like)
    private readonly likeRepository: Repository<Like>,
  ) {}

  async create(createLikeDto: CreateLikeDto): Promise<Like> {
    // TODO: Implement like creation
    const like = this.likeRepository.create(createLikeDto);
    return await this.likeRepository.save(like);
  }

  async findAll(): Promise<Like[]> {
    // TODO: Implement find all likes
    return await this.likeRepository.find({ relations: ['user', 'post'] });
  }

  async findOne(id: number): Promise<Like> {
    // TODO: Implement find like by id
    const like = await this.likeRepository.findOne({
      where: { id },
      relations: ['user', 'post'],
    });
    if (!like) throw new NotFoundException(`Like with id ${id} not found`);
    return like;
  }

  async update(id: number, updateLikeDto: UpdateLikeDto): Promise<Like> {
    // TODO: Implement like update
    const like = await this.findOne(id);
    Object.assign(like, updateLikeDto);
    return await this.likeRepository.save(like);
  }

  async remove(id: number): Promise<void> {
    // TODO: Implement like removal
    const like = await this.findOne(id);
    await this.likeRepository.remove(like);
  }
}

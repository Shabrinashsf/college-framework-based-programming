import {
  Column,
  Entity,
  JoinColumn,
  OneToMany,
  PrimaryGeneratedColumn,
  ManyToOne,
} from 'typeorm';
import { Like } from '../../likes/entities/like.entity';
import { User } from '../../users/entities/user.entity';

@Entity('posts')
export class Post {
  // TODO: Implement post entity fields and relationships
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  content: string;

  @Column()
  authorId: number;

  @OneToMany(() => Like, (like) => like.post)
  likes: Like[];

  @ManyToOne(() => User, (user) => user.posts)
  @JoinColumn({ name: 'authorId' })
  author: User;
}

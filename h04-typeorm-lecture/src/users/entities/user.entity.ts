import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { Post } from '../../posts/entities/post.entity';

@Entity()   // table
export class User {
    @PrimaryGeneratedColumn()   // auto-increment id
    id: number;

    @Column()
    name: string;   // column (type inferred)

    @Column({ unique: true })
    email: string;

    @Column({ nullable: true })
    bio: string;

    @OneToMany(() => Post, (post) => post.author)
    Posts: Post[];

    @CreateDateColumn() // timestamp
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;    // timestamp
}

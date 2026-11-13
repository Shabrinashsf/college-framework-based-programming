import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity()   // table
export class Post {
    @PrimaryGeneratedColumn()   // auto-increment id
    id: number;

    @Column()
    title: string;   // column (type inferred)

    @Column({ unique: true })
    email: string;

    @Column('text')
    content: string;

    @Column({ default: false })
    published: boolean;

    @ManyToOne(() => User, (user) => user.Posts)
    @JoinColumn({ name: 'authorId' })   // ties the relation to the explicit authorId column, so we can set the FK directly
    author: User;

    @Column()
    authorId: number;

    @CreateDateColumn() // timestamp
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;    // timestamp
}

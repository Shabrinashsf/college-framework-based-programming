import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';

@Module({
  // forFeature([Entity]) = repositories this module may inject
  imports: [TypeOrmModule.forFeature([User])],   // register User repository
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],  // exports lets other modules (e.g. posts) reuse UsersService
})
export class UsersModule {}
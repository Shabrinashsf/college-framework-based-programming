import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { PostsModule } from './posts/posts.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { getDatabaseConfig } from './config/database/database.config';

@Module({
  imports: [
  // forRoot = connection (once, in AppModule)
    TypeOrmModule.forRoot(getDatabaseConfig()),   // one connection, whole app
    UsersModule, 
    PostsModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

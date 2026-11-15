import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { PrismaService } from '../prisma.service';
import { ViewHelpersMiddleware } from '../common/view-helpers.middleware';

@Module({
  controllers: [PostsController],
  providers: [PostsService, PrismaService],
})
export class PostsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ViewHelpersMiddleware).forRoutes(PostsController);
  }
}

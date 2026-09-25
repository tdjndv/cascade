// apps/backend/src/app/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { typeOrmConfig } from './config/typeorm.config';
import { UserModule } from './users/user.module';
import { PostModule } from './posts/post.module';
import { CommentModule } from './comments/comment.module';
import { VoteModule } from './votes/vote.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: typeOrmConfig,
    }),
    AuthModule,
    UserModule,
    PostModule,
    CommentModule,
    VoteModule,
  ],
})
export class AppModule {}

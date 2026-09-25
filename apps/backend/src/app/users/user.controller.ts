// apps/backend/src/app/users/user.controller.ts
import { Controller, Get, Param } from '@nestjs/common';
import { OptionalAuth } from '../auth/decorators/optional-auth.decorator';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @OptionalAuth()
  @Get(':username')
  getProfile(@Param('username') username: string) {
    return this.userService.getProfile(username);
  }
}
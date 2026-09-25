import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
} from '@nestjs/common';
import { UserService } from '../users/user.service';
import { AuthService } from './auth.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { Jwt } from '../type/auth.type';
import { Public } from './decorators/public.decorator';
import { CurrentUser } from './decorators/current-user.decorator';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Public()
  @Post('signup')
  signUp(@Body() data: SignUpDto) {
    return this.authService.signUp(data.email, data.username, data.password);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post('signin')
  signIn(@Body() data: SignInDto) {
    return this.authService.signIn(data.identifier, data.password);
  }

  @Get('me')
  async me(@CurrentUser() jwt: Jwt) {
    const user = await this.userService.findByIdOrFail(jwt.sub);
    return this.userService.toPublic(user);
  }
}

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../users/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from '../users/user.entity';

const ROUNDS = 12;
const DUMMY_HASH = 'ZPSFrai94BOEDE8PCybz+ZH0wmKUEhYgf1FYiYXFCeU=';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {}

  async signUp(
    email: string,
    username: string,
    password: string,
  ): Promise<{ access_token: string }> {
    const passwordHash = await bcrypt.hash(password, ROUNDS);
    const user = await this.userService.create(email, username, passwordHash);
    return this.issueToken(user);
  }

  async signIn(
    identifier: string,
    password: string,
  ): Promise<{ access_token: string }> {
    const user = await this.userService.findByEmailOrUsername(identifier);
    const match = await bcrypt.compare(
      password,
      user?.passwordHash ?? DUMMY_HASH,
    );

    if (!user || !match) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return this.issueToken(user);
  }

  private async issueToken(user: User): Promise<{ access_token: string }> {
    return {
      access_token: await this.jwtService.signAsync({
        sub: user.id,
        username: user.username,
      }),
    };
  }
}

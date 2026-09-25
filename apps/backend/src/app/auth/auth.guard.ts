import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { Jwt } from '../../app/type/auth.type';
import { IS_OPTIONAL_KEY } from './decorators/optional-auth.decorator';
import { IS_PUBLIC_KEY } from './decorators/public.decorator';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const targets = [context.getHandler(), context.getClass()];

    const isPublic = this.reflector.getAllAndOverride<boolean>(
      IS_PUBLIC_KEY,
      targets,
    );
    if (isPublic) {
      return true;
    }

    const isOptional = this.reflector.getAllAndOverride<boolean>(
      IS_OPTIONAL_KEY,
      targets,
    );

    const request = context
      .switchToHttp()
      .getRequest<Request & { user?: Jwt }>();

    const token = this.extractTokenFromHeader(request);

    if (!token) {
      if (isOptional) return true;
      throw new UnauthorizedException();
    }

    try {
      request.user = await this.jwtService.verifyAsync<Jwt>(token);
    } catch {
      if (isOptional) return true;
      throw new UnauthorizedException();
    }

    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}

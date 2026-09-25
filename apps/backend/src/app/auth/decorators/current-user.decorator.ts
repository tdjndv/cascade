import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Jwt } from '../../type/auth.type';

export const CurrentUser = createParamDecorator(
  (data: keyof Jwt | undefined, ctx: ExecutionContext) => {
    const user = ctx.switchToHttp().getRequest().user as Jwt;
    return data ? user?.[data] : user;
  },
);

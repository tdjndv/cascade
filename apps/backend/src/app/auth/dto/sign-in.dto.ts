import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class SignInDto {
  @IsString()
  @MinLength(3)
  @MaxLength(254)
  identifier: string;

  @IsString()
  @MaxLength(72)
  password: string;
}

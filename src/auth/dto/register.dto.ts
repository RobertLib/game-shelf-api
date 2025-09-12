import { IsEmail, IsString } from 'class-validator';
import {
  IsStrongPassword,
  IsPasswordMatch,
} from '../../common/validators/password.validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsStrongPassword()
  password: string;

  @IsString()
  @IsPasswordMatch('password')
  confirmPassword: string;
}

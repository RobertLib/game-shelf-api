import { IsString, IsNotEmpty } from 'class-validator';
import {
  IsStrongPassword,
  IsPasswordMatch,
} from '../../common/validators/password.validator';

export class VerifyAccountDto {
  @IsString()
  @IsNotEmpty()
  @IsStrongPassword()
  password: string;

  @IsString()
  @IsNotEmpty()
  @IsPasswordMatch('password')
  confirmPassword: string;

  @IsString()
  @IsNotEmpty()
  key: string;
}

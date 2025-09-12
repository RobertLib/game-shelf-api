import { InputType, Field } from '@nestjs/graphql';
import {
  IsEmail,
  IsString,
  IsOptional,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { IsStrongPassword } from '../../common/validators/password.validator';
import { UserRole } from '../enums/user-role.enum';

@InputType()
export class UserCreateInput {
  @Field()
  @IsEmail()
  email: string;

  @Field()
  @IsString()
  @IsStrongPassword()
  password: string;

  @Field(() => UserRole, { nullable: true, defaultValue: UserRole.USER })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  verificationToken?: string;
}

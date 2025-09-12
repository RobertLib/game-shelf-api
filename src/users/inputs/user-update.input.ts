import { InputType, Field } from '@nestjs/graphql';
import {
  IsEmail,
  IsString,
  IsOptional,
  IsEnum,
  IsNotEmpty,
  IsBoolean,
  IsDate,
} from 'class-validator';
import { IsStrongPassword } from '../../common/validators/password.validator';
import { UserRole } from '../enums/user-role.enum';

@InputType()
export class UserUpdateInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  id: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsEmail()
  email?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  @IsStrongPassword()
  password?: string;

  @Field(() => UserRole, { nullable: true })
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
  verificationToken?: string | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  resetPasswordToken?: string | null;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  @IsDate()
  resetPasswordExpires?: Date | null;
}

import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsNotEmpty } from 'class-validator';

@InputType()
export class UserDestroyInput {
  @Field(() => String)
  @IsString()
  @IsNotEmpty()
  id: string;
}

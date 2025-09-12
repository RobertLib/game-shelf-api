import { InputType, Field } from '@nestjs/graphql';
import { IsOptional, IsEnum } from 'class-validator';
import { SortOrder } from '../../common/pagination';

@InputType()
export class UserSortInput {
  @Field(() => SortOrder, { nullable: true })
  @IsOptional()
  @IsEnum(SortOrder)
  email?: SortOrder;
}

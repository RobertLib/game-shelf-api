import { ArgsType, Field } from '@nestjs/graphql';
import { IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { UserFilterInput } from '../inputs/user-filter.input';
import { UserSortInput } from '../inputs/user-sort.input';
import { PaginationArgs } from '../../common/pagination';

@ArgsType()
export class UsersArgs extends PaginationArgs {
  @Field(() => UserFilterInput, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => UserFilterInput)
  filter?: UserFilterInput;

  @Field(() => UserSortInput, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => UserSortInput)
  sort?: UserSortInput;
}

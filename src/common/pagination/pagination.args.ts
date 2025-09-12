import { ArgsType, Field, Int, registerEnumType } from '@nestjs/graphql';
import { IsOptional, IsPositive, Max } from 'class-validator';

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

registerEnumType(SortOrder, {
  name: 'SortOrder',
  description: 'Sort order',
});

@ArgsType()
export class PaginationArgs {
  @Field(() => Int, { nullable: true, defaultValue: 10 })
  @IsOptional()
  @IsPositive()
  @Max(100)
  first?: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  after?: string;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsPositive()
  @Max(100)
  last?: number;

  @Field(() => String, { nullable: true })
  @IsOptional()
  before?: string;
}

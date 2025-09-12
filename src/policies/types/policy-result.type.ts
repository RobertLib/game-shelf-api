import { ObjectType, Field } from '@nestjs/graphql';

@ObjectType()
export class PolicyResultType {
  @Field()
  value: boolean;

  @Field({ nullable: true })
  message?: string;
}

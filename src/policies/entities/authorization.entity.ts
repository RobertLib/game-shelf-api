import { ObjectType, Field } from '@nestjs/graphql';
import { PolicyResultType } from '../types/policy-result.type';

@ObjectType()
export class Authorization {
  @Field(() => PolicyResultType)
  canCreateUser: PolicyResultType;

  @Field(() => PolicyResultType)
  canIndexUsers: PolicyResultType;
}

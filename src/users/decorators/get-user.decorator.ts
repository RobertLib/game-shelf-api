import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { User } from '../entities/user.entity';

interface GraphQLContext {
  req: {
    user: User;
  };
}

export const GetUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext): User => {
    const gqlCtx = GqlExecutionContext.create(ctx);
    const context = gqlCtx.getContext<GraphQLContext>();
    return context.req.user;
  },
);

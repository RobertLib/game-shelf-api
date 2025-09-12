import { Resolver, Query } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { GetUser } from '../decorators/get-user.decorator';
import { User } from '../entities/user.entity';
import { PolicyService, Authorization } from '../../policies';

@Resolver()
@UseGuards(JwtAuthGuard)
export class UsersAuthorizationResolver {
  constructor(private readonly policyService: PolicyService) {}

  @Query(() => Authorization)
  authorization(@GetUser() currentUser: User): Authorization {
    const canIndexUsers = this.policyService.canIndex('User', {
      actor: currentUser,
      resource: undefined,
    });

    const canCreateUser = this.policyService.canCreate('User', {
      actor: currentUser,
      resource: undefined,
    });

    return {
      canIndexUsers,
      canCreateUser,
    };
  }
}

import {
  Resolver,
  Query,
  Mutation,
  Args,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { UsersService } from '../users.service';
import { User, UserConnection } from '../entities/user.entity';
import { UserCreateInput } from '../inputs/user-create.input';
import { UserUpdateInput } from '../inputs/user-update.input';
import { UserDestroyInput } from '../inputs/user-destroy.input';
import { UsersArgs } from '../args/users.args';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { UserRolesGuard } from '../guards/user-roles.guard';
import { UserRoles } from '../decorators/user-roles.decorator';
import { UserRole } from '../enums/user-role.enum';
import { GetUser } from '../decorators/get-user.decorator';
import type { PolicyResult } from '../../policies/interfaces/policy-result.interface';
import { PolicyResultType } from '../../policies/types/policy-result.type';
import { Policy } from '../../policies/decorators/policy.decorator';
import { PolicyAction } from '../../policies/enums/policy-action.enum';
import { PolicyGuard } from '../../policies/guards/policy.guard';
import { PolicyService } from '../../policies/policy.service';

@Resolver(() => User)
@UseGuards(JwtAuthGuard, UserRolesGuard)
@UserRoles(UserRole.ADMIN)
export class UsersResolver {
  constructor(
    private readonly usersService: UsersService,
    private readonly policyService: PolicyService,
  ) {}

  @Query(() => UserConnection, { name: 'users' })
  @UseGuards(PolicyGuard)
  @Policy({ action: PolicyAction.INDEX, entity: 'User' })
  async findAll(@Args() args: UsersArgs): Promise<UserConnection> {
    return this.usersService.findAll(args);
  }

  @Query(() => User, { name: 'user', nullable: true })
  @UseGuards(PolicyGuard)
  @Policy({ action: PolicyAction.SHOW, entity: 'User' })
  async findOne(@Args('id', { type: () => String }) id: string): Promise<User> {
    return this.usersService.findOne(id);
  }

  @Mutation(() => User)
  @UseGuards(PolicyGuard)
  @Policy({ action: PolicyAction.CREATE, entity: 'User' })
  async userCreate(@Args('input') input: UserCreateInput): Promise<User> {
    return this.usersService.createUser(input);
  }

  @Mutation(() => User)
  @UseGuards(PolicyGuard)
  @Policy({ action: PolicyAction.UPDATE, entity: 'User' })
  async userUpdate(@Args('input') input: UserUpdateInput): Promise<User> {
    return this.usersService.updateUser(input);
  }

  @Mutation(() => User)
  @UseGuards(PolicyGuard)
  @Policy({ action: PolicyAction.DELETE, entity: 'User' })
  async userDestroy(@Args('input') input: UserDestroyInput): Promise<User> {
    return this.usersService.destroy(input);
  }

  // Policy resolvers
  @ResolveField(() => PolicyResultType)
  canShow(@Parent() user: User, @GetUser() currentUser: User): PolicyResult {
    return this.policyService.canShow('User', {
      actor: currentUser,
      resource: user,
    });
  }

  @ResolveField(() => PolicyResultType)
  canUpdate(@Parent() user: User, @GetUser() currentUser: User): PolicyResult {
    return this.policyService.canUpdate('User', {
      actor: currentUser,
      resource: user,
    });
  }

  @ResolveField(() => PolicyResultType)
  canDestroy(@Parent() user: User, @GetUser() currentUser: User): PolicyResult {
    return this.policyService.canDelete('User', {
      actor: currentUser,
      resource: user,
    });
  }
}

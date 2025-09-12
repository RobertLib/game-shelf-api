import { Injectable } from '@nestjs/common';
import { BasePolicy } from '../../policies/interfaces/base-policy.interface';
import {
  PolicyResult,
  PolicyContext,
} from '../../policies/interfaces/policy-result.interface';
import { RegisterPolicy } from '../../policies/decorators/register-policy.decorator';
import { UserRole } from '../enums/user-role.enum';
import { User } from '../entities/user.entity';

// Specific type for User policies
type UserPolicyContext = PolicyContext<User, { id: number }>;

@Injectable()
@RegisterPolicy('User')
export class UserPolicy extends BasePolicy<User, { id: number }> {
  canIndex(context: UserPolicyContext): PolicyResult {
    const actor = context.actor;

    // Administrators can view all users
    if (actor?.role === UserRole.ADMIN) {
      return { value: true };
    }

    return {
      value: false,
      message: 'You do not have permission to view users list',
    };
  }

  canShow(context: UserPolicyContext): PolicyResult {
    const actor = context.actor;
    const resource = context.resource;

    // Administrators can view any user
    if (actor?.role === UserRole.ADMIN) {
      return { value: true };
    }

    // Users can only view their own profiles
    if (actor && resource && actor.id === resource.id) {
      return { value: true };
    }

    return {
      value: false,
      message: 'You do not have permission to view this user',
    };
  }

  canCreate(context: UserPolicyContext): PolicyResult {
    const actor = context.actor;

    // Administrators can create users
    if (actor?.role === UserRole.ADMIN) {
      return { value: true };
    }

    return {
      value: false,
      message: 'You do not have permission to create users',
    };
  }

  canUpdate(context: UserPolicyContext): PolicyResult {
    const actor = context.actor;
    const resource = context.resource;

    // Administrators can update any user
    if (actor?.role === UserRole.ADMIN) {
      return { value: true };
    }

    // Users can only update their own profiles
    if (actor && resource && actor.id === resource.id) {
      return { value: true };
    }

    return {
      value: false,
      message: 'You do not have permission to update this user',
    };
  }

  canDelete(context: UserPolicyContext): PolicyResult {
    const actor = context.actor;
    const resource = context.resource;

    // Only administrators can delete users
    if (actor?.role === UserRole.ADMIN) {
      // Administrator cannot delete themselves
      if (actor.id === resource?.id) {
        return {
          value: false,
          message: 'You cannot delete your own account',
        };
      }
      return { value: true };
    }

    return {
      value: false,
      message: 'You do not have permission to delete users',
    };
  }
}

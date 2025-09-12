import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { GqlExecutionContext } from '@nestjs/graphql';
import { PolicyService } from '../policy.service';
import { POLICY_KEY, PolicyConfig } from '../decorators/policy.decorator';
import { PolicyAction } from '../enums/policy-action.enum';
import {
  PolicyResult,
  PolicyContext,
} from '../interfaces/policy-result.interface';

interface RequestContext {
  req: {
    user?: unknown;
  };
}

interface ArgsWithId {
  id?: string | number;
}

@Injectable()
export class PolicyGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private policyService: PolicyService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const policyConfig = this.reflector.getAllAndOverride<PolicyConfig>(
      POLICY_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!policyConfig) {
      return true;
    }

    const ctx = GqlExecutionContext.create(context);
    const gqlContext = ctx.getContext<RequestContext>();
    const { user } = gqlContext.req;
    const args = ctx.getArgs<ArgsWithId>();

    // For operations with specific records (show, update, delete)
    // we expect ID in arguments
    let resource: { id?: string | number } | undefined;
    if (
      [PolicyAction.SHOW, PolicyAction.UPDATE, PolicyAction.DELETE].includes(
        policyConfig.action,
      )
    ) {
      resource = { id: args.id };
    }

    const policyContext: PolicyContext = { actor: user, resource };

    let result: PolicyResult;
    switch (policyConfig.action) {
      case PolicyAction.INDEX:
        result = this.policyService.canIndex(
          policyConfig.entity,
          policyContext,
        );
        break;
      case PolicyAction.SHOW:
        result = this.policyService.canShow(policyConfig.entity, policyContext);
        break;
      case PolicyAction.CREATE:
        result = this.policyService.canCreate(
          policyConfig.entity,
          policyContext,
        );
        break;
      case PolicyAction.UPDATE:
        result = this.policyService.canUpdate(
          policyConfig.entity,
          policyContext,
        );
        break;
      case PolicyAction.DELETE:
        result = this.policyService.canDelete(
          policyConfig.entity,
          policyContext,
        );
        break;
      default:
        return false;
    }

    if (!result.value) {
      throw new ForbiddenException(result.message || 'Access denied');
    }

    return true;
  }
}

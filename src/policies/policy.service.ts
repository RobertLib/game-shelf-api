import { Injectable } from '@nestjs/common';
import { ModuleRef, Reflector } from '@nestjs/core';
import {
  PolicyResult,
  PolicyContext,
} from './interfaces/policy-result.interface';
import { BasePolicy } from './interfaces/base-policy.interface';
import { REGISTER_POLICY_KEY } from './decorators/register-policy.decorator';

@Injectable()
export class PolicyService {
  private policies = new Map<string, BasePolicy<any, any>>();

  constructor(
    private moduleRef: ModuleRef,
    private reflector: Reflector,
  ) {}

  registerPolicy(entityName: string, policy: BasePolicy<any, any>): void {
    this.policies.set(entityName, policy);
  }

  autoRegisterPolicy(
    policyClass: new (...args: any[]) => BasePolicy<any, any>,
  ): void {
    const entityName = this.reflector.get<string>(
      REGISTER_POLICY_KEY,
      policyClass,
    );
    if (entityName) {
      const policyInstance = this.moduleRef.get(policyClass, { strict: false });
      this.registerPolicy(entityName, policyInstance);
    }
  }

  getPolicy(entityName: string): BasePolicy<any, any> | undefined {
    return this.policies.get(entityName);
  }

  canShow(entityName: string, context: PolicyContext<any, any>): PolicyResult {
    const policy = this.getPolicy(entityName);
    if (!policy) {
      return { value: false, message: 'No policy found for this entity' };
    }
    return policy.canShow(context);
  }

  canIndex(entityName: string, context: PolicyContext<any, any>): PolicyResult {
    const policy = this.getPolicy(entityName);
    if (!policy) {
      return { value: false, message: 'No policy found for this entity' };
    }
    return policy.canIndex(context);
  }

  canCreate(
    entityName: string,
    context: PolicyContext<any, any>,
  ): PolicyResult {
    const policy = this.getPolicy(entityName);
    if (!policy) {
      return { value: false, message: 'No policy found for this entity' };
    }
    return policy.canCreate(context);
  }

  canUpdate(
    entityName: string,
    context: PolicyContext<any, any>,
  ): PolicyResult {
    const policy = this.getPolicy(entityName);
    if (!policy) {
      return { value: false, message: 'No policy found for this entity' };
    }
    return policy.canUpdate(context);
  }

  canDelete(
    entityName: string,
    context: PolicyContext<any, any>,
  ): PolicyResult {
    const policy = this.getPolicy(entityName);
    if (!policy) {
      return { value: false, message: 'No policy found for this entity' };
    }
    return policy.canDelete(context);
  }
}

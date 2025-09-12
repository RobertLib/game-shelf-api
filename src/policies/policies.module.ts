import { Module, OnModuleInit } from '@nestjs/common';
import { PolicyService } from './policy.service';
import { UserPolicy } from '../users/policies/user.policy';
import { PolicyGuard } from './guards/policy.guard';

@Module({
  providers: [PolicyService, UserPolicy, PolicyGuard],
  exports: [PolicyService, PolicyGuard],
})
export class PoliciesModule implements OnModuleInit {
  constructor(private policyService: PolicyService) {}

  onModuleInit() {
    // Auto-register policies using decorators
    this.policyService.autoRegisterPolicy(UserPolicy);
  }
}

import { SetMetadata } from '@nestjs/common';
import { PolicyAction } from '../enums/policy-action.enum';

export const POLICY_KEY = 'policy';

export interface PolicyConfig {
  action: PolicyAction;
  entity: string;
}

export const Policy = (config: PolicyConfig) => SetMetadata(POLICY_KEY, config);

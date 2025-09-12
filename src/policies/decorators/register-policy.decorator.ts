import { SetMetadata } from '@nestjs/common';

export const REGISTER_POLICY_KEY = 'register_policy';

export const RegisterPolicy = (entityName: string) =>
  SetMetadata(REGISTER_POLICY_KEY, entityName);

import { PolicyResult, PolicyContext } from './policy-result.interface';

export abstract class BasePolicy<TActor = any, TResource = any> {
  abstract canIndex(context: PolicyContext<TActor, TResource>): PolicyResult;
  abstract canShow(context: PolicyContext<TActor, TResource>): PolicyResult;
  abstract canCreate(context: PolicyContext<TActor, TResource>): PolicyResult;
  abstract canUpdate(context: PolicyContext<TActor, TResource>): PolicyResult;
  abstract canDelete(context: PolicyContext<TActor, TResource>): PolicyResult;
}

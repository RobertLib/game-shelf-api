export interface PolicyResult {
  value: boolean;
  message?: string;
}

export interface PolicyContext<TActor = any, TResource = any> {
  actor?: TActor;
  resource?: TResource;
  [key: string]: any;
}

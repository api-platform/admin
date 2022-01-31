import type { IntrospectPayload, IntrospectState } from './types';

const introspectReducer = (
  previousState: IntrospectState = {},
  { type, payload }: { type?: string; payload?: IntrospectPayload } = {},
): IntrospectState => {
  if (type !== 'INTROSPECT_SUCCESS') {
    return previousState;
  }

  return {
    introspect: payload,
  };
};

export default introspectReducer;

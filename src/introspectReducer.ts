import { IntrospectPayload } from './types';

const introspectReducer = (
  previousState = {},
  { type, payload }: { type: string; payload: IntrospectPayload },
) => {
  if (type !== 'INTROSPECT_SUCCESS') {
    return previousState;
  }

  return {
    introspect: payload,
  };
};

export default introspectReducer;

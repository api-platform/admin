const introspectReducer = (previousState = {}, { type, payload }) => {
  if (type !== 'INTROSPECT_SUCCESS') {
    return previousState;
  }

  return {
    introspect: payload,
  };
};

export default introspectReducer;

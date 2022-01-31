import { createContext } from 'react';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const IntrospectionContext = createContext({ introspect: () => {} });

export default IntrospectionContext;

import { createContext } from 'react';

const IntrospectionContext = createContext({ introspect: () => {} });

export default IntrospectionContext;

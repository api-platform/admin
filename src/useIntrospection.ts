import { useContext } from 'react';
import IntrospectionContext from './IntrospectionContext.js';

const useIntrospection = () => useContext(IntrospectionContext).introspect;

export default useIntrospection;

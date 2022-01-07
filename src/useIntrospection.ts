import { useContext } from 'react';
import IntrospectionContext from './IntrospectionContext';

const useIntrospection = () => useContext(IntrospectionContext).introspect;

export default useIntrospection;

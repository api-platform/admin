import { useContext } from 'react';
import { IntrospectionContext } from './IntrospectionContext';

export const useIntrospection = () =>
  useContext(IntrospectionContext).introspect;

import { useContext } from 'react';
import IntrospectionContext from './IntrospectionContext';

export default () => useContext(IntrospectionContext).introspect;

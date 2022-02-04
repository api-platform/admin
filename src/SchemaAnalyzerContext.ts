import {
  /* tree-shaking no-side-effects-when-called */ createContext,
} from 'react';
import type { SchemaAnalyzer } from './types';

const SchemaAnalyzerContext = createContext<SchemaAnalyzer | null>(null);

export default SchemaAnalyzerContext;

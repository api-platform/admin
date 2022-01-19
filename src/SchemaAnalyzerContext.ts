import { createContext } from 'react';
import { SchemaAnalyzer } from './types';

const SchemaAnalyzerContext = createContext<SchemaAnalyzer | null>(null);

export default SchemaAnalyzerContext;

import type { Field } from '@api-platform/api-doc-parser';
import type { SchemaAnalyzer } from './types.js';

export const isIdentifier = (field: Field, fieldType: string) =>
  ['integer_id', 'id'].includes(fieldType) || field.name === 'id';

const getIdentifierValue = (
  schemaAnalyzer: SchemaAnalyzer,
  resource: string,
  fields: Field[],
  fieldName: string,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value: any,
) => {
  const prefix = `/${resource}/`;

  if (typeof value === 'string' && value.indexOf(prefix) === 0) {
    const field = fields.find((fieldObj) => fieldObj.name === fieldName);
    if (!field) {
      return value;
    }
    const fieldType = schemaAnalyzer.getFieldType(field);
    if (isIdentifier(field, fieldType)) {
      const id = value.substring(prefix.length);
      if (['integer_id', 'integer'].includes(fieldType)) {
        return parseInt(id, 10);
      }
      return id;
    }
  }

  return value;
};

export default getIdentifierValue;

import type { Field, Resource } from '@api-platform/api-doc-parser';
import type { HttpError } from 'react-admin';
import type { JsonLdObj } from 'jsonld/jsonld-spec';
import {
  getFiltersParametersFromSchema,
  getOrderParametersFromSchema,
} from '../introspection/schemaAnalyzer.js';
import type { SchemaAnalyzer, SubmissionErrors } from '../types.js';

const withHttpScheme = (value: string | null | undefined) =>
  value?.startsWith('https://') ? value.replace(/^https/, 'http') : value;

/**
 * @param schema The schema of a resource
 *
 * @returns The name of the reference field
 */
const getFieldNameFromSchema = (schema: Resource) => {
  if (!schema.fields) {
    return '';
  }

  const field = schema.fields.find(
    (schemaField) =>
      withHttpScheme(schemaField.id) === 'http://schema.org/name',
  );

  return field ? field.name : 'id';
};

/**
 * @returns The type of the field
 */
const getFieldType = (field: Field) => {
  switch (withHttpScheme(field.id)) {
    case 'http://schema.org/identifier':
      return withHttpScheme(field.range) ===
        'http://www.w3.org/2001/XMLSchema#integer'
        ? 'integer_id'
        : 'id';
    case 'http://schema.org/email':
      return 'email';
    case 'http://schema.org/url':
      return 'url';
    default:
  }

  if (field.embedded !== null && field.maxCardinality !== 1) {
    return 'array';
  }

  switch (withHttpScheme(field.range)) {
    case 'http://www.w3.org/2001/XMLSchema#array':
      return 'array';
    case 'http://www.w3.org/2001/XMLSchema#integer':
      return 'integer';
    case 'http://www.w3.org/2001/XMLSchema#decimal':
    case 'http://www.w3.org/2001/XMLSchema#float':
      return 'float';
    case 'http://www.w3.org/2001/XMLSchema#boolean':
      return 'boolean';
    case 'http://www.w3.org/2001/XMLSchema#date':
      return 'date';
    case 'http://www.w3.org/2001/XMLSchema#dateTime':
      return 'dateTime';
    default:
      return 'text';
  }
};

const getSubmissionErrors = (error: HttpError) => {
  if (!error.body?.[0]) {
    return null;
  }

  const content = error.body[0];
  const violationKey = Object.keys(content).find((key) =>
    key.includes('violations'),
  );
  if (!violationKey) {
    return null;
  }
  const base = violationKey.substring(0, violationKey.indexOf('#'));

  const violations: SubmissionErrors = content[violationKey].reduce(
    (previousViolations: SubmissionErrors, violation: JsonLdObj) =>
      !violation[`${base}#propertyPath`] || !violation[`${base}#message`]
        ? previousViolations
        : {
            ...previousViolations,
            [(violation[`${base}#propertyPath`] as JsonLdObj[])[0]?.[
              '@value'
            ] as string]: (violation[`${base}#message`] as JsonLdObj[])[0]?.[
              '@value'
            ],
          },
    {},
  );
  if (Object.keys(violations).length === 0) {
    return null;
  }

  return violations;
};

export default function schemaAnalyzer(): SchemaAnalyzer {
  return {
    getFieldNameFromSchema,
    getOrderParametersFromSchema,
    getFiltersParametersFromSchema,
    getFieldType,
    getSubmissionErrors,
  };
}

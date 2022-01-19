import { Field, Resource } from '@api-platform/api-doc-parser';
import { HttpError } from 'react-admin';
import { JsonLdObj } from 'jsonld/jsonld-spec';
import { FilterParameter, SchemaAnalyzer, SubmissionErrors } from '../types';

/**
 * @param schema The schema of a resource
 *
 * @returns The filter parameters
 */
export const resolveSchemaParameters = (schema: Resource) => {
  if (!schema.parameters || !schema.getParameters) {
    return Promise.resolve([]);
  }

  return !schema.parameters.length
    ? schema.getParameters()
    : Promise.resolve(schema.parameters);
};

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
    (field) => 'http://schema.org/name' === field.id,
  );

  return field ? field.name : 'id';
};

const ORDER_MARKER = 'order[';

/**
 * @param schema The schema of a resource
 *
 * @returns The order filter parameters
 */
const getOrderParametersFromSchema = (schema: Resource): Promise<string[]> => {
  if (!schema.fields) {
    return Promise.resolve([]);
  }

  const authorizedFields = schema.fields.map((field) => field.name);
  return resolveSchemaParameters(schema).then((parameters) =>
    parameters
      .map((filter) => filter.variable)
      .filter((filter) => filter.includes(ORDER_MARKER))
      .map((orderFilter) =>
        orderFilter.replace(ORDER_MARKER, '').replace(']', ''),
      )
      .filter((filter) =>
        authorizedFields.includes(
          filter.split('.')[0] || '', // split to manage nested properties
        ),
      ),
  );
};

/**
 * @param schema The schema of a resource
 *
 * @returns The filter parameters without the order ones
 */
const getFiltersParametersFromSchema = (
  schema: Resource,
): Promise<FilterParameter[]> => {
  if (!schema.fields) {
    return Promise.resolve([]);
  }

  const authorizedFields = schema.fields.map((field) => field.name);
  return resolveSchemaParameters(schema).then((parameters) =>
    parameters
      .map((filter) => ({
        name: filter.variable,
        isRequired: filter.required,
      }))
      .filter((filter) => !filter.name.includes(ORDER_MARKER))
      .filter((filter) => authorizedFields.includes(filter.name)),
  );
};

/**
 * @returns The type of the field
 */
const getFieldType = (field: Field) => {
  switch (field.id) {
    case 'http://schema.org/identifier':
      return 'id';
    case 'http://schema.org/email':
      return 'email';
    case 'http://schema.org/url':
      return 'url';
    default:
  }

  if (null !== field.embedded && 1 !== field.maxCardinality) {
    return 'array';
  }

  switch (field.range) {
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
  if (!error.body || !error.body[0]) {
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
    (violations: SubmissionErrors, violation: JsonLdObj) =>
      !violation[`${base}#propertyPath`] || !violation[`${base}#message`]
        ? violations
        : {
            ...violations,
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

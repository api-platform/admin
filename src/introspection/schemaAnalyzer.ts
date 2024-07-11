import type { Resource } from '@api-platform/api-doc-parser';
import type { FilterParameter } from '../types.js';

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

const ORDER_MARKER = 'order[';

/**
 * @param schema The schema of a resource
 *
 * @returns The order filter parameters
 */
export const getOrderParametersFromSchema = (
  schema: Resource,
): Promise<string[]> => {
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
          filter.split('.')[0] ?? '', // split to manage nested properties
        ),
      ),
  );
};

/**
 * @param schema The schema of a resource
 *
 * @returns The filter parameters without the order ones
 */
export const getFiltersParametersFromSchema = (
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

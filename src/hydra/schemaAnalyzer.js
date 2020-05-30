/**
 * @param {Resource} schema The schema of a resource
 *
 * @returns {Promise<Parameter[]>} The filter parameters
 */
export const resolveSchemaParameters = (schema) =>
  !schema.parameters.length
    ? schema.getParameters()
    : Promise.resolve(schema.parameters);

/**
 * @param {Resource} schema The schema of a resource
 *
 * @returns {string} The name of the reference field
 */
const getFieldNameFromSchema = (schema) => {
  const field = schema.fields.find(
    (field) => 'http://schema.org/name' === field.id,
  );

  return field ? field.name : 'id';
};

const ORDER_MARKER = 'order[';

/**
 * @param {Resource} schema The schema of a resource
 *
 * @returns {Promise<Parameter[]>} The order filter parameters
 */
const getOrderParametersFromSchema = (schema) => {
  const authorizedFields = schema.fields.map((field) => field.name);
  return resolveSchemaParameters(schema).then((parameters) =>
    parameters
      .map((filter) => filter.variable)
      .filter((filter) => filter.includes(ORDER_MARKER))
      .map((orderFilter) =>
        orderFilter.replace(ORDER_MARKER, '').replace(']', ''),
      )
      .filter((filter) => authorizedFields.includes(filter)),
  );
};

/**
 * @param {Resource} schema The schema of a resource
 *
 * @returns {Promise<Parameter[]>} The filter parameters without the order ones
 */
const getFiltersParametersFromSchema = (schema) => {
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
 * @param {Field} field
 *
 * @returns {string} The type of the field
 */
const getFieldType = (field) => {
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

export default () => {
  return {
    getFieldNameFromSchema,
    getOrderParametersFromSchema,
    getFiltersParametersFromSchema,
    getFieldType,
  };
};

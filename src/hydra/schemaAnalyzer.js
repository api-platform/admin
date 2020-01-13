/**
 * @param {Resource} reference A reference resource field
 * @returns {string} The name of the reference field
 */
const getReferenceNameField = reference => {
  const field = reference.fields.find(
    field => 'http://schema.org/name' === field.id,
  );

  return field ? field.name : 'id';
};

const ORDER_MARKER = 'order[';

/**
 * @param {Resource} schema The schema of a resource
 * @returns {Parameter[]} The order filter parameters
 */
const getOrderParametersFromSchema = schema => {
  const authorizedFields = schema.fields.map(field => field.name);
  return schema.parameters
    .map(filter => filter.variable)
    .filter(filter => filter.includes(ORDER_MARKER))
    .map(orderFilter => orderFilter.replace(ORDER_MARKER, '').replace(']', ''))
    .filter(filter => authorizedFields.includes(filter));
};

/**
 * @param {Resource} schema The schema of a resource
 * @returns {Parameter[]} The filter parameters without the order ones
 */
const getFiltersParametersFromSchema = schema => {
  const authorizedFields = schema.fields.map(field => field.name);
  return schema.parameters
    .map(filter => ({
      name: filter.variable,
      isRequired: filter.required,
    }))
    .filter(filter => !filter.name.includes(ORDER_MARKER))
    .filter(filter => authorizedFields.includes(filter.name));
};

/**
 * @param {Field} field
 * @returns {string} The type of the field
 */
const getFieldType = field => {
  switch (field.id) {
    case 'http://schema.org/identifier':
      return 'id';
    case 'http://schema.org/email':
      return 'email';
    case 'http://schema.org/url':
      return 'url';
    default:
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
    getReferenceNameField,
    getOrderParametersFromSchema,
    getFiltersParametersFromSchema,
    getFieldType,
  };
};

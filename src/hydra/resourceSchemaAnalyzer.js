const getReferenceNameField = reference => {
  const field = reference.fields.find(
    field => 'http://schema.org/name' === field.id,
  );

  return field ? field.name : 'id';
};

const ORDER_MARKER = 'order[';

const getOrderParametersFromResourceSchema = resourceSchema => {
  const authorizedFields = resourceSchema.fields.map(field => field.name);
  return resourceSchema.parameters
    .map(filter => filter.variable)
    .filter(filter => filter.includes(ORDER_MARKER))
    .map(orderFilter => orderFilter.replace(ORDER_MARKER, '').replace(']', ''))
    .filter(filter => authorizedFields.includes(filter));
};

const getFiltersParametersFromResourceSchema = resourceSchema => {
  const authorizedFields = resourceSchema.fields.map(field => field.name);
  return resourceSchema.parameters
    .map(filter => ({
      name: filter.variable,
      isRequired: filter.required,
    }))
    .filter(filter => !filter.name.includes(ORDER_MARKER))
    .filter(filter => authorizedFields.includes(filter.name));
};

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
    getOrderParametersFromResourceSchema,
    getFiltersParametersFromResourceSchema,
    getFieldType,
  };
};

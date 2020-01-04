export function getReferenceNameField(reference) {
  const field = reference.fields.find(
    field => 'http://schema.org/name' === field.id,
  );

  return field ? field.name : 'id';
}

const ORDER_MARKER = 'order[';

export const getOrderParametersFromResourceSchema = resourceSchema => {
  const authorizedFields = resourceSchema.fields.map(field => field.name);
  return resourceSchema.parameters
    .map(filter => filter.variable)
    .filter(filter => filter.includes(ORDER_MARKER))
    .map(orderFilter => orderFilter.replace(ORDER_MARKER, '').replace(']', ''))
    .filter(filter => authorizedFields.includes(filter));
};

export const getFiltersParametersFromResourceSchema = resourceSchema => {
  const authorizedFields = resourceSchema.fields.map(field => field.name);
  return resourceSchema.parameters
    .map(filter => ({
      name: filter.variable,
      isRequired: filter.required,
    }))
    .filter(filter => !filter.name.includes(ORDER_MARKER))
    .filter(filter => authorizedFields.includes(filter.name));
};

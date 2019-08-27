import {Children} from 'react';

export function getResource(resources, resourceName) {
  return resources.find(({name}) => resourceName === name);
}

export function getResourceField(resource, resourceFieldName) {
  return resource.fields.find(({name}) => resourceFieldName === name);
}

export function replaceInput(resource, resourceFieldName, replaceInput) {
  const resourceField = getResourceField(resource, resourceFieldName);

  if (undefined === resourceField) return;

  resourceField.input = replaceInput;
}

export function replaceField(resource, resourceFieldName, replaceField) {
  const resourceField = getResourceField(resource, resourceFieldName);

  if (undefined === resourceField) return;

  resourceField.field = replaceField;
}

export function replaceResource(resources, replaceResource) {
  const resource = getResource(resources, replaceResource.name);

  if (undefined !== replaceResource.listFields) {
    resource.listFields = replaceResource.listFields;
  }

  if (undefined !== replaceResource.showFields) {
    resource.showFields = replaceResource.showFields;
  }

  if (undefined !== replaceResource.editFields) {
    resource.editFields = replaceResource.editFields;
  }

  if (undefined !== replaceResource.createFields) {
    resource.createFields = replaceResource.createFields;
  }

  if (undefined !== replaceResource.fields) {
    replaceResource.fields.forEach(resourceField => {
      if (resourceField.field) {
        replaceField(resource, resourceField.name, resourceField.field);
      }

      if (resourceField.input) {
        replaceInput(resource, resourceField.name, resourceField.input);
      }
    });
  }

  if (undefined !== replaceResource.list) {
    resource.list = replaceResource.list;
  }

  if (undefined !== replaceResource.show) {
    resource.show = replaceResource.show;
  }

  if (undefined !== replaceResource.create) {
    resource.create = replaceResource.create;
  }

  if (undefined !== replaceResource.edit) {
    resource.edit = replaceResource.edit;
  }

  if (undefined !== replaceResource.icon) {
    resource.icon = replaceResource.icon;
  }
}

export function replaceResources(resources, replaceResources) {
  replaceResources.forEach(resource => {
    replaceResource(resources, resource);
  });
}

export function existsAsChild(children) {
  const childrenNames = new Set(
    Children.map(children, child => child.props.name),
  );

  return ({name}) => !childrenNames.has(name);
}

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

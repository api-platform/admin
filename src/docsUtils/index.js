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

  if (undefined !== replaceResource.create) {
    resource.create = replaceResource.create;
  }

  if (undefined !== replaceResource.edit) {
    resource.edit = replaceResource.edit;
  }
}

export function replaceResources(resources, replaceResources) {
  replaceResources.forEach(resource => {
    replaceResource(resources, resource);
  });
}

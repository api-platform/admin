export const getResource = (resources, resourceName) =>
  resources.find(({name}) => resourceName === name);

export const getResourceField = (resource, resourceFieldName) =>
  resource.fields.find(({name}) => resourceFieldName === name);

export const overrideInput = (resource, resourceFieldName, overrideInput) => {
  const resourceField = getResourceField(resource, resourceFieldName);

  if (resourceField === undefined) {
    return;
  }

  resourceField.input = overrideInput;
};

export const overrideField = (resource, resourceFieldName, overrideField) => {
  const resourceField = getResourceField(resource, resourceFieldName);

  if (resourceField === undefined) {
    return;
  }

  resourceField.field = overrideField;
};

export const overrideResource = (resources, overrideResource) => {
  const resource = getResource(resources, overrideResource.name);

  if (overrideResource.listFields !== undefined) {
    resource.listFields = overrideResource.listFields;
  }

  if (overrideResource.fields !== undefined) {
    overrideResource.fields.forEach(resourceField => {
      if (resourceField.field) {
        overrideField(resource, resourceField.name, resourceField.field);
      }

      if (resourceField.input) {
        overrideInput(resource, resourceField.name, resourceField.input);
      }
    });
  }

  if (overrideResource.list !== undefined) {
    resource.list = overrideResource.list;
  }

  if (overrideResource.create !== undefined) {
    resource.create = overrideResource.create;
  }

  if (overrideResource.edit !== undefined) {
    resource.edit = overrideResource.edit;
  }
};

export default (resources, overrideResources) => {
  overrideResources.forEach(resource => {
    overrideResource(resources, resource);
  });
};

import React, {Children} from 'react';
import InputGuesser from '../InputGuesser';
import FieldGuesser from '../FieldGuesser';

export function notExistsAsChild(children, childPropName, childValue) {
  const childrenPropValues = new Set(
    Children.map(
      Children.toArray(children),
      child => child.props[childPropName],
    ),
  );

  return !childrenPropValues.has(childValue);
}

export function renderChild(children, childPropName) {
  return Children.toArray(children).find(
    child => child.props.source === childPropName,
  );
}

export function renderInput(children, inputName, resource) {
  const child = renderChild(children, inputName);
  if (child) {
    return child;
  }

  return <InputGuesser source={inputName} resource={resource} />;
}

export function renderField(children, fieldName, resource, props) {
  const child = renderChild(children, fieldName);
  if (child) {
    return child;
  }

  return (
    <FieldGuesser
      source={fieldName}
      resource={resource}
      addLabel={true}
      {...props}
    />
  );
}

export function getReferenceNameField(reference) {
  const field = reference.fields.find(
    field => 'http://schema.org/name' === field.id,
  );

  return field ? field.name : 'id';
}

export function getResourcePropertiesNames(
  resource,
  type,
  allowedPropertiesNames,
  children,
) {
  const propertiesNames =
    allowedPropertiesNames === undefined
      ? resource[`${type}Fields`].map(field => field.name)
      : allowedPropertiesNames;
  Children.toArray(children).forEach(child => {
    if (!propertiesNames.includes(child.props.source)) {
      propertiesNames.push(child.props.source);
    }
  });
  return propertiesNames;
}

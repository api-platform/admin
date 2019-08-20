import React from 'react';
import PropTypes from 'prop-types';
import {
  BooleanField,
  ChipField,
  DateField,
  EmailField,
  NumberField,
  ReferenceField,
  ReferenceArrayField,
  SingleFieldList,
  TextField,
  UrlField,
  Query,
  Loading,
} from 'react-admin';
import {getReferenceNameField} from './helpers';

const isFieldSortable = (field, resource) => {
  return (
    resource.parameters.filter(parameter => parameter.variable === field.name)
      .length > 0 &&
    resource.parameters.filter(
      parameter => parameter.variable === `order[${field.name}]`,
    ).length > 0
  );
};

const renderField = (resource, field, props) => {
  if (null !== field.reference) {
    if (1 === field.maxCardinality) {
      return (
        <ReferenceField reference={field.reference.name} {...props} allowEmpty>
          <ChipField source={getReferenceNameField(field.reference)} />
        </ReferenceField>
      );
    }

    const referenceNameField = getReferenceNameField(field.reference);
    return (
      <ReferenceArrayField reference={field.reference.name} {...props}>
        <SingleFieldList>
          <ChipField source={referenceNameField} key={referenceNameField} />
        </SingleFieldList>
      </ReferenceArrayField>
    );
  }

  switch (field.id) {
    case 'http://schema.org/email':
      return <EmailField {...props} />;

    case 'http://schema.org/url':
      return <UrlField {...props} />;

    default:
    // Do nothing
  }

  switch (field.range) {
    case 'http://www.w3.org/2001/XMLSchema#integer':
    case 'http://www.w3.org/2001/XMLSchema#float':
      return <NumberField {...props} />;

    case 'http://www.w3.org/2001/XMLSchema#date':
    case 'http://www.w3.org/2001/XMLSchema#dateTime':
      return <DateField {...props} />;

    case 'http://www.w3.org/2001/XMLSchema#boolean':
      return <BooleanField {...props} />;

    default:
      return <TextField {...props} />;
  }
};

const FieldGuesser = props => {
  const {source: fieldName, resource: resourceName} = props;

  return (
    <Query type="INTROSPECT">
      {({data, loading, error}) => {
        if (loading) {
          return <Loading />;
        }

        if (error) {
          console.error(error);
          return <div>Error while reading the API schema</div>;
        }

        const resource = data.resources.find(({name}) => resourceName === name);

        if (!resource || !resource.fields) {
          console.error(
            `Resource ${resourceName} not present inside api description`,
          );
          return `<div>Resource ${resourceName} not present inside api description</div>`;
        }

        const field = resource.readableFields.find(
          ({name}) => fieldName === name,
        );

        if (!field) {
          console.error(
            `Field ${props.source} not present inside the api description for the resource ${props.resource}`,
          );

          return `<div>Field ${fieldName} not present inside the api description for the resource ${resourceName}</div>`;
        }

        return renderField(resource, field, {
          sortable: isFieldSortable(field, resource),
          ...props,
        });
      }}
    </Query>
  );
};

export default FieldGuesser;

FieldGuesser.propTypes = {
  source: PropTypes.string.isRequired,
  resource: PropTypes.string,
};

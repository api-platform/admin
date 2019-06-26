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
import {getResource, getResourceField} from './docsUtils';
import getReferenceNameField from './getReferenceNameField';
import {isFieldSortable} from './fieldFactory';

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
      {({data: api, loading, error}) => {
        if (loading) {
          return <Loading />;
        }

        if (error) {
          console.error(error);
          return <div>Error while reading the API schema</div>;
        }

        const resource = getResource(api.resources, resourceName);

        if (!resource || !resource.fields) {
          console.error(
            `Resource ${resourceName} not present inside api description`,
          );
          return (
            <div>
              Resource ${resourceName} not present inside api description
            </div>
          );
        }

        const field = getResourceField(resource, fieldName);

        if (!field) {
          console.error(
            `Field ${props.source} not present inside the api description for the resource ${props.resource}`,
          );

          return (
            <div>
              Field ${fieldName} not present inside the api description for the
              resource ${resourceName}
            </div>
          );
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

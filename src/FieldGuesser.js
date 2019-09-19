import React, {Fragment} from 'react';
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
} from 'react-admin';
import {getReferenceNameField} from './docsUtils';
import IntrospectQuery from './IntrospectQuery';

const isFieldSortable = (field, resourceSchema) => {
  return (
    resourceSchema.parameters.filter(
      parameter => parameter.variable === field.name,
    ).length > 0 &&
    resourceSchema.parameters.filter(
      parameter => parameter.variable === `order[${field.name}]`,
    ).length > 0
  );
};

const renderField = (field, props) => {
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

export const FieldGuesserComponent = ({fields, resourceSchema, ...props}) => {
  const field = fields.find(f => f.name === props.source);

  if (!field) {
    console.error(
      `Field "${props.source}" not present inside the api description for the resource "${props.resource}"`,
    );

    return <Fragment />;
  }

  return renderField(field, {
    sortable: isFieldSortable(field, resourceSchema),
    ...props,
  });
};

const FieldGuesser = props => (
  <IntrospectQuery
    component={FieldGuesserComponent}
    includeDeprecated={true}
    {...props}
  />
);

FieldGuesser.propTypes = {
  source: PropTypes.string.isRequired,
};

export default FieldGuesser;

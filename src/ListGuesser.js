import React, {Children} from 'react';
import PropTypes from 'prop-types';
import {
  Datagrid,
  List,
  Query,
  EditButton,
  ShowButton,
  Loading,
} from 'react-admin';
import {getResource} from './docsUtils';
import FieldGuesser from './FieldGuesser';
import existsAsChild from './existsAsChild';
import FilterGuesser from './FilterGuesser';

const getFields = (
  {fields},
  allowedFieldNames = fields.map(defaultField => defaultField.name),
) => fields.filter(({name}) => allowedFieldNames.includes(name));

const ListGuesser = props => {
  const children = Children.toArray(props.children);
  const {
    resource: resourceName,
    fields: allowedFieldNames,
    hasEdit,
    hasShow,
  } = props;

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

        const fields = getFields(resource, allowedFieldNames).filter(
          existsAsChild(children),
        );

        return (
          <List {...props}>
            <Datagrid>
              {children}
              {fields.map(field => (
                <FieldGuesser key={field.name} source={field.name} />
              ))}
              {hasShow && <ShowButton />}
              {hasEdit && <EditButton />}
            </Datagrid>
          </List>
        );
      }}
    </Query>
  );
};

export default ListGuesser;

ListGuesser.propTypes = {
  children: PropTypes.object,
  resource: PropTypes.string.isRequired,
  fields: PropTypes.array,
  filters: PropTypes.object.isRequired,
};

ListGuesser.defaultProps = {
  filters: <FilterGuesser />,
};

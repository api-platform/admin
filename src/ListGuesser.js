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

        return (
          <List {...props}>
            <Datagrid>
              {getFields(resource, allowedFieldNames).map(field => {
                const child = children.find(
                  ({props: {source}}) => source === field.name,
                );
                if (undefined === child) {
                  return <FieldGuesser key={field.name} source={field.name} />;
                }

                return child;
              })}
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
};

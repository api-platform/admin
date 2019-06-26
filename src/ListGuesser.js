import React, {Children} from 'react';
import PropTypes from 'prop-types';
import {
  Datagrid,
  List,
  Query,
  EditButton,
  ShowButton,
  TranslationProvider,
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
          return (
            <TranslationProvider>
              <Loading />
            </TranslationProvider>
          );
        }

        if (error) {
          console.log(error);

          return <div>ERROR</div>;
        }

        const resource = getResource(api.resources, resourceName);

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

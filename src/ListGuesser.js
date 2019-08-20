import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {
  Datagrid,
  List,
  Query,
  EditButton,
  ShowButton,
  Loading,
} from 'react-admin';
import {getResourcePropertiesNames, renderField} from './helpers';
import FilterGuesser from './FilterGuesser';

const ListGuesserView = ({
  fieldsNames,
  children,
  sortableFieldNames,
  ...props
}) => (
  <List {...props}>
    <Datagrid>
      {fieldsNames.map(fieldName =>
        renderField(children, fieldName, props.resource, {
          ...props,
          key: props,
        }),
      )}
      {props.hasShow && <ShowButton />}
      {props.hasEdit && <EditButton />}
    </Datagrid>
  </List>
);

ListGuesserView.propTypes = {
  children: PropTypes.object,
  fieldsNames: PropTypes.array.isRequired,
  sortableFieldNames: PropTypes.array.isRequired,
};

class ListGuesserController extends Component {
  state = {
    sortableFieldNames: [],
  };

  componentDidMount() {
    const {resourceSchema} = this.props;

    resourceSchema.getParameters().then(parameters => {
      const sortableFieldNames = parameters
        .map(parameter => parameter.variable)
        .filter(parameter => parameter.substr(0, 6) === 'order[')
        .map(parameter => parameter.substr(6, parameter.length - 7));
      this.setState({
        sortableFieldNames: sortableFieldNames,
      });
    });
  }

  render() {
    return <ListGuesserView {...this.props} {...this.state} />;
  }
}

ListGuesserController.propTypes = {
  resourceSchema: PropTypes.object.isRequired,
};

const ListGuesser = props => (
  <Query type="INTROSPECT">
    {({data, loading, error}) => {
      if (loading) {
        return <Loading />;
      }

      if (error) {
        console.error(error);
        return <div>Error while reading the API schema</div>;
      }

      const {
        resource: resourceName,
        fields: allowedFieldNames,
        children,
      } = props;

      const resource = data.resources.find(({name}) => resourceName === name);

      if (!resource || !resource.readableFields) {
        console.error(
          `Resource ${resourceName} not present inside api description`,
        );
        return `<div>Resource ${resourceName} not present inside api description</div>`;
      }

      const fieldsNames = getResourcePropertiesNames(
        resource,
        'readable',
        allowedFieldNames,
        children,
      );

      return (
        <ListGuesserController
          {...props}
          fieldsNames={fieldsNames}
          resourceSchema={resource}
          filters={<FilterGuesser {...props} />}
        />
      );
    }}
  </Query>
);

export default ListGuesser;

ListGuesser.propTypes = {
  children: PropTypes.object,
  resource: PropTypes.string.isRequired,
  fields: PropTypes.array,
};

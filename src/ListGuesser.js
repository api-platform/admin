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
import {getOrderParametersFromResourceSchema} from './docsUtils';

const getFields = (
  {fields},
  allowedFieldNames = fields.map(defaultField => defaultField.name),
) => fields.filter(({name}) => allowedFieldNames.includes(name));

class ResourcesList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      orderParameters: this.props.resourceSchema
        ? getOrderParametersFromResourceSchema(this.props.resourceSchema)
        : [],
    };
  }

  componentDidMount() {
    if (!this.state.orderParameters.length) {
      this.props.resourceSchema.getParameters().then(parameters => {
        this.setState({
          orderParameters: getOrderParametersFromResourceSchema({
            ...this.props.resourceSchema,
            parameters,
          }),
        });
      });
    }
  }

  render() {
    const {
      resourceSchema: resource,
      fields: allowedFieldNames,
      ...props
    } = this.props;

    const children = Children.toArray(props.children);

    const fields = getFields(resource, allowedFieldNames).filter(
      existsAsChild(children),
    );

    return (
      <List {...props}>
        <Datagrid>
          {children}
          {fields.map(field => (
            <FieldGuesser
              key={field.name}
              source={field.name}
              sortable={this.state.orderParameters.includes(field.name)}
            />
          ))}
          {props.hasShow && <ShowButton />}
          {props.hasEdit && <EditButton />}
        </Datagrid>
      </List>
    );
  }
}

const ListGuesser = props => {
  const {resource: resourceName} = props;

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

        const resourceSchema = getResource(api.resources, resourceName);

        if (!resourceSchema || !resourceSchema.fields) {
          console.error(
            `Resource ${resourceName} not present inside api description`,
          );
          return (
            <div>
              Resource ${resourceName} not present inside api description
            </div>
          );
        }

        return <ResourcesList resourceSchema={resourceSchema} {...props} />;
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

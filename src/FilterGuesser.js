import React from 'react';
import {Filter, Loading, Query} from 'react-admin';
import {getResource} from './docsUtils';
import InputGuesser from './InputGuesser';

const getFiltersParametersFromResourceSchema = resourceSchema => {
  const authorizedFields = resourceSchema.fields.map(field => field.name);
  return resourceSchema.parameters
    .map(filter => ({
      name: filter.variable,
      isRequired: filter.required,
    }))
    .filter(filter => !filter.name.includes('order['))
    .filter(filter => authorizedFields.includes(filter.name));
};

class Filters extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      filtersParameters: this.props.resourceSchema
        ? getFiltersParametersFromResourceSchema(this.props.resourceSchema)
        : [],
    };
  }

  componentDidMount() {
    if (!this.state.filtersParameters.length) {
      this.props.resourceSchema.getParameters().then(parameters => {
        this.setState({
          filtersParameters: getFiltersParametersFromResourceSchema({
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
      hasEdit,
      hasShow,
      ...props
    } = this.props;

    if (!this.state.filtersParameters.length) {
      return null;
    }

    return (
      <Filter {...props}>
        {this.state.filtersParameters.map(filter => (
          <InputGuesser
            key={filter.name}
            source={filter.name}
            alwaysOn={filter.isRequired}
          />
        ))}
      </Filter>
    );
  }
}

const FilterGuesser = props => {
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

        return <Filters resourceSchema={resourceSchema} {...props} />;
      }}
    </Query>
  );
};

export default FilterGuesser;

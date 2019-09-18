import React from 'react';
import {Filter} from 'react-admin';
import InputGuesser from './InputGuesser';
import WithReactAdminQuery from './withReactAdminQuery';
import {getFiltersParametersFromResourceSchema} from './docsUtils';

class FilterGuesserComponent extends React.Component {
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
    if (!this.state.filtersParameters.length) {
      return null;
    }

    const {resourceSchema, fields, hasShow, hasEdit, ...props} = this.props;
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

const FilterGuesser = props => (
  <WithReactAdminQuery component={FilterGuesserComponent} {...props} />
);

export default FilterGuesser;

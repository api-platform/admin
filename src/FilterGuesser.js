import React from 'react';
import {Filter} from 'react-admin';
import InputGuesser from './InputGuesser';
import IntrospectQuery from './IntrospectQuery';
import {getFiltersParametersFromResourceSchema} from './docsUtils';

export class FilterGuesserComponent extends React.Component {
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
  <IntrospectQuery component={FilterGuesserComponent} {...props} />
);

export default FilterGuesser;

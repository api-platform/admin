import React from 'react';
import PropTypes from 'prop-types';
import {Filter, Loading, Query} from 'react-admin';

import InputGuesser from './InputGuesser';

const FilterGuesserView = ({filters, ...props}) => (
  <Filter {...props}>
    {filters.map(filter => (
      <InputGuesser key={filter.variable} source={filter.variable} />
    ))}
  </Filter>
);

FilterGuesserView.propTypes = {
  filters: PropTypes.array.isRequired,
};

class FilterGuesserController extends React.Component {
  state = {
    filters: [],
  };

  componentDidMount() {
    const {resourceSchema} = this.props;

    resourceSchema.getParameters().then(parameters => {
      const filters = parameters.filter(
        parameter => parameter.variable.substr(0, 6) !== 'order[',
      );
      this.setState({
        filters: filters,
      });
    });
  }

  render() {
    return <FilterGuesserView {...this.props} {...this.state} />;
  }
}

FilterGuesserController.propTypes = {
  resourceSchema: PropTypes.object.isRequired,
};

const FilterGuesser = props => (
  <Query type="INTROSPECT">
    {({data, loading, error}) => {
      if (loading) {
        return <Loading />;
      }

      if (error) {
        console.error(error);
        return <div>Error while reading the API schema</div>;
      }

      const {resource: resourceName} = props;

      const resource = data.resources.find(({name}) => resourceName === name);

      if (!resource) {
        console.error(
          `Resource ${resourceName} not present inside api description`,
        );
        return `<div>Resource ${resourceName} not present inside api description</div>`;
      }

      return <FilterGuesserController {...props} resourceSchema={resource} />;
    }}
  </Query>
);

export default FilterGuesser;

FilterGuesser.propTypes = {
  resource: PropTypes.string.isRequired,
};

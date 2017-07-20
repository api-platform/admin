import apiDocumentationParser from 'api-doc-parser/lib/hydra/parseHydraDocumentation';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import AdminBuilder from '../AdminBuilder';
import restClient from './hydraClient';

class HydraAdmin extends Component {
  static defaultProps = {
    apiDocumentationParser,
    restClient,
  };

  static propTypes = {
    apiDocumentationParser: PropTypes.func,
    entrypoint: PropTypes.string.isRequired,
    restClient: PropTypes.func,
  };

  state = {
    api: null,
  };

  componentDidMount() {
    this.props
      .apiDocumentationParser(this.props.entrypoint)
      .then(api => this.setState({api}));
  }

  render() {
    if (null === this.state.api) {
      return <span>Loading...</span>;
    }

    return (
      <AdminBuilder
        {...this.props}
        api={this.state.api}
        restClient={this.props.restClient(this.state.api)}
      />
    );
  }
}

export default HydraAdmin;

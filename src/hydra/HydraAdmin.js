import apiDocumentationParser from 'api-doc-parser/lib/hydra/parseHydraDocumentation';
import PropTypes from 'prop-types';
import React, {Component} from 'react';
import AdminBuilder from '../AdminBuilder';
import restClient from './hydraClient';

class HydraAdmin extends Component {
  static defaultProps = {
    apiDocumentationParser,
    customRoutes: [],
    error: 'Unable to retrieve API documentation.',
    loading: 'Loading...',
    restClient,
  };

  static propTypes = {
    apiDocumentationParser: PropTypes.func,
    customRoutes: PropTypes.array,
    entrypoint: PropTypes.string.isRequired,
    error: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
    loading: PropTypes.oneOfType([PropTypes.func, PropTypes.string]),
    restClient: PropTypes.func,
  };

  state = {
    api: null,
    customRoutes: [],
    hasError: false,
    loaded: false,
  };

  componentDidMount() {
    this.props
      .apiDocumentationParser(this.props.entrypoint)
      .then(
        ({api, customRoutes = []}) => ({
          api,
          customRoutes,
          hasError: false,
          loaded: true,
        }),
        ({api, customRoutes = []}) => ({
          api,
          customRoutes,
          hasError: true,
          loaded: true,
        }),
      )
      .then(this.setState.bind(this));
  }

  render() {
    if (false === this.state.loaded) {
      return 'function' === typeof this.props.loading ? (
        <this.props.loading />
      ) : (
        <span className="loading">{this.props.loading}</span>
      );
    }

    if (true === this.state.hasError) {
      return 'function' === typeof this.props.error ? (
        <this.props.error />
      ) : (
        <span className="error">{this.props.error}</span>
      );
    }

    return (
      <AdminBuilder
        {...this.props}
        api={this.state.api}
        customRoutes={this.props.customRoutes.concat(this.state.customRoutes)}
        restClient={this.props.restClient(this.state.api)}
      />
    );
  }
}

export default HydraAdmin;

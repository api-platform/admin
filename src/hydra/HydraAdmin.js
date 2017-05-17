import React, {Component} from 'react';
import PropTypes from 'prop-types';
import parseHydraDocumentation from 'api-doc-parser/lib/hydra/parseHydraDocumentation';
import AdminBuilder from '../AdminBuilder';
import hydraClient from './hydraClient';

export default class HydraAdmin extends Component {
  static propTypes = {
    entrypoint: PropTypes.string.isRequired
  };
  state = {api: null};

  componentDidMount() {
    parseHydraDocumentation(this.props.entrypoint).then(api => this.setState({api: api}));
  }

  render() {
    if (null === this.state.api) {
      return <span>Loading...</span>;
    }

    return <AdminBuilder api={this.state.api} restClient={hydraClient(this.props.entrypoint)}/>;
  }
}

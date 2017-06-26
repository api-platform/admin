import React, {Component} from 'react';
import PropTypes from 'prop-types';
import parseHydraDocumentation from 'api-doc-parser/lib/hydra/parseHydraDocumentation';
import AdminBuilder from '../AdminBuilder';
import hydraClient from './hydraClient';

export default class extends Component {
  static propTypes = {
    entrypoint: PropTypes.string
  };
  state = {api: null};

  componentDidMount() {
    parseHydraDocumentation(this.props.entrypoint).then(api => this.setState({api: api}));
  }

  render() {
    if (null === this.state.api) return <span>Loading...</span>;

    let props = {...this.props};
    if (!props.api) props.api = this.state.api;
    if (!props.restClient) props.restClient = hydraClient(this.props.entrypoint);

    return <AdminBuilder {...props}/>;
  }
}

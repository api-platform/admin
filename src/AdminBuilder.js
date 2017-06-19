import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Admin, Resource, Delete} from 'admin-on-rest';
import Api from 'api-doc-parser/lib/Api';
import List from './List';
import Show from './Show';
import Create from './Create';
import Edit from './Edit';

export default class AdminBuilder extends Component {
  static propTypes = {
    api: PropTypes.instanceOf(Api).isRequired,
    restClient: PropTypes.func.isRequired,
  };

  render() {
    return <Admin title={this.props.api.title} restClient={this.props.restClient}>
        {this.props.api.resources.map(resource =>
          <Resource
            options={{api: this.props.api, resource}}
            key={resource.name}
            name={resource.name}
            list={List}
            show={Show}
            create={Create}
            edit={Edit}
            remove={Delete}
          />
        )}
      </Admin>;
  }
}

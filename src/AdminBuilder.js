import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {Admin, Resource, Delete} from 'admin-on-rest';
import Api from 'api-doc-parser/lib/Api';
import List from './List';
import Show from './Show';
import Create from './Create';
import Edit from './Edit';

export default class extends Component {
  static propTypes = {
    api: PropTypes.instanceOf(Api).isRequired,
    restClient: PropTypes.func.isRequired,
  };

  render() {
    let props = {...this.props};
    if (!props.title) props.title = this.props.api.title;

    return (
      <Admin {...props}>
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
            {...resource.props}
          />,
        )}
      </Admin>
    );
  }
}

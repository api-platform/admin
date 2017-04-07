import React, {Component} from 'react';
import {Admin, Resource} from 'admin-on-rest';
import {Delete} from 'admin-on-rest/lib/mui';
import Api from 'api-doc-parser/lib/Api';
import List from './List';
import Show from './Show';
import Create from './Create';
import Edit from './Edit';

export default class AdminBuilder extends Component {
  static propTypes = {
    api: React.PropTypes.instanceOf(Api).isRequired,
    ...Admin.propTypes,
  };

  render() {
    const { api , ...props } = this.props;

    return <Admin title={api.title} {...props}>
      {api.resources.map(resource =>
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

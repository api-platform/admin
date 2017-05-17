import React, {Component} from 'react';
import {Show as BaseShow, SimpleShowLayout, TextField} from 'admin-on-rest/lib/mui';
import Resource from 'api-doc-parser/lib/Resource';
import fieldFactory from './fieldFactory';

export default class Show extends Component {
  static propTypes = {
    options: React.PropTypes.shape({
      inputFactory: React.PropTypes.func,
      resource: React.PropTypes.instanceOf(Resource),
    }),
    ...BaseShow.propTypes,
  };

  render() {
    const factory = this.props.options.fieldFactory ? this.props.options.fieldFactory : fieldFactory;

    return <BaseShow {...this.props}>
      <SimpleShowLayout>
        <TextField source="id"/>
        {this.props.options.resource.readableFields.map(field => factory(field, this.props.options.resource, 'show', this.props.options.api))}
      </SimpleShowLayout>
    </BaseShow>
  }
}

import React, {Component} from 'react';
import {Edit as BaseEdit, SimpleForm, DisabledInput} from 'admin-on-rest/lib/mui';
import Resource from 'api-doc-parser/lib/Resource';
import inputFactory from './inputFactory';

export default class Edit extends Component {
  static propTypes = {
    options: React.PropTypes.shape({
      inputFactory: React.PropTypes.func,
      resource: React.PropTypes.instanceOf(Resource),
    }),
    ...BaseEdit.propTypes,
  };

  render() {
    const factory = this.props.options.inputFactory ? this.props.options.inputFactory : inputFactory;

    return <BaseEdit {...this.props}>
      <SimpleForm>
      <DisabledInput source="id"/>
        {this.props.options.resource.readableFields.map(field => factory(field, this.props.options.resource, 'edit', this.props.options.api))}
      </SimpleForm>
    </BaseEdit>
  }
}

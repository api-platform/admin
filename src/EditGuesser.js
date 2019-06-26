import React, {Component} from 'react';
import inflection from 'inflection';
import {withStyles} from '@material-ui/core/styles';
import {EditController} from 'ra-core';
import {SimpleForm} from 'ra-ui-materialui';
import {Query, EditView} from 'react-admin';
import inputFactory from './inputFactory';

export class EditViewGuesser extends Component {
  state = {
    inferredChild: null,
  };
  componentDidUpdate() {
    const {api, record, resource} = this.props;
    if (record && !this.state.inferredElements) {
      const resourceSchema = api.resources.find(r => r.name === resource);

      if (
        !resourceSchema ||
        !resourceSchema.fields ||
        !resourceSchema.fields.length
      ) {
        throw new Error('Resource not present inside api description');
      }

      const inferredElements = resourceSchema.fields.map(field =>
        inputFactory(field, {resource}),
      );

      this.setState({inferredElements});
    }
  }

  render() {
    return (
      <EditView {...this.props}>
        <SimpleForm>{this.state.inferredElements}</SimpleForm>
      </EditView>
    );
  }
}

EditViewGuesser.propTypes = EditView.propTypes;

const EditGuesser = props => (
  <Query type="INTROSPECT" resource={props.ressource}>
    {({data, loading, error}) => {
      if (loading) {
        return <div>LOADING</div>;
      }

      if (error) {
        console.error(error);

        return <div>ERROR</div>;
      }

      return (
        <EditController {...props}>
          {controllerProps => (
            <EditViewGuesser api={data} {...controllerProps} />
          )}
        </EditController>
      );
    }}
  </Query>
);

export default EditGuesser;

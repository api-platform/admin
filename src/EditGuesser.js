import React, {Component} from 'react';
import {EditController} from 'ra-core';
import {SimpleForm} from 'ra-ui-materialui';
import {Query, EditView} from 'react-admin';
import InputGuesser from './InputGuesser';

const existsAsChild = children => {
  const childrenNames =
    React.Children.map(children, ({props: {source}}) => source) || [];

  return ({name}) => !childrenNames.includes(name);
};

export class EditViewGuesser extends Component {
  state = {
    fields: [],
  };
  componentDidUpdate() {
    const {api, resource, children} = this.props;
    if (!this.state.fields || !this.state.fields.length) {
      const resourceSchema = api.resources.find(r => r.name === resource);
      if (
        !resourceSchema ||
        !resourceSchema.fields ||
        !resourceSchema.fields.length
      ) {
        throw new Error('Resource not present inside api description');
      }

      const fields = resourceSchema.fields.filter(existsAsChild(children));

      this.setState({fields});
    }
  }

  render() {
    const {children} = this.props;
    return (
      <EditView {...this.props}>
        <SimpleForm>
          {children}
          {this.state.fields.map(field => (
            <InputGuesser key={field.name} source={field.name} />
          ))}
        </SimpleForm>
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

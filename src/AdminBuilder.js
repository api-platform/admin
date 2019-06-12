import React, { Component } from 'react';
import {Admin, Resource, Loading, TranslationProvider, withDataProvider, ListGuesser, EditGuesser} from 'react-admin';
import {createMuiTheme} from '@material-ui/core/styles';

const theme = createMuiTheme({
  palette: {
    primary: {
      main: '#38a9b4',
      contrastText: '#fff',
    },
    secondary: {
      main: '#288690',
    },
  },
});

class AdminBuilder extends Component {
  state = { api: null };

  componentDidMount() {
    this.props.dataProvider("INTROSPECT").then(({ data }) => {
      this.setState({ api: data });
    });
  }

  render() {
    // FIXME: dump Admin Resource code to console
    const { dataProvider, apiDataProvider, ...rest } = this.props;
    return this.state.api ? (
      <Admin dataProvider={this.props.apiDataProvider} theme={theme} {...rest}>
        {this.state.api.resources.map(resource => (
          <Resource
            name={resource.name}
            key={resource.name}
            list={ListGuesser}
            edit={EditGuesser}
          />
        ))}
      </Admin>
    ) : (
      <TranslationProvider>
        <Loading />
      </TranslationProvider>
    );
  }
}

export default withDataProvider(AdminBuilder);

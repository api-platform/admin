import React from 'react';
import PropTypes from 'prop-types';
import {Provider} from 'react-redux';
import {createHashHistory} from 'history';
import withContext from 'recompose/withContext';
import {createAdminStore} from 'react-admin';

import dataProviderFactory from './dataProvider';
import AdminGuesser from '../AdminGuesser';

const history = createHashHistory();

const HydraAdmin = ({
  entrypoint,
  dataProvider = dataProviderFactory(entrypoint),
  i18nProvider,
  authProvider,
  customReducers,
  customSagas,
  locale,
  ...rest
}) => (
  <Provider
    store={createAdminStore({
      authProvider,
      dataProvider,
      i18nProvider,
      history,
      customReducers,
      customSagas,
      locale,
    })}>
    <AdminGuesser
      dataProvider={dataProvider}
      authProvider={authProvider}
      history={history}
      i18nProvider={i18nProvider}
      customReducers={customReducers}
      customSagas={customSagas}
      locale={locale}
      {...rest}
    />
  </Provider>
);
export default withContext(
  {
    authProvider: PropTypes.func,
  },
  props => ({authProvider: props.authProvider}),
)(HydraAdmin);

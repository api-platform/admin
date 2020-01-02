import React from 'react';
import {AdminContext} from 'react-admin';
import {createHashHistory} from 'history';

import dataProviderFactory from './dataProvider';
import AdminGuesser from '../AdminGuesser';

const HydraAdmin = ({
  entrypoint,
  dataProvider = dataProviderFactory(entrypoint),
  authProvider,
  i18nProvider,
  history = createHashHistory(),
  customReducers,
  customSagas,
  initialState,
  ...rest
}) => (
  <AdminContext
    authProvider={authProvider}
    dataProvider={dataProvider}
    i18nProvider={i18nProvider}
    history={history}
    customReducers={customReducers}
    customSagas={customSagas}
    initialState={initialState}>
    <AdminGuesser {...rest} />
  </AdminContext>
);

export default HydraAdmin;

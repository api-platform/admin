import React from "react";
import PropTypes from "prop-types";
import { Provider } from "react-redux";
import { createHashHistory } from "history";
import withContext from "recompose/withContext";
import { createAdminStore } from "react-admin";

import dataProviderFactory from "./hydraClient";
import AdminBuilder from "../AdminBuilder";

const history = createHashHistory();

const HydraAdmin = ({
  entrypoint,
  hydraClient,
  dataProvider = dataProviderFactory(entrypoint, hydraClient),
  i18nProvider,
  authProvider,
  ...rest
}) => (
  <Provider
    store={createAdminStore({
      authProvider,
      dataProvider,
      i18nProvider,
      history
    })}
  >
    <AdminBuilder
      dataProvider={dataProvider}
      authProvider={authProvider}
      history={history}
      i18nProvider={i18nProvider}
      {...rest}
    />
  </Provider>
);
export default withContext(
  {
    authProvider: PropTypes.func
  },
  props => ({ authProvider: props.authProvider })
)(HydraAdmin);

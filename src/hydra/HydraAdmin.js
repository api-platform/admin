import { ConnectedRouter } from 'connected-react-router';
import { createAdminStore } from 'react-admin';
import { createHashHistory } from 'history';
import PropTypes from 'prop-types';
import React, { useEffect, useState } from "react";
import { AdminContext, CoreAdminUI, Loading, TranslationProvider} from 'react-admin';
import { Provider } from 'react-redux';
import { withContext } from 'recompose';
import dataProviderFactory from './dataProvider';
import ResourceGuesser from "../ResourceGuesser";

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
}) => {
  const [fetching, setFetching] = useState(false);
  const [resources, setResources] = useState(null);

  useEffect(() => {
    const doFetch = async () => {
      setFetching(true);
      const result = await dataProvider('INTROSPECT');
      setFetching(false);
      setResources(result.data.resources);
    };

    doFetch();
  }, []);

  if (fetching) {
    return (
      <TranslationProvider>
        <Loading />
      </TranslationProvider>
    );
  }

  if (!resources || !resources.length) {
    return null;
  }

  return (
    <Provider store={createAdminStore({
      authProvider,
      dataProvider,
      i18nProvider,
      history,
      customReducers,
      customSagas,
      locale,
    })}>
      <AdminContext
        dataProvider={dataProvider}
        authProvider={authProvider}
        history={history}
        i18nProvider={i18nProvider}
        customReducers={customReducers}
        customSagas={customSagas}
        locale={locale}
        {...rest}
      >
       <CoreAdminUI>
         {resources.map(({name}) => (
           <ResourceGuesser key={name} name={name} />
         ))}
       </CoreAdminUI>
      </AdminContext>
    </Provider>
  );
};

export default withContext(
  {
    authProvider: PropTypes.func,
  },
  props => ({authProvider: props.authProvider}),
)(HydraAdmin);

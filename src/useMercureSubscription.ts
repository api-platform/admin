import { useEffect, useRef } from 'react';
import {
  CRUD_GET_ONE_SUCCESS,
  FETCH_END,
  GET_ONE,
  Identifier,
  useDataProvider,
} from 'react-admin';
import { useDispatch } from 'react-redux';
import { ApiPlatformAdminDataProvider } from './types';

export default function useMercureSubscription(
  resource: string | undefined,
  idOrIds: Identifier | Identifier[] | undefined,
) {
  const dataProvider: ApiPlatformAdminDataProvider = useDataProvider();
  const dispatch = useDispatch();

  const hasShownNoSubscribeWarning = useRef(false);

  useEffect(() => {
    if (!idOrIds || !resource) {
      return;
    }
    const ids = Array.isArray(idOrIds)
      ? idOrIds.map((id) => id.toString())
      : [idOrIds.toString()];

    if (
      !hasShownNoSubscribeWarning.current &&
      (dataProvider.subscribe === undefined ||
        dataProvider.unsubscribe === undefined)
    ) {
      console.warn(
        'subscribe and/or unsubscribe methods were not set in the data provider, Mercure realtime update functionalities will not work. Please use a compatible data provider.',
      );
      hasShownNoSubscribeWarning.current = true;
      return;
    }

    dataProvider.subscribe(ids, (document) => {
      dispatch({
        type: CRUD_GET_ONE_SUCCESS,
        payload: {
          data: document,
        },
        meta: {
          resource,
          fetchResponse: GET_ONE,
          fetchStatus: FETCH_END,
        },
      });
    });

    return () => {
      if (resource) {
        dataProvider.unsubscribe(resource, ids);
      }
    };
  }, [idOrIds, resource, dataProvider, dispatch]);
}

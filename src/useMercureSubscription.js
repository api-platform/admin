import {
  CRUD_GET_ONE_SUCCESS,
  FETCH_END,
  GET_ONE,
  useDataProvider,
} from 'ra-core';
import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';

export default function useMercureSubscription(resource, idOrIds) {
  const dataProvider = useDataProvider();
  const dispatch = useDispatch();

  const hasShownNoSubscribeWarning = useRef(false);

  useEffect(() => {
    const ids = Array.isArray(idOrIds) ? idOrIds : [idOrIds];

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
      dataProvider.unsubscribe(resource, ids);
    };
  }, [idOrIds, resource, dataProvider, dispatch]);
}

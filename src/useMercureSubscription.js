import {
  CRUD_GET_ONE_SUCCESS,
  FETCH_END,
  GET_ONE,
  useDataProvider,
} from 'ra-core';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

export default function useMercureSubscription(resource, idOrIds) {
  const dataProvider = useDataProvider();
  const dispatch = useDispatch();

  useEffect(() => {
    const ids = Array.isArray(idOrIds) ? idOrIds : [idOrIds];

    if (
      dataProvider.subscribe === undefined ||
      dataProvider.unsubscribe === undefined
    ) {
      console.warn(
        '`subscribe` and/or `unsubcribe` methods were not set in the `dataProvider`, mercure realtime update functionnalities will not work',
      );
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

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

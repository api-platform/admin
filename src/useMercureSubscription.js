import {
  CRUD_GET_ONE_SUCCESS,
  FETCH_END,
  GET_ONE,
  useDataProvider,
} from 'ra-core';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';

export default function useMercureSubscription(resource, id) {
  const dataProvider = useDataProvider();
  const dispatch = useDispatch();

  useEffect(() => {
    dataProvider.subscribe(id, (document) => {
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
      dataProvider.unsubscribe(resource, id);
    };
  }, [id, resource, dataProvider, dispatch]);
}

import { useEffect, useRef } from 'react';
import { useDataProvider } from 'react-admin';
import type { Identifier } from 'react-admin';
import { useUpdateCache } from '../dataProvider/index.js';
import type { ApiPlatformAdminDataProvider } from '../types.js';

export default function useMercureSubscription(
  resource: string | undefined,
  idOrIds: Identifier | Identifier[] | undefined,
) {
  const dataProvider: ApiPlatformAdminDataProvider = useDataProvider();
  const updateCache = useUpdateCache();

  const hasShownNoSubscribeWarning = useRef(false);

  useEffect(() => {
    if (!idOrIds || !resource) {
      return undefined;
    }
    const ids = Array.isArray(idOrIds)
      ? idOrIds.map((id) => id.toString())
      : [idOrIds.toString()];

    if (
      !hasShownNoSubscribeWarning.current &&
      (dataProvider.subscribe === undefined ||
        dataProvider.unsubscribe === undefined)
    ) {
      // eslint-disable-next-line no-console
      console.warn(
        'subscribe and/or unsubscribe methods were not set in the data provider, Mercure realtime update functionalities will not work. Please use a compatible data provider.',
      );
      hasShownNoSubscribeWarning.current = true;
      return undefined;
    }

    dataProvider.subscribe(ids, (document) => {
      updateCache({ resource, id: document.id, data: document });
    });

    return () => {
      if (resource) {
        dataProvider.unsubscribe(resource, ids);
      }
    };
  }, [idOrIds, resource, dataProvider, updateCache]);
}

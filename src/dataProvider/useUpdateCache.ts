import { useCallback } from 'react';
import type { GetListResult, Identifier } from 'react-admin';
import { useQueryClient } from '@tanstack/react-query';
import type { ApiPlatformAdminRecord } from '../types.js';

const useUpdateCache = () => {
  const queryClient = useQueryClient();

  // From https://github.com/marmelab/react-admin/blob/next/packages/ra-core/src/dataProvider/useUpdate.ts
  return useCallback(
    ({
      resource,
      id,
      data,
    }: {
      resource: string;
      id: Identifier;
      data: ApiPlatformAdminRecord;
    }) => {
      const updateColl = (old: ApiPlatformAdminRecord[]) => {
        const index = old.findIndex(
          // eslint-disable-next-line eqeqeq
          (record) => record.id == id,
        );
        if (index === -1) {
          return old;
        }
        return [
          ...old.slice(0, index),
          { ...old[index], ...data },
          ...old.slice(index + 1),
        ];
      };

      queryClient.setQueryData(
        [resource, 'getOne', { id: String(id) }],
        (record: ApiPlatformAdminRecord | undefined) => ({
          ...record,
          ...data,
        }),
      );
      queryClient.setQueriesData(
        { queryKey: [resource, 'getList'] },
        (res: GetListResult<ApiPlatformAdminRecord> | undefined) =>
          res?.data
            ? { data: updateColl(res.data), total: res.total }
            : { data: [data] },
      );
      queryClient.setQueriesData(
        { queryKey: [resource, 'getMany'] },
        (coll: ApiPlatformAdminRecord[] | undefined) =>
          coll && coll.length > 0 ? updateColl(coll) : [data],
      );
      queryClient.setQueriesData(
        { queryKey: [resource, 'getManyReference'] },
        (res: GetListResult<ApiPlatformAdminRecord> | undefined) =>
          res?.data
            ? { data: updateColl(res.data), total: res.total }
            : { data: [data] },
      );
    },
    [queryClient],
  );
};

export default useUpdateCache;

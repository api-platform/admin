import { useQuery } from 'react-query';
import { useDataProvider } from 'react-admin';
import type { UseQueryOptions } from 'react-query';
import type { ApiPlatformAdminDataProvider, IntrospectPayload } from './types';

const useIntrospect = (options?: UseQueryOptions<IntrospectPayload, Error>) => {
  const dataProvider = useDataProvider<ApiPlatformAdminDataProvider>();

  return useQuery<IntrospectPayload, Error>(
    'introspect',
    () => dataProvider.introspect(),
    {
      enabled: false,
      ...options,
    },
  );
};

export default useIntrospect;

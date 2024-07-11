import { useQuery } from '@tanstack/react-query';
import { useDataProvider } from 'react-admin';
import type { UseQueryOptions } from '@tanstack/react-query';
import type {
  ApiPlatformAdminDataProvider,
  IntrospectPayload,
} from '../types.js';

const useIntrospect = (options?: UseQueryOptions<IntrospectPayload, Error>) => {
  const dataProvider = useDataProvider<ApiPlatformAdminDataProvider>();

  return useQuery<IntrospectPayload, Error>({
    queryKey: ['introspect'],
    queryFn: () => dataProvider.introspect(),
    enabled: false,
    ...options,
  });
};

export default useIntrospect;

import React from 'react';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useQueryClient } from '@tanstack/react-query';
import { Layout, type LayoutProps } from 'react-admin';

const DevtoolsLayout = ({ children, ...props }: LayoutProps) => {
  const client = useQueryClient();
  return (
    <Layout {...props}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} client={client} />
    </Layout>
  );
};

export default DevtoolsLayout;

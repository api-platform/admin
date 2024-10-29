import * as React from 'react';
import { jest } from '@jest/globals';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, waitFor } from '@testing-library/react';
import type { CreateResult, RaRecord, UpdateResult } from 'react-admin';
import { DataProviderContext, testDataProvider } from 'react-admin';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

import useOnSubmit from './useOnSubmit.js';
import schemaAnalyzer from './hydra/schemaAnalyzer.js';
import { API_FIELDS_DATA } from './__fixtures__/parsedData.js';

const dataProvider = testDataProvider({
  create: jest.fn(() => Promise.resolve({ data: { id: 1 } } as CreateResult)),
  update: jest.fn(() => Promise.resolve({ data: { id: 1 } } as UpdateResult)),
});

const onSubmitProps = {
  fields: API_FIELDS_DATA,
  resource: 'books',
  schemaAnalyzer: schemaAnalyzer(),
  children: [],
};

jest.mock('./getIdentifierValue.js');

test.each([
  {
    name: 'Book name 1',
    authors: ['Author 1', 'Author 2'],
    cover: { rawFile: new File(['content'], 'cover.png') },
  },
  {
    name: 'Book name 2',
    authors: ['Author 1', 'Author 2'],
    covers: [
      { rawFile: new File(['content1'], 'cover1.png') },
      { rawFile: new File(['content2'], 'cover2.png') },
    ],
  },
])(
  'Call create with file input ($name)',
  async (values: Omit<RaRecord, 'id'>) => {
    let save;
    const Dummy = () => {
      const onSubmit = useOnSubmit(onSubmitProps);
      save = onSubmit;
      return <span />;
    };
    render(
      <DataProviderContext.Provider value={dataProvider}>
        <QueryClientProvider client={new QueryClient()}>
          <MemoryRouter initialEntries={['/books/create']}>
            <Routes>
              <Route path="/books" element={<span />} />
              <Route path="/books/create" element={<Dummy />} />
              <Route path="/books/:id" element={<Dummy />} />
            </Routes>
          </MemoryRouter>
        </QueryClientProvider>
      </DataProviderContext.Provider>,
    );
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    save(values);
    await waitFor(() => {
      expect(dataProvider.create).toHaveBeenCalledWith('books', {
        data: values,
        meta: {
          hasFileField: true,
        },
        previousData: undefined,
      });
    });
  },
);

test.each([
  {
    id: '1',
    name: 'Book name 1',
    authors: ['Author 1', 'Author 2'],
  },
  {
    id: '2',
    name: 'Book name 2',
    authors: ['Author 1', 'Author 2'],
  },
  {
    id: '3',
    name: 'Book name 3',
    authors: ['Author 1', 'Author 2'],
    cover: null,
  },
])('Call update without file inputs ($name)', async (values: RaRecord) => {
  let save;
  const Dummy = () => {
    const onSubmit = useOnSubmit(onSubmitProps);
    save = onSubmit;
    return <span />;
  };
  render(
    <DataProviderContext.Provider value={dataProvider}>
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter initialEntries={[`/books/${values.id}`]}>
          <Routes>
            <Route path="/books" element={<span />} />
            <Route path="/books/:id" element={<Dummy />} />
          </Routes>
        </MemoryRouter>
      </QueryClientProvider>
    </DataProviderContext.Provider>,
  );
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  save(values);
  await waitFor(() => {
    expect(dataProvider.update).toHaveBeenCalledWith('books', {
      id: values.id,
      data: values,
      meta: {
        hasFileField: false,
      },
      previousData: undefined,
    });
  });
});

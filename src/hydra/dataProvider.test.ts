import { jest } from '@jest/globals';
import { Response } from 'node-fetch';
import type { parseHydraDocumentation } from '@api-platform/api-doc-parser';
import dataProviderFactory, {
  transformJsonLdDocumentToReactAdminDocument,
} from './dataProvider.js';
import { API_DATA } from '../__fixtures__/parsedData.js';
import type fetchHydra from './fetchHydra.js';

const EMBEDDED_ITEM = {
  '@id': '/books/2',
  id: 2,
  '@type': 'http://schema.org/Book',
  isbn: '9792828761393',
  name: '000',
  description: 'string',
  author: 'string',
  dateCreated: '2017-04-25T00:00:00+00:00',
};

const EMBEDDED_COMMENT = {
  '@id': '/comments/1',
  '@type': 'http://schema.org/Comment',
  text: 'Lorem ipsum dolor sit amet.',
  dateCreated: '2017-04-26T00:00:00+00:00',
};

const JSON_LD_DOCUMENT = {
  '@id': '/reviews/327',
  id: 327,
  '@type': 'http://schema.org/Review',
  reviewBody:
    'Accusantium quia ipsam omnis praesentium. Neque quidem omnis perspiciatis sed. Officiis quo dolor esse nisi molestias.',
  rating: 3,
  itemReviewed: EMBEDDED_ITEM,
  comment: [
    EMBEDDED_COMMENT,
    {
      '@id': '/comments/2',
      '@type': 'http://schema.org/Comment',
      text: 'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
      dateCreated: '2017-04-27T00:00:00+00:00',
    },
  ],
  aNestedObject: {
    foo: 'bar',
  },
};

describe('Transform a JSON-LD document to a React Admin compatible document', () => {
  const reactAdminDocument = transformJsonLdDocumentToReactAdminDocument(
    JSON_LD_DOCUMENT,
    true,
    true,
    true,
  );

  test('deep clone the original object', () => {
    expect(reactAdminDocument).not.toBe(JSON_LD_DOCUMENT);
    expect(reactAdminDocument.aNestedObject).not.toBe(
      JSON_LD_DOCUMENT.aNestedObject,
    );
  });

  test('add an id property equal to the original @id property', () => {
    expect(reactAdminDocument.id).toBe(JSON_LD_DOCUMENT['@id']);
  });

  test('preserve the previous id property value in a new originId property', () => {
    expect(reactAdminDocument.originId).toBe(JSON_LD_DOCUMENT.id.toString());
  });

  test('an React Admin has a custom toString method', () => {
    expect(reactAdminDocument.toString()).toBe('[object /reviews/327]');
  });

  test('keep embedded documents', () => {
    expect(JSON.stringify(reactAdminDocument.itemReviewed)).toBe(
      JSON.stringify(EMBEDDED_ITEM),
    );
  });

  test('keep arrays of embedded documents', () => {
    expect(JSON.stringify(reactAdminDocument.comment[0])).toBe(
      JSON.stringify(EMBEDDED_COMMENT),
    );
  });
});

describe('Transform a JSON-LD document to a React Admin compatible document (transform embeddeds)', () => {
  const reactAdminDocument =
    transformJsonLdDocumentToReactAdminDocument(JSON_LD_DOCUMENT);

  test('transform embedded documents to their IRIs', () => {
    expect(reactAdminDocument.itemReviewed).toBe('/books/2');
  });

  test('transform arrays of embedded documents to their IRIs', () => {
    expect(reactAdminDocument.comment[0]).toBe('/comments/1');
  });
});

describe('Transform a React Admin request to an Hydra request', () => {
  const mockFetchHydra = jest.fn<typeof fetchHydra>();
  const mockApiDocumentationParser = jest.fn<typeof parseHydraDocumentation>(
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore Incompatibility between node-fetch and TS Response type
    () =>
      Promise.resolve({
        api: API_DATA,
        response: new Response(),
        status: 200,
      }),
  );
  const dataProvider = {
    current: dataProviderFactory({
      entrypoint: 'entrypoint',
      mercure: {
        hub: 'entrypoint',
      },
      httpClient: mockFetchHydra,
      apiDocumentationParser: mockApiDocumentationParser,
    }),
  };

  test('React Admin get list with filter parameters and custom search params', async () => {
    mockFetchHydra.mockClear();
    mockFetchHydra.mockReturnValue(
      Promise.resolve({
        status: 200,
        headers: new Headers(),
        json: { 'hydra:member': [], 'hydra:totalItems': 3 },
      }),
    );
    await dataProvider.current.getList('resource', {
      pagination: {
        page: 1,
        perPage: 30,
      },
      sort: {
        order: 'ASC',
        field: '',
      },
      filter: {
        simple: 'foo',
        nested: { param: 'bar' },
        sub_nested: { sub: { param: true } },
        array: ['/iri/1', '/iri/2'],
        nested_array: { nested: ['/nested_iri/1', '/nested_iri/2'] },
        exists: { foo: true },
        nested_date: { date: { before: '2000' } },
        nested_range: { range: { between: '12.99..15.99' } },
      },
      searchParams: { pagination: 'true' },
    });
    const searchParams = Array.from(
      mockFetchHydra.mock.calls?.[0]?.[0]?.searchParams.entries() ?? [],
    );
    expect(searchParams[0]).toEqual(['pagination', 'true']);
    expect(searchParams[1]).toEqual(['page', '1']);
    expect(searchParams[2]).toEqual(['itemsPerPage', '30']);
    expect(searchParams[3]).toEqual(['simple', 'foo']);
    expect(searchParams[4]).toEqual(['nested.param', 'bar']);
    expect(searchParams[5]).toEqual(['sub_nested.sub.param', 'true']);
    expect(searchParams[6]).toEqual(['array[0]', '/iri/1']);
    expect(searchParams[7]).toEqual(['array[1]', '/iri/2']);
    expect(searchParams[8]).toEqual([
      'nested_array.nested[0]',
      '/nested_iri/1',
    ]);
    expect(searchParams[9]).toEqual([
      'nested_array.nested[1]',
      '/nested_iri/2',
    ]);
    expect(searchParams[10]).toEqual(['exists[foo]', 'true']);
    expect(searchParams[11]).toEqual(['nested_date.date[before]', '2000']);
    expect(searchParams[12]).toEqual([
      'nested_range.range[between]',
      '12.99..15.99',
    ]);
  });

  test('DataProvider can be mutated without losing Schema', async () => {
    mockFetchHydra.mockClear();
    mockFetchHydra.mockReturnValue(
      Promise.resolve({
        status: 200,
        headers: new Headers(),
        json: { '@id': '/foos/76' },
      }),
    );
    await dataProvider.current.introspect();
    dataProvider.current = dataProviderFactory({
      entrypoint: 'entrypoint',
      mercure: {
        hub: 'entrypoint',
      },
      httpClient: mockFetchHydra,
      apiDocumentationParser: mockApiDocumentationParser,
    });
    expect(() =>
      dataProvider.current.create('resource', {
        data: {
          foo: 'foo',
          bar: 'baz',
        },
      }),
    ).not.toThrow(Error);
  });

  test('React Admin create', async () => {
    mockFetchHydra.mockClear();
    mockFetchHydra.mockReturnValue(
      Promise.resolve({
        status: 200,
        headers: new Headers(),
        json: { '@id': '/foos/76' },
      }),
    );
    await dataProvider.current.introspect();
    await dataProvider.current.create('resource', {
      data: {
        foo: 'foo',
        bar: 'baz',
      },
    });
    const url = mockFetchHydra.mock.calls?.[0]?.[0] ?? new URL('https://foo');
    expect(url).toBeInstanceOf(URL);
    expect(url.toString()).toEqual('http://localhost/entrypoint/resource');
    const options = mockFetchHydra.mock.calls?.[0]?.[1] ?? {};
    expect(options).toHaveProperty('method');
    expect(options.method).toEqual('POST');
    expect(options).toHaveProperty('body');
    expect(options.body).toEqual('{"foo":"foo","bar":"baz"}');
  });

  test('React Admin create upload file', async () => {
    mockFetchHydra.mockClear();
    mockFetchHydra.mockReturnValue(
      Promise.resolve({
        status: 200,
        headers: new Headers(),
        json: { '@id': '/foos/43' },
      }),
    );
    await dataProvider.current.introspect();

    const file = new File(['foo'], 'foo.txt');
    const icons = [...Array(3).keys()].map((i) => ({
      rawFile: new File([`icon_${i}`], `icon_${i}.png`),
    }));
    await dataProvider.current.create('resource', {
      data: {
        image: {
          rawFile: file,
        },
        icons,
        bar: 'baz',
        qux: null,
        array: ['foo', 'dummy'],
        object: { foo: 'dummy' },
        date: new Date(Date.UTC(2020, 6, 6, 12)),
      },
    });
    const url = mockFetchHydra.mock.calls?.[0]?.[0] ?? new URL('https://foo');
    expect(url).toBeInstanceOf(URL);
    expect(url.toString()).toEqual('http://localhost/entrypoint/resource');
    const options = mockFetchHydra.mock.calls?.[0]?.[1] ?? {};
    expect(options).toHaveProperty('method');
    expect(options.method).toEqual('POST');
    expect(options).toHaveProperty('body');
    expect(options.body).toBeInstanceOf(FormData);
    expect(Array.from((options.body as FormData).entries())).toEqual([
      ['image', file],
      ...icons.map((icon) => ['icons[]', icon.rawFile]),
      ['bar', 'baz'],
      ['qux', 'null'],
      ['array', '["foo","dummy"]'],
      ['object', '{"foo":"dummy"}'],
      ['date', '2020-07-06T12:00:00.000Z'],
    ]);
  });

  test('React Admin create with file field', async () => {
    mockFetchHydra.mockClear();
    mockFetchHydra.mockReturnValue(
      Promise.resolve({
        status: 200,
        headers: new Headers(),
        json: { '@id': '/foos/23' },
      }),
    );
    await dataProvider.current.introspect();
    await dataProvider.current.create('resource', {
      data: {
        bar: 'baz',
        foo: 'foo',
      },
      meta: {
        hasFileField: true,
      },
    });
    const url = mockFetchHydra.mock.calls?.[0]?.[0] ?? new URL('https://foo');
    expect(url).toBeInstanceOf(URL);
    expect(url.toString()).toEqual('http://localhost/entrypoint/resource');
    const options = mockFetchHydra.mock.calls?.[0]?.[1] ?? {};
    expect(options).toHaveProperty('method');
    expect(options.method).toEqual('POST');
    expect(options).toHaveProperty('body');
    expect(options.body).toBeInstanceOf(FormData);
    expect(Array.from((options.body as FormData).entries())).toEqual([
      ['bar', 'baz'],
      ['foo', 'foo'],
    ]);
  });

  test('React Admin update', async () => {
    mockFetchHydra.mockClear();
    mockFetchHydra.mockReturnValue(
      Promise.resolve({
        status: 200,
        headers: new Headers(),
        json: { '@id': '/entrypoint/resource/1' },
      }),
    );
    await dataProvider.current.introspect();
    await dataProvider.current.update('resource', {
      id: '/entrypoint/resource/1',
      data: {
        foo: 'foo',
        bar: 'baz',
      },
      previousData: {
        id: '/entrypoint/resource/1',
      },
      meta: undefined,
    });
    const url = mockFetchHydra.mock.calls?.[0]?.[0] ?? new URL('https://foo');
    expect(url).toBeInstanceOf(URL);
    expect(url.toString()).toEqual('http://localhost/entrypoint/resource/1');
    const options = mockFetchHydra.mock.calls?.[0]?.[1] ?? {};
    expect(options).toHaveProperty('method');
    expect(options.method).toEqual('PUT');
    expect(options).toHaveProperty('body');
    expect(options.body).toEqual('{"foo":"foo","bar":"baz"}');
  });

  test('React Admin update with file field', async () => {
    mockFetchHydra.mockClear();
    mockFetchHydra.mockReturnValue(
      Promise.resolve({
        status: 200,
        headers: new Headers(),
        json: { '@id': '/entrypoint/resource/1' },
      }),
    );
    await dataProvider.current.introspect();
    await dataProvider.current.update('resource', {
      id: '/entrypoint/resource/1',
      data: {
        foo: 'foo',
        bar: 'baz',
        qux: null,
      },
      meta: {
        hasFileField: true,
      },
      previousData: {
        id: '/entrypoint/resource/1',
      },
    });
    const url = mockFetchHydra.mock.calls?.[0]?.[0] ?? new URL('https://foo');
    expect(url).toBeInstanceOf(URL);
    expect(url.toString()).toEqual('http://localhost/entrypoint/resource/1');
    const options = mockFetchHydra.mock.calls?.[0]?.[1] ?? {};
    expect(options).toHaveProperty('method');
    expect(options.method).toEqual('POST');
    expect(options).toHaveProperty('body');
    expect(options.body).toBeInstanceOf(FormData);
    expect(Array.from((options.body as FormData).entries())).toEqual([
      ['foo', 'foo'],
      ['bar', 'baz'],
      ['qux', 'null'],
    ]);
  });

  test('React Admin get many with id search filter', async () => {
    mockFetchHydra.mockClear();
    mockFetchHydra.mockReturnValueOnce(
      Promise.resolve({
        status: 200,
        headers: new Headers(),
        json: {
          'hydra:member': [
            { '@id': '/resources/76' },
            { '@id': '/resources/87' },
          ],
          'hydra:totalItems': 3,
        },
      }),
    );
    mockFetchHydra.mockReturnValueOnce(
      Promise.resolve({
        status: 200,
        headers: new Headers(),
        json: {
          'hydra:member': [{ '@id': '/resources/99' }],
          'hydra:totalItems': 3,
        },
      }),
    );
    const result = await dataProvider.current.getMany(
      'idSearchFilterResource',
      {
        ids: ['/resources/76', '/resources/87', '/resources/99'],
      },
    );
    expect(result).toEqual({
      data: [
        { '@id': '/resources/76', id: '/resources/76' },
        { '@id': '/resources/87', id: '/resources/87' },
        { '@id': '/resources/99', id: '/resources/99' },
      ],
    });
    const url1 = mockFetchHydra.mock.calls?.[0]?.[0] ?? new URL('https://foo');
    expect(url1).toBeInstanceOf(URL);
    expect(url1.toString()).toEqual(
      'http://localhost/entrypoint/idSearchFilterResource?page=1&itemsPerPage=3&id%5B0%5D=%2Fresources%2F76&id%5B1%5D=%2Fresources%2F87&id%5B2%5D=%2Fresources%2F99',
    );
    const url2 = mockFetchHydra.mock.calls?.[1]?.[0] ?? new URL('https://foo');
    expect(url2).toBeInstanceOf(URL);
    expect(url2.toString()).toEqual(
      'http://localhost/entrypoint/idSearchFilterResource?page=2&itemsPerPage=3&id%5B0%5D=%2Fresources%2F76&id%5B1%5D=%2Fresources%2F87&id%5B2%5D=%2Fresources%2F99',
    );
  });

  test('React Admin get many without id search filter', async () => {
    mockFetchHydra.mockClear();
    mockFetchHydra.mockReturnValueOnce(
      Promise.resolve({
        status: 200,
        headers: new Headers(),
        json: { '@id': '/resources/76' },
      }),
    );
    mockFetchHydra.mockReturnValueOnce(
      Promise.resolve({
        status: 200,
        headers: new Headers(),
        json: { '@id': '/resources/87' },
      }),
    );
    mockFetchHydra.mockReturnValueOnce(
      Promise.resolve({
        status: 200,
        headers: new Headers(),
        json: { '@id': '/resources/99' },
      }),
    );
    const result = await dataProvider.current.getMany('resource', {
      ids: ['/resources/76', '/resources/87', '/resources/99'],
    });
    expect(result).toEqual({
      data: [
        { '@id': '/resources/76', id: '/resources/76' },
        { '@id': '/resources/87', id: '/resources/87' },
        { '@id': '/resources/99', id: '/resources/99' },
      ],
    });
    const url1 = mockFetchHydra.mock.calls?.[0]?.[0] ?? new URL('https://foo');
    expect(url1).toBeInstanceOf(URL);
    expect(url1.toString()).toEqual('http://localhost/resources/76');
    const url2 = mockFetchHydra.mock.calls?.[1]?.[0] ?? new URL('https://foo');
    expect(url2).toBeInstanceOf(URL);
    expect(url2.toString()).toEqual('http://localhost/resources/87');
    const url3 = mockFetchHydra.mock.calls?.[2]?.[0] ?? new URL('https://foo');
    expect(url3).toBeInstanceOf(URL);
    expect(url3.toString()).toEqual('http://localhost/resources/99');
  });

  test('React Admin get many reference', async () => {
    mockFetchHydra.mockClear();
    mockFetchHydra.mockReturnValueOnce(
      Promise.resolve({
        status: 200,
        headers: new Headers(),
        json: {
          'hydra:member': [
            { '@id': '/comments/423' },
            { '@id': '/comments/976' },
          ],
          'hydra:totalItems': 2,
          'hydra:view': {
            '@id': '/comments?page=1',
            '@type': 'hydra:PartialCollectionView',
            'hydra:first': '/comments?page=1',
            'hydra:last': '/comments?page=1',
            'hydra:next': '/comments?page=1',
          },
        },
      }),
    );
    const result = await dataProvider.current.getManyReference('comments', {
      target: 'posts',
      id: '/posts/346',
      pagination: { page: 1, perPage: 30 },
      sort: { field: 'id', order: 'ASC' },
      filter: false,
    });
    expect(result).toEqual({
      data: [
        { '@id': '/comments/423', id: '/comments/423' },
        { '@id': '/comments/976', id: '/comments/976' },
      ],
      total: 2,
    });
    const url = mockFetchHydra.mock.calls?.[0]?.[0] ?? new URL('https://foo');
    expect(url).toBeInstanceOf(URL);
    expect(url.toString()).toEqual(
      'http://localhost/entrypoint/comments?order%5Bid%5D=ASC&page=1&itemsPerPage=30&posts=%2Fposts%2F346',
    );
  });

  test('React Admin get list', async () => {
    mockFetchHydra.mockClear();
    mockFetchHydra.mockReturnValueOnce(
      Promise.resolve({
        status: 200,
        headers: new Headers(),
        json: {
          'hydra:member': [
            { '@id': '/comments/423' },
            { '@id': '/comments/976' },
          ],
          'hydra:totalItems': 2,
          'hydra:view': {
            '@id': '/comments?page=1',
            '@type': 'hydra:PartialCollectionView',
            'hydra:first': '/comments?page=1',
            'hydra:last': '/comments?page=1',
            'hydra:next': '/comments?page=1',
          },
        },
      }),
    );
    const result = await dataProvider.current.getList('comments', {
      pagination: { page: 1, perPage: 30 },
      sort: { field: 'id', order: 'ASC' },
      filter: false,
    });
    expect(result).toEqual({
      data: [
        { '@id': '/comments/423', id: '/comments/423' },
        { '@id': '/comments/976', id: '/comments/976' },
      ],
      total: 2,
    });
    const url = mockFetchHydra.mock.calls?.[0]?.[0] ?? new URL('https://foo');
    expect(url).toBeInstanceOf(URL);
    expect(url.toString()).toEqual(
      'http://localhost/entrypoint/comments?order%5Bid%5D=ASC&page=1&itemsPerPage=30',
    );
  });

  test('React Admin get list with partial pagination', async () => {
    mockFetchHydra.mockClear();
    mockFetchHydra.mockReturnValueOnce(
      Promise.resolve({
        status: 200,
        headers: new Headers(),
        json: {
          'hydra:member': [
            { '@id': '/comments/423' },
            { '@id': '/comments/976' },
          ],
          'hydra:view': {
            '@id': '/comments?page=1',
            '@type': 'hydra:PartialCollectionView',
            'hydra:first': '/comments?page=1',
            'hydra:last': '/comments?page=1',
            'hydra:next': '/comments?page=1',
          },
        },
      }),
    );
    const result = await dataProvider.current.getList('comments', {
      pagination: { page: 1, perPage: 30 },
      sort: { field: 'id', order: 'ASC' },
      filter: false,
    });
    expect(result).toEqual({
      data: [
        { '@id': '/comments/423', id: '/comments/423' },
        { '@id': '/comments/976', id: '/comments/976' },
      ],
      pageInfo: {
        hasNextPage: true,
        hasPreviousPage: false,
      },
    });
    const url = mockFetchHydra.mock.calls?.[0]?.[0] ?? new URL('https://foo');
    expect(url).toBeInstanceOf(URL);
    expect(url.toString()).toEqual(
      'http://localhost/entrypoint/comments?order%5Bid%5D=ASC&page=1&itemsPerPage=30',
    );
  });

  test('React Admin get list with compound order', async () => {
    mockFetchHydra.mockClear();
    mockFetchHydra.mockReturnValueOnce(
      Promise.resolve({
        status: 200,
        headers: new Headers(),
        json: {
          'hydra:member': [
            { '@id': '/comments/423' },
            { '@id': '/comments/976' },
          ],
          'hydra:totalItems': 2,
          'hydra:view': {
            '@id': '/comments?page=1',
            '@type': 'hydra:PartialCollectionView',
            'hydra:first': '/comments?page=1',
            'hydra:last': '/comments?page=1',
            'hydra:next': '/comments?page=1',
          },
        },
      }),
    );
    const result = await dataProvider.current.getList('comments', {
      pagination: { page: 1, perPage: 30 },
      sort: { field: 'text, id', order: 'DESC' },
      filter: false,
    });
    expect(result).toEqual({
      data: [
        { '@id': '/comments/423', id: '/comments/423' },
        { '@id': '/comments/976', id: '/comments/976' },
      ],
      total: 2,
    });
    const url = mockFetchHydra.mock.calls?.[0]?.[0] ?? new URL('https://foo');
    expect(url).toBeInstanceOf(URL);
    expect(url.toString()).toEqual(
      'http://localhost/entrypoint/comments?order%5Btext%5D=DESC&order%5Bid%5D=DESC&page=1&itemsPerPage=30',
    );
  });

  test('React Admin get list without hydra prefix', async () => {
    mockFetchHydra.mockClear();
    mockFetchHydra.mockReturnValue(
      Promise.resolve({
        status: 200,
        headers: new Headers(),
        json: { member: [], totalItems: 3 },
      }),
    );
    await dataProvider.current.getList('resource', {
      pagination: {
        page: 1,
        perPage: 30,
      },
      sort: {
        order: 'ASC',
        field: '',
      },
      filter: {
        simple: 'foo',
        nested: { param: 'bar' },
        sub_nested: { sub: { param: true } },
        array: ['/iri/1', '/iri/2'],
        nested_array: { nested: ['/nested_iri/1', '/nested_iri/2'] },
        exists: { foo: true },
        nested_date: { date: { before: '2000' } },
        nested_range: { range: { between: '12.99..15.99' } },
      },
      searchParams: { pagination: 'true' },
    });
    const searchParams = Array.from(
      mockFetchHydra.mock.calls?.[0]?.[0]?.searchParams.entries() ?? [],
    );
    expect(searchParams[0]).toEqual(['pagination', 'true']);
    expect(searchParams[1]).toEqual(['page', '1']);
    expect(searchParams[2]).toEqual(['itemsPerPage', '30']);
    expect(searchParams[3]).toEqual(['simple', 'foo']);
    expect(searchParams[4]).toEqual(['nested.param', 'bar']);
    expect(searchParams[5]).toEqual(['sub_nested.sub.param', 'true']);
    expect(searchParams[6]).toEqual(['array[0]', '/iri/1']);
    expect(searchParams[7]).toEqual(['array[1]', '/iri/2']);
    expect(searchParams[8]).toEqual([
      'nested_array.nested[0]',
      '/nested_iri/1',
    ]);
    expect(searchParams[9]).toEqual([
      'nested_array.nested[1]',
      '/nested_iri/2',
    ]);
    expect(searchParams[10]).toEqual(['exists[foo]', 'true']);
    expect(searchParams[11]).toEqual(['nested_date.date[before]', '2000']);
    expect(searchParams[12]).toEqual([
      'nested_range.range[between]',
      '12.99..15.99',
    ]);
  });
});

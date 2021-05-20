import { Api, Field, Resource } from '@api-platform/api-doc-parser';
import dataProviderFactory, {
  transformJsonLdDocumentToReactAdminDocument,
} from './dataProvider';

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
    expect(reactAdminDocument.originId).toBe(JSON_LD_DOCUMENT.id);
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
  const mockFetchHydra = jest.fn();
  mockFetchHydra.mockReturnValue({
    json: { 'hydra:member': [], 'hydra:totalItems': 3 },
  });
  const mockApiDocumentationParser = jest.fn(() =>
    Promise.resolve({
      api: new Api('entrypoint', {
        resources: [
          new Resource('resource', '/resources', {
            fields: [new Field('bar')],
          }),
        ],
      }),
    }),
  );
  const dataProvider = dataProviderFactory(
    'entrypoint',
    mockFetchHydra,
    mockApiDocumentationParser,
  );

  test('React Admin get list with filter parameters and custom search params', () => {
    return dataProvider
      .getList('resource', {
        pagination: {},
        sort: {},
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
        searchParams: { pagination: true },
      })
      .then(() => {
        const searchParams = Array.from(
          mockFetchHydra.mock.calls[0][0].searchParams.entries(),
        );
        expect(searchParams[0]).toEqual(['pagination', 'true']);
        expect(searchParams[1]).toEqual(['simple', 'foo']);
        expect(searchParams[2]).toEqual(['nested.param', 'bar']);
        expect(searchParams[3]).toEqual(['sub_nested.sub.param', 'true']);
        expect(searchParams[4]).toEqual(['array[0]', '/iri/1']);
        expect(searchParams[5]).toEqual(['array[1]', '/iri/2']);
        expect(searchParams[6]).toEqual([
          'nested_array.nested[0]',
          '/nested_iri/1',
        ]);
        expect(searchParams[7]).toEqual([
          'nested_array.nested[1]',
          '/nested_iri/2',
        ]);
        expect(searchParams[8]).toEqual(['exists[foo]', 'true']);
        expect(searchParams[9]).toEqual(['nested_date.date[before]', '2000']);
        expect(searchParams[10]).toEqual([
          'nested_range.range[between]',
          '12.99..15.99',
        ]);
      });
  });

  test('React Admin create', async () => {
    await dataProvider.introspect();

    return dataProvider
      .create('resource', {
        data: {
          foo: 'foo',
          bar: 'baz',
        },
      })
      .then(() => {
        const url = mockFetchHydra.mock.calls[1][0];
        expect(url).toBeInstanceOf(URL);
        expect(url.toString()).toEqual('http://localhost/entrypoint/resource');
        const options = mockFetchHydra.mock.calls[1][1];
        expect(options).toHaveProperty('method');
        expect(options.method).toEqual('POST');
        expect(options).toHaveProperty('body');
        expect(options.body).toEqual('{"foo":"foo","bar":"baz"}');
      });
  });

  test('React Admin create upload file', async () => {
    await dataProvider.introspect();

    const file = new File(['foo'], 'foo.txt');
    return dataProvider
      .create('resource', {
        data: {
          image: {
            rawFile: file,
          },
          bar: 'baz',
          array: ['foo', 'dummy'],
          object: { foo: 'dummy' },
        },
      })
      .then(() => {
        const url = mockFetchHydra.mock.calls[2][0];
        expect(url).toBeInstanceOf(URL);
        expect(url.toString()).toEqual('http://localhost/entrypoint/resource');
        const options = mockFetchHydra.mock.calls[2][1];
        expect(options).toHaveProperty('method');
        expect(options.method).toEqual('POST');
        expect(options).toHaveProperty('body');
        expect(options.body).toBeInstanceOf(FormData);
        expect(Array.from(options.body.entries())).toEqual([
          ['image', file],
          ['bar', 'baz'],
          ['array', '["foo","dummy"]'],
          ['object', '{"foo":"dummy"}'],
        ]);
      });
  });
});

import dataProvider, {
  transformJsonLdDocumentToReactAdminDocument,
} from './dataProvider';
import {GET_LIST} from 'react-admin';

describe('Transform a JSON-LD document to a React Admin compatible document', () => {
  const JSON_LD_DOCUMENT = {
    '@id': '/reviews/327',
    id: 327,
    '@type': 'http://schema.org/Review',
    reviewBody:
      'Accusantium quia ipsam omnis praesentium. Neque quidem omnis perspiciatis sed. Officiis quo dolor esse nisi molestias.',
    rating: 3,
    itemReviewed: {
      '@id': '/books/2',
      id: 2,
      '@type': 'http://schema.org/Book',
      isbn: '9792828761393',
      name: '000',
      description: 'string',
      author: 'string',
      dateCreated: '2017-04-25T00:00:00+00:00',
    },
    comment: [
      {
        '@id': '/comments/1',
        '@type': 'http://schema.org/Comment',
        text: 'Lorem ipsum dolor sit amet.',
        dateCreated: '2017-04-26T00:00:00+00:00',
      },
      {
        '@id': '/comments/2',
        '@type': 'http://schema.org/Comment',
        text:
          'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
        dateCreated: '2017-04-27T00:00:00+00:00',
      },
    ],
    aNestedObject: {
      foo: 'bar',
    },
  };

  const reactAdminDocument = transformJsonLdDocumentToReactAdminDocument(
    JSON_LD_DOCUMENT,
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
    json: {'hydra:member': [], 'hydra:totalItems': 3},
  });
  const fetchApi = dataProvider('entrypoint', mockFetchHydra);

  test('React Admin get list with filter parameters', () => {
    return fetchApi(GET_LIST, 'resource', {
      pagination: {},
      sort: {},
      filter: {
        simple: 'foo',
        nested: {param: 'bar'},
        sub_nested: {sub: {param: true}},
        array: ['/iri/1', '/iri/2'],
        nested_array: {nested: ['/nested_iri/1', '/nested_iri/2']},
      },
    }).then(() => {
      const searchParams = Array.from(
        mockFetchHydra.mock.calls[0][0].searchParams.entries(),
      );
      expect(searchParams[0]).toEqual(['simple', 'foo']);
      expect(searchParams[1]).toEqual(['nested.param', 'bar']);
      expect(searchParams[2]).toEqual(['sub_nested.sub.param', 'true']);
      expect(searchParams[3]).toEqual(['array[0]', '/iri/1']);
      expect(searchParams[4]).toEqual(['array[1]', '/iri/2']);
      expect(searchParams[5]).toEqual([
        'nested_array.nested[0]',
        '/nested_iri/1',
      ]);
      expect(searchParams[6]).toEqual([
        'nested_array.nested[1]',
        '/nested_iri/2',
      ]);
    });
  });
});

import {
  DELETE,
  DELETE_MANY,
  GET_LIST,
  GET_MANY,
  GET_MANY_REFERENCE,
} from 'react-admin';
import hydraClient, {
  transformJsonLdDocumentToReactAdminDocument,
} from './hydraClient';

describe('map a json-ld document to an admin on rest compatible document', () => {
  const jsonLdDocument = {
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

  describe('transform the JSON-LD document in React Admin document', () => {
    const reactAdminDocument = transformJsonLdDocumentToReactAdminDocument(
      jsonLdDocument,
    );

    test('deep clone the original object', () => {
      expect(reactAdminDocument).not.toBe(jsonLdDocument);
      expect(reactAdminDocument.aNestedObject).not.toBe(
        jsonLdDocument.aNestedObject,
      );
    });

    test('add an id property equal to the original @id property', () => {
      expect(reactAdminDocument.id).toBe(jsonLdDocument['@id']);
    });

    test('preserve the previous id property value in a new originId property', () => {
      expect(reactAdminDocument.originId).toBe(jsonLdDocument.id);
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
});

describe('fetch data from an hydra api', () => {
  test('fetch a get_list resource', async () => {
    const mockHttpClient = jest.fn();
    mockHttpClient.mockReturnValue(
      Promise.resolve({
        json: {
          'hydra:member': [{'@id': 'books/5'}],
        },
      }),
    );

    await hydraClient({entrypoint: 'http://www.example.com'}, mockHttpClient)(
      GET_LIST,
      'books',
      {
        pagination: {page: 2},
        sort: {field: 'id', order: 'ASC'},
      },
    ).then(() => {
      expect(mockHttpClient.mock.calls[0][0].href).toBe(
        'http://www.example.com/books?order%5Bid%5D=ASC&page=2',
      );
    });
  });

  test('fetch a get_list resource with relative api url', async () => {
    const mockHttpClient = jest.fn();
    mockHttpClient.mockReturnValue(
      Promise.resolve({
        json: {
          'hydra:member': [{'@id': 'books/5'}],
        },
      }),
    );

    await hydraClient({entrypoint: '/api'}, mockHttpClient)(GET_LIST, 'books', {
      pagination: {page: 2},
      sort: {field: 'id', order: 'ASC'},
    }).then(() => {
      expect(mockHttpClient.mock.calls[0][0].href).toBe(
        `${window.location.origin}/api/books?order%5Bid%5D=ASC&page=2`,
      );
    });
  });

  test('fetch a get_many resource', async () => {
    const mockHttpClient = jest.fn();
    mockHttpClient
      .mockReturnValueOnce(Promise.resolve({json: {'@id': '/books/3'}}))
      .mockReturnValue(Promise.resolve({json: {'@id': '/books/5'}}));

    await hydraClient({entrypoint: 'http://www.example.com'}, mockHttpClient)(
      GET_MANY,
      'books',
      {
        ids: [3, 5],
      },
    ).then(response => {
      expect(response.data[0].id).toEqual('/books/3');
      expect(response.data[1].id).toEqual('/books/5');
    });
  });

  test('fetch a get_many_reference resource', async () => {
    const mockHttpClient = jest.fn();
    mockHttpClient.mockReturnValue(
      Promise.resolve({
        json: {
          'hydra:member': [{'@id': 'books/5'}],
        },
      }),
    );

    await hydraClient({entrypoint: '/api'}, mockHttpClient)(
      GET_MANY_REFERENCE,
      'books',
      {
        target: 'author',
        id: 'string',
        pagination: {page: 2},
        sort: {field: 'id', order: 'ASC'},
        filter: {
          is_published: 1,
        },
      },
    ).then(response => {
      expect(mockHttpClient.mock.calls[0][0].href).toBe(
        `${window.location.origin}/api/books?order%5Bid%5D=ASC&page=2&is_published=1&author=string`,
      );
    });
  });

  test('delete resource', async () => {
    const mockHttpClient = jest.fn();
    mockHttpClient.mockReturnValueOnce(Promise.resolve(''));

    await hydraClient({entrypoint: 'http://www.example.com'}, mockHttpClient)(
      DELETE,
      'books',
      {
        id: '/books/1',
      },
    ).then(() => {
      expect(mockHttpClient.mock.calls[0][0].href).toBe(
        'http://www.example.com/books/1',
      );
      expect(mockHttpClient.mock.calls[0][1].method).toBe('DELETE');
    });
  });

  test('delete many resources', async () => {
    const mockHttpClient = jest.fn();
    mockHttpClient.mockReturnValueOnce(Promise.resolve(''));

    await hydraClient({entrypoint: 'http://www.example.com'}, mockHttpClient)(
      DELETE_MANY,
      'books',
      {
        ids: ['/books/1', '/books/2'],
      },
    ).then(() => {
      expect(mockHttpClient.mock.calls[0][0].href).toBe(
        'http://www.example.com/books/1',
      );
      expect(mockHttpClient.mock.calls[0][1].method).toBe('DELETE');
      expect(mockHttpClient.mock.calls[1][0].href).toBe(
        'http://www.example.com/books/2',
      );
      expect(mockHttpClient.mock.calls[1][1].method).toBe('DELETE');
    });
  });
});

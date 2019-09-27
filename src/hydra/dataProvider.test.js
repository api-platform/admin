import {transformJsonLdDocumentToReactAdminDocument} from './dataProvider';

describe('map a json-ld document to an admin on rest compatible document', () => {
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

  describe('transform the JSON-LD document in React Admin document', () => {
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
});

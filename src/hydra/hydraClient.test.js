import { transformJsonLdToAOR } from './hydraClient';

describe('map a json-ld document to an admin on rest compatible document', function() {
  const jsonLdDocument = {
    "@id": "/reviews/327",
    "id": 327,
    "@type": "http://schema.org/Review",
    "reviewBody": "Accusantium quia ipsam omnis praesentium. Neque quidem omnis perspiciatis sed. Officiis quo dolor esse nisi molestias.",
    "rating": 3,
    "itemReviewed": {
      "@id": "/books/2",
      "id": 2,
      "@type": "http://schema.org/Book",
      "isbn": "9792828761393",
      "name": "000",
      "description": "string",
      "author": "string",
      "dateCreated": "2017-04-25T00:00:00+00:00",
    }
  };

  describe('transform only the main document when called with a max depth of 1', function() {
    const AORDocument = transformJsonLdToAOR(1)(jsonLdDocument);

    test('add an id property equal to the original @id property', () => {
      expect(AORDocument.id).toEqual(jsonLdDocument['@id']);
    });

    test('preserve the previous id property value in a new originId property', () => {
      expect(AORDocument.originId).toEqual(jsonLdDocument['id']);
    });

    test('do not alter the embedded document', () => {
      expect(AORDocument.id).toEqual(jsonLdDocument['id']);
    });
  });

  describe('transform the embedded document when called with a max depth of 2', function() {
    const AORDocument = transformJsonLdToAOR()(jsonLdDocument);

    test('add an id property on the embedded document equal to the @id property of the embedded document', () => {
      expect(AORDocument.itemReviewed.id).toEqual(AORDocument.itemReviewed['@id']);
    });
  });
});

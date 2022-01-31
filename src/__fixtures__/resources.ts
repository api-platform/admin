import { Resource } from '@api-platform/api-doc-parser';

const resources: Resource[] = [
  {
    name: 'books',
    url: 'https://demo.api-platform.com/books',
    id: 'http://schema.org/Book',
    title: 'Book',
    fields: [
      {
        name: 'isbn',
        id: 'http://schema.org/isbn',
        range: 'http://www.w3.org/2001/XMLSchema#string',
        reference: null,
        required: false,
        description: 'The ISBN of the book',
        maxCardinality: null,
        deprecated: false,
      },
      {
        name: 'title',
        id: 'http://schema.org/name',
        range: 'http://www.w3.org/2001/XMLSchema#string',
        reference: null,
        required: true,
        description: 'The title of the book',
        maxCardinality: null,
        deprecated: false,
      },
      {
        name: 'description',
        id: 'http://schema.org/description',
        range: 'http://www.w3.org/2001/XMLSchema#string',
        reference: null,
        required: true,
        description: 'A description of the item',
        maxCardinality: null,
        deprecated: false,
      },
      {
        name: 'author',
        id: 'http://schema.org/author',
        range: 'http://www.w3.org/2001/XMLSchema#string',
        reference: null,
        required: true,
        description:
          'The author of this content or rating. Please note that author is special in that HTML 5 provides a special mechanism for indicating authorship via the rel tag. That is equivalent to this and may be used interchangeably',
        maxCardinality: null,
        deprecated: false,
      },
      {
        name: 'publicationDate',
        id: 'http://schema.org/dateCreated',
        range: 'http://www.w3.org/2001/XMLSchema#dateTime',
        reference: null,
        required: true,
        description:
          'The date on which the CreativeWork was created or the item was added to a DataFeed',
        maxCardinality: null,
        deprecated: false,
      },
      {
        name: 'reviews',
        id: 'http://schema.org/reviews',
        range: 'http://schema.org/Review',
        reference: {
          name: 'reviews',
          url: 'https://demo.api-platform.com/reviews',
          id: 'http://schema.org/Review',
          title: 'Review',
          fields: [
            {
              name: 'body',
              id: 'http://schema.org/reviewBody',
              range: 'http://www.w3.org/2001/XMLSchema#string',
              reference: null,
              required: false,
              description: 'The actual body of the review',
              maxCardinality: null,
              deprecated: false,
            },
            {
              name: 'rating',
              id: 'https://demo.api-platform.com/docs.jsonld#Review/rating',
              range: 'http://www.w3.org/2001/XMLSchema#integer',
              reference: null,
              required: false,
              description: 'A rating',
              maxCardinality: null,
              deprecated: false,
            },
            {
              name: 'letter',
              id: 'https://demo.api-platform.com/docs.jsonld#Review/letter',
              range: 'http://www.w3.org/2001/XMLSchema#string',
              reference: null,
              required: false,
              description:
                'DEPRECATED (use rating now): A letter to rate the book',
              maxCardinality: null,
              deprecated: true,
            },
            {
              name: 'book',
              id: 'http://schema.org/itemReviewed',
              range: 'http://schema.org/Book',
              required: true,
              description: 'The item that is being reviewed/rated',
              maxCardinality: 1,
              deprecated: false,
            },
            {
              name: 'author',
              id: 'http://schema.org/author',
              range: 'http://www.w3.org/2001/XMLSchema#string',
              reference: null,
              required: false,
              description: 'Author the author of the review',
              maxCardinality: null,
              deprecated: false,
            },
            {
              name: 'publicationDate',
              id: 'https://demo.api-platform.com/docs.jsonld#Review/publicationDate',
              range: 'http://www.w3.org/2001/XMLSchema#dateTime',
              reference: null,
              required: false,
              description: 'Author the author of the review',
              maxCardinality: null,
              deprecated: false,
            },
          ],
          readableFields: [],
          writableFields: [],
          operations: [
            {
              name: 'Retrieves the collection of Review resources.',
              method: 'GET',
              returns: 'http://www.w3.org/ns/hydra/core#Collection',
              types: [
                'http://www.w3.org/ns/hydra/core#Operation',
                'http://schema.org/FindAction',
              ],
              deprecated: false,
            },
            {
              name: 'Creates a Review resource.',
              method: 'POST',
              expects: 'http://schema.org/Review',
              returns: 'http://schema.org/Review',
              types: [
                'http://www.w3.org/ns/hydra/core#Operation',
                'http://schema.org/CreateAction',
              ],
              deprecated: false,
            },
            {
              name: 'Retrieves Review resource.',
              method: 'GET',
              returns: 'http://schema.org/Review',
              types: [
                'http://www.w3.org/ns/hydra/core#Operation',
                'http://schema.org/FindAction',
              ],
              deprecated: false,
            },
            {
              name: 'Deletes the Review resource.',
              method: 'DELETE',
              returns: 'http://www.w3.org/2002/07/owl#Nothing',
              types: [
                'http://www.w3.org/ns/hydra/core#Operation',
                'http://schema.org/DeleteAction',
              ],
              deprecated: false,
            },
            {
              name: 'Replaces the Review resource.',
              method: 'PUT',
              expects: 'http://schema.org/Review',
              returns: 'http://schema.org/Review',
              types: [
                'http://www.w3.org/ns/hydra/core#Operation',
                'http://schema.org/ReplaceAction',
              ],
              deprecated: false,
            },
            {
              name: 'Updates the Review resource.',
              method: 'PATCH',
              expects: 'http://schema.org/Review',
              returns: 'http://schema.org/Review',
              types: ['http://www.w3.org/ns/hydra/core#Operation'],
              deprecated: false,
            },
          ],
          deprecated: false,
          parameters: [],
        },
        required: false,
        description: "The book's reviews",
        maxCardinality: null,
        deprecated: false,
      },
    ],
    readableFields: [
      {
        name: 'isbn',
        id: 'http://schema.org/isbn',
        range: 'http://www.w3.org/2001/XMLSchema#string',
        reference: null,
        required: false,
        description: 'The ISBN of the book',
        maxCardinality: null,
        deprecated: false,
      },
      {
        name: 'title',
        id: 'http://schema.org/name',
        range: 'http://www.w3.org/2001/XMLSchema#string',
        reference: null,
        required: true,
        description: 'The title of the book',
        maxCardinality: null,
        deprecated: false,
      },
      {
        name: 'description',
        id: 'http://schema.org/description',
        range: 'http://www.w3.org/2001/XMLSchema#string',
        reference: null,
        required: true,
        description: 'A description of the item',
        maxCardinality: null,
        deprecated: false,
      },
      {
        name: 'author',
        id: 'http://schema.org/author',
        range: 'http://www.w3.org/2001/XMLSchema#string',
        reference: null,
        required: true,
        description:
          'The author of this content or rating. Please note that author is special in that HTML 5 provides a special mechanism for indicating authorship via the rel tag. That is equivalent to this and may be used interchangeably',
        maxCardinality: null,
        deprecated: false,
      },
      {
        name: 'publicationDate',
        id: 'http://schema.org/dateCreated',
        range: 'http://www.w3.org/2001/XMLSchema#dateTime',
        reference: null,
        required: true,
        description:
          'The date on which the CreativeWork was created or the item was added to a DataFeed',
        maxCardinality: null,
        deprecated: false,
      },
      {
        name: 'reviews',
        id: 'http://schema.org/reviews',
        range: 'http://schema.org/Review',
        reference: {
          name: 'reviews',
          url: 'https://demo.api-platform.com/reviews',
          id: 'http://schema.org/Review',
          title: 'Review',
          fields: [
            {
              name: 'body',
              id: 'http://schema.org/reviewBody',
              range: 'http://www.w3.org/2001/XMLSchema#string',
              reference: null,
              required: false,
              description: 'The actual body of the review',
              maxCardinality: null,
              deprecated: false,
            },
            {
              name: 'rating',
              id: 'https://demo.api-platform.com/docs.jsonld#Review/rating',
              range: 'http://www.w3.org/2001/XMLSchema#integer',
              reference: null,
              required: false,
              description: 'A rating',
              maxCardinality: null,
              deprecated: false,
            },
            {
              name: 'letter',
              id: 'https://demo.api-platform.com/docs.jsonld#Review/letter',
              range: 'http://www.w3.org/2001/XMLSchema#string',
              reference: null,
              required: false,
              description:
                'DEPRECATED (use rating now): A letter to rate the book',
              maxCardinality: null,
              deprecated: true,
            },
            {
              name: 'book',
              id: 'http://schema.org/itemReviewed',
              range: 'http://schema.org/Book',
              required: true,
              description: 'The item that is being reviewed/rated',
              maxCardinality: 1,
              deprecated: false,
            },
            {
              name: 'author',
              id: 'http://schema.org/author',
              range: 'http://www.w3.org/2001/XMLSchema#string',
              reference: null,
              required: false,
              description: 'Author the author of the review',
              maxCardinality: null,
              deprecated: false,
            },
            {
              name: 'publicationDate',
              id: 'https://demo.api-platform.com/docs.jsonld#Review/publicationDate',
              range: 'http://www.w3.org/2001/XMLSchema#dateTime',
              reference: null,
              required: false,
              description: 'Author the author of the review',
              maxCardinality: null,
              deprecated: false,
            },
          ],
          readableFields: [],
          writableFields: [],
          operations: [
            {
              name: 'Retrieves the collection of Review resources.',
              method: 'GET',
              returns: 'http://www.w3.org/ns/hydra/core#Collection',
              types: [
                'http://www.w3.org/ns/hydra/core#Operation',
                'http://schema.org/FindAction',
              ],
              deprecated: false,
            },
            {
              name: 'Creates a Review resource.',
              method: 'POST',
              expects: 'http://schema.org/Review',
              returns: 'http://schema.org/Review',
              types: [
                'http://www.w3.org/ns/hydra/core#Operation',
                'http://schema.org/CreateAction',
              ],
              deprecated: false,
            },
            {
              name: 'Retrieves Review resource.',
              method: 'GET',
              returns: 'http://schema.org/Review',
              types: [
                'http://www.w3.org/ns/hydra/core#Operation',
                'http://schema.org/FindAction',
              ],
              deprecated: false,
            },
            {
              name: 'Deletes the Review resource.',
              method: 'DELETE',
              returns: 'http://www.w3.org/2002/07/owl#Nothing',
              types: [
                'http://www.w3.org/ns/hydra/core#Operation',
                'http://schema.org/DeleteAction',
              ],
              deprecated: false,
            },
            {
              name: 'Replaces the Review resource.',
              method: 'PUT',
              expects: 'http://schema.org/Review',
              returns: 'http://schema.org/Review',
              types: [
                'http://www.w3.org/ns/hydra/core#Operation',
                'http://schema.org/ReplaceAction',
              ],
              deprecated: false,
            },
            {
              name: 'Updates the Review resource.',
              method: 'PATCH',
              expects: 'http://schema.org/Review',
              returns: 'http://schema.org/Review',
              types: ['http://www.w3.org/ns/hydra/core#Operation'],
              deprecated: false,
            },
          ],
          deprecated: false,
          parameters: [],
        },
        required: false,
        description: "The book's reviews",
        maxCardinality: null,
        deprecated: false,
      },
    ],
    writableFields: [
      {
        name: 'isbn',
        id: 'http://schema.org/isbn',
        range: 'http://www.w3.org/2001/XMLSchema#string',
        reference: null,
        required: false,
        description: 'The ISBN of the book',
        maxCardinality: null,
        deprecated: false,
      },
      {
        name: 'title',
        id: 'http://schema.org/name',
        range: 'http://www.w3.org/2001/XMLSchema#string',
        reference: null,
        required: true,
        description: 'The title of the book',
        maxCardinality: null,
        deprecated: false,
      },
      {
        name: 'description',
        id: 'http://schema.org/description',
        range: 'http://www.w3.org/2001/XMLSchema#string',
        reference: null,
        required: true,
        description: 'A description of the item',
        maxCardinality: null,
        deprecated: false,
      },
      {
        name: 'author',
        id: 'http://schema.org/author',
        range: 'http://www.w3.org/2001/XMLSchema#string',
        reference: null,
        required: true,
        description:
          'The author of this content or rating. Please note that author is special in that HTML 5 provides a special mechanism for indicating authorship via the rel tag. That is equivalent to this and may be used interchangeably',
        maxCardinality: null,
        deprecated: false,
      },
      {
        name: 'publicationDate',
        id: 'http://schema.org/dateCreated',
        range: 'http://www.w3.org/2001/XMLSchema#dateTime',
        reference: null,
        required: true,
        description:
          'The date on which the CreativeWork was created or the item was added to a DataFeed',
        maxCardinality: null,
        deprecated: false,
      },
      {
        name: 'reviews',
        id: 'http://schema.org/reviews',
        range: 'http://schema.org/Review',
        reference: {
          name: 'reviews',
          url: 'https://demo.api-platform.com/reviews',
          id: 'http://schema.org/Review',
          title: 'Review',
          fields: [
            {
              name: 'body',
              id: 'http://schema.org/reviewBody',
              range: 'http://www.w3.org/2001/XMLSchema#string',
              reference: null,
              required: false,
              description: 'The actual body of the review',
              maxCardinality: null,
              deprecated: false,
            },
            {
              name: 'rating',
              id: 'https://demo.api-platform.com/docs.jsonld#Review/rating',
              range: 'http://www.w3.org/2001/XMLSchema#integer',
              reference: null,
              required: false,
              description: 'A rating',
              maxCardinality: null,
              deprecated: false,
            },
            {
              name: 'letter',
              id: 'https://demo.api-platform.com/docs.jsonld#Review/letter',
              range: 'http://www.w3.org/2001/XMLSchema#string',
              reference: null,
              required: false,
              description:
                'DEPRECATED (use rating now): A letter to rate the book',
              maxCardinality: null,
              deprecated: true,
            },
            {
              name: 'book',
              id: 'http://schema.org/itemReviewed',
              range: 'http://schema.org/Book',
              required: true,
              description: 'The item that is being reviewed/rated',
              maxCardinality: 1,
              deprecated: false,
            },
            {
              name: 'author',
              id: 'http://schema.org/author',
              range: 'http://www.w3.org/2001/XMLSchema#string',
              reference: null,
              required: false,
              description: 'Author the author of the review',
              maxCardinality: null,
              deprecated: false,
            },
            {
              name: 'publicationDate',
              id: 'https://demo.api-platform.com/docs.jsonld#Review/publicationDate',
              range: 'http://www.w3.org/2001/XMLSchema#dateTime',
              reference: null,
              required: false,
              description: 'Author the author of the review',
              maxCardinality: null,
              deprecated: false,
            },
          ],
          readableFields: [],
          writableFields: [],
          operations: [
            {
              name: 'Retrieves the collection of Review resources.',
              method: 'GET',
              returns: 'http://www.w3.org/ns/hydra/core#Collection',
              types: [
                'http://www.w3.org/ns/hydra/core#Operation',
                'http://schema.org/FindAction',
              ],
              deprecated: false,
            },
            {
              name: 'Creates a Review resource.',
              method: 'POST',
              expects: 'http://schema.org/Review',
              returns: 'http://schema.org/Review',
              types: [
                'http://www.w3.org/ns/hydra/core#Operation',
                'http://schema.org/CreateAction',
              ],
              deprecated: false,
            },
            {
              name: 'Retrieves Review resource.',
              method: 'GET',
              returns: 'http://schema.org/Review',
              types: [
                'http://www.w3.org/ns/hydra/core#Operation',
                'http://schema.org/FindAction',
              ],
              deprecated: false,
            },
            {
              name: 'Deletes the Review resource.',
              method: 'DELETE',
              returns: 'http://www.w3.org/2002/07/owl#Nothing',
              types: [
                'http://www.w3.org/ns/hydra/core#Operation',
                'http://schema.org/DeleteAction',
              ],
              deprecated: false,
            },
            {
              name: 'Replaces the Review resource.',
              method: 'PUT',
              expects: 'http://schema.org/Review',
              returns: 'http://schema.org/Review',
              types: [
                'http://www.w3.org/ns/hydra/core#Operation',
                'http://schema.org/ReplaceAction',
              ],
              deprecated: false,
            },
            {
              name: 'Updates the Review resource.',
              method: 'PATCH',
              expects: 'http://schema.org/Review',
              returns: 'http://schema.org/Review',
              types: ['http://www.w3.org/ns/hydra/core#Operation'],
              deprecated: false,
            },
          ],
          deprecated: false,
          parameters: [],
        },
        required: false,
        description: "The book's reviews",
        maxCardinality: null,
        deprecated: false,
      },
    ],
    operations: [
      {
        name: 'Retrieves the collection of Book resources.',
        method: 'GET',
        returns: 'http://www.w3.org/ns/hydra/core#Collection',
        types: [
          'http://www.w3.org/ns/hydra/core#Operation',
          'http://schema.org/FindAction',
        ],
        deprecated: false,
      },
      {
        name: 'Creates a Book resource.',
        method: 'POST',
        expects: 'http://schema.org/Book',
        returns: 'http://schema.org/Book',
        types: [
          'http://www.w3.org/ns/hydra/core#Operation',
          'http://schema.org/CreateAction',
        ],
        deprecated: false,
      },
      {
        name: 'Retrieves Book resource.',
        method: 'GET',
        returns: 'http://schema.org/Book',
        types: [
          'http://www.w3.org/ns/hydra/core#Operation',
          'http://schema.org/FindAction',
        ],
        deprecated: false,
      },
      {
        name: 'Replaces the Book resource.',
        method: 'PUT',
        expects: 'http://schema.org/Book',
        returns: 'http://schema.org/Book',
        types: [
          'http://www.w3.org/ns/hydra/core#Operation',
          'http://schema.org/ReplaceAction',
        ],
        deprecated: false,
      },
      {
        name: 'Deletes the Book resource.',
        method: 'DELETE',
        returns: 'http://www.w3.org/2002/07/owl#Nothing',
        types: [
          'http://www.w3.org/ns/hydra/core#Operation',
          'http://schema.org/DeleteAction',
        ],
        deprecated: false,
      },
    ],
    deprecated: false,
    parameters: [],
  },
  {
    name: 'parchments',
    url: 'https://demo.api-platform.com/parchments',
    id: 'https://demo.api-platform.com/docs.jsonld#Parchment',
    title: 'Parchment',
    fields: [
      {
        name: 'title',
        id: 'https://demo.api-platform.com/docs.jsonld#Parchment/title',
        range: 'http://www.w3.org/2001/XMLSchema#string',
        reference: null,
        required: true,
        description: 'The title of the book',
        maxCardinality: null,
        deprecated: false,
      },
      {
        name: 'description',
        id: 'https://demo.api-platform.com/docs.jsonld#Parchment/description',
        range: 'http://www.w3.org/2001/XMLSchema#string',
        reference: null,
        required: true,
        description: 'A description of the item',
        maxCardinality: null,
        deprecated: false,
      },
    ],
    readableFields: [
      {
        name: 'title',
        id: 'https://demo.api-platform.com/docs.jsonld#Parchment/title',
        range: 'http://www.w3.org/2001/XMLSchema#string',
        reference: null,
        required: true,
        description: 'The title of the book',
        maxCardinality: null,
        deprecated: false,
      },
      {
        name: 'description',
        id: 'https://demo.api-platform.com/docs.jsonld#Parchment/description',
        range: 'http://www.w3.org/2001/XMLSchema#string',
        reference: null,
        required: true,
        description: 'A description of the item',
        maxCardinality: null,
        deprecated: false,
      },
    ],
    writableFields: [
      {
        name: 'title',
        id: 'https://demo.api-platform.com/docs.jsonld#Parchment/title',
        range: 'http://www.w3.org/2001/XMLSchema#string',
        reference: null,
        required: true,
        description: 'The title of the book',
        maxCardinality: null,
        deprecated: false,
      },
      {
        name: 'description',
        id: 'https://demo.api-platform.com/docs.jsonld#Parchment/description',
        range: 'http://www.w3.org/2001/XMLSchema#string',
        reference: null,
        required: true,
        description: 'A description of the item',
        maxCardinality: null,
        deprecated: false,
      },
    ],
    operations: [
      {
        name: 'Retrieves the collection of Parchment resources.',
        method: 'GET',
        returns: 'http://www.w3.org/ns/hydra/core#Collection',
        types: [
          'http://www.w3.org/ns/hydra/core#Operation',
          'http://schema.org/FindAction',
        ],
        deprecated: true,
      },
      {
        name: 'Creates a Parchment resource.',
        method: 'POST',
        expects: 'https://demo.api-platform.com/docs.jsonld#Parchment',
        returns: 'https://demo.api-platform.com/docs.jsonld#Parchment',
        types: [
          'http://www.w3.org/ns/hydra/core#Operation',
          'http://schema.org/CreateAction',
        ],
        deprecated: true,
      },
      {
        name: 'Retrieves Parchment resource.',
        method: 'GET',
        returns: 'https://demo.api-platform.com/docs.jsonld#Parchment',
        types: [
          'http://www.w3.org/ns/hydra/core#Operation',
          'http://schema.org/FindAction',
        ],
        deprecated: true,
      },
      {
        name: 'Deletes the Parchment resource.',
        method: 'DELETE',
        returns: 'http://www.w3.org/2002/07/owl#Nothing',
        types: [
          'http://www.w3.org/ns/hydra/core#Operation',
          'http://schema.org/DeleteAction',
        ],
        deprecated: true,
      },
      {
        name: 'Replaces the Parchment resource.',
        method: 'PUT',
        expects: 'https://demo.api-platform.com/docs.jsonld#Parchment',
        returns: 'https://demo.api-platform.com/docs.jsonld#Parchment',
        types: [
          'http://www.w3.org/ns/hydra/core#Operation',
          'http://schema.org/ReplaceAction',
        ],
        deprecated: true,
      },
      {
        name: 'Updates the Parchment resource.',
        method: 'PATCH',
        expects: 'https://demo.api-platform.com/docs.jsonld#Parchment',
        returns: 'https://demo.api-platform.com/docs.jsonld#Parchment',
        types: ['http://www.w3.org/ns/hydra/core#Operation'],
        deprecated: true,
      },
    ],
    deprecated: true,
    parameters: [],
  },
];

export default resources;

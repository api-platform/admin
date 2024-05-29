// eslint-disable-next-line tree-shaking/no-side-effects-in-initialization
import { Api, Field, Parameter, Resource } from '@api-platform/api-doc-parser';

export const API_DATA = new Api('entrypoint', {
  resources: [
    new Resource('resource', '/resources', {
      fields: [new Field('bar')],
    }),
    new Resource('idSearchFilterResource', '/id_search_filter_resources', {
      parameters: [new Parameter('id', 'xmls:string', false, '')],
      getParameters: () => Promise.resolve([]),
    }),
  ],
});

const EmbeddedResource = new Resource('embedded', '/embeddeds', {
  fields: [new Field('address')],
});

export const API_FIELDS_DATA = [
  new Field('id', {
    id: 'http://schema.org/id',
    range: 'http://www.w3.org/2001/XMLSchema#integer',
    reference: null,
    embedded: null,
    required: false,
  }),
  new Field('fieldA', {
    id: 'http://schema.org/fieldA',
    range: 'http://www.w3.org/2001/XMLSchema#string',
    reference: null,
    embedded: null,
    required: true,
  }),
  new Field('fieldB', {
    id: 'http://schema.org/fieldB',
    range: 'http://www.w3.org/2001/XMLSchema#string',
    reference: null,
    embedded: null,
    required: true,
  }),
  new Field('deprecatedField', {
    id: 'http://localhost/deprecatedField',
    range: 'http://www.w3.org/2001/XMLSchema#string',
    reference: null,
    embedded: null,
    required: true,
    deprecated: true,
  }),
  new Field('title', {
    id: 'http://schema.org/title',
    range: 'http://www.w3.org/2001/XMLSchema#string',
    reference: null,
    embedded: null,
    required: false,
  }),
  new Field('description', {
    id: 'http://schema.org/description',
    range: 'http://www.w3.org/2001/XMLSchema#string',
    reference: null,
    embedded: null,
    required: false,
  }),
  new Field('nullText', {
    id: 'http://schema.org/nullText',
    range: 'http://www.w3.org/2001/XMLSchema#string',
    reference: null,
    embedded: null,
    required: false,
  }),
  new Field('embedded', {
    id: 'http://schema.org/embedded',
    reference: null,
    embedded: EmbeddedResource,
    maxCardinality: 1,
    required: false,
  }),
  new Field('embeddeds', {
    id: 'http://schema.org/embedded',
    reference: null,
    embedded: EmbeddedResource,
    required: false,
  }),
  new Field('formatType', {
    id: 'https://schema.org/BookFormatType',
    range: 'http://www.w3.org/2001/XMLSchema#string',
    reference: null,
    embedded: null,
    enum: {
      'Https://schema.org/ebook': 'https://schema.org/EBook',
      'Https://schema.org/audiobookformat':
        'https://schema.org/AudiobookFormat',
      'Https://schema.org/hardcover': 'https://schema.org/Hardcover',
    },
    required: false,
  }),
  new Field('status', {
    id: 'http://localhost/status',
    range: 'http://www.w3.org/2001/XMLSchema#string',
    reference: null,
    embedded: null,
    enum: { Available: 'AVAILABLE', 'Sold out': 'SOLD_OUT' },
    required: false,
  }),
  new Field('genre', {
    id: 'http://localhost/tags',
    range: 'http://www.w3.org/2001/XMLSchema#array',
    reference: null,
    embedded: null,
    maxCardinality: null,
    enum: { Epic: 'EPIC', 'Fairy tale': 'FAIRY_TALE', Myth: 'MYTH' },
    required: false,
  }),
  new Field('owner', {
    id: 'http://localhost/owner',
    range: 'https://schema.org/Person',
    reference: {
      id: 'https://schema.org/Person',
      name: 'users',
      url: 'http://localhost/users',
      fields: [],
    },
    embedded: null,
    maxCardinality: 1,
    required: false,
  }),
];

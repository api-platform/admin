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
];

import { Field } from '@api-platform/api-doc-parser';

export const API_FIELDS_DATA = [
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
];

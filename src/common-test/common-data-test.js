import Field from '@api-platform/api-doc-parser/lib/Field';

export const ENTRYPOINT = 'http://entrypoint';

export const RESOURCE_NAME = 'user';

export const API_INPUT_DATA = {
  resources: [
    {
      name: `${RESOURCE_NAME}`,
      fields: [
        new Field('fieldA', {
          id: 'http://schema.org/fieldA',
          range: 'http://www.w3.org/2001/XMLSchema#string',
          reference: null,
          required: true,
        }),
        new Field('fieldB', {
          id: 'http://schema.org/fieldB',
          range: 'http://www.w3.org/2001/XMLSchema#string',
          reference: null,
          required: true,
        }),
        new Field('deprecatedField', {
          id: 'http://localhost/deprecatedField',
          range: 'http://www.w3.org/2001/XMLSchema#string',
          reference: null,
          required: true,
          deprecated: true,
        }),
      ],
      parameters: [],
      url: `${ENTRYPOINT}/users`,
    },
  ],
};

export const API_FIELDS_DATA = [
  new Field('fieldA', {
    id: 'http://schema.org/fieldA',
    range: 'http://www.w3.org/2001/XMLSchema#string',
    reference: null,
    required: true,
  }),
  new Field('fieldB', {
    id: 'http://schema.org/fieldB',
    range: 'http://www.w3.org/2001/XMLSchema#string',
    reference: null,
    required: true,
  }),
  new Field('deprecatedField', {
    id: 'http://localhost/deprecatedField',
    range: 'http://www.w3.org/2001/XMLSchema#string',
    reference: null,
    required: true,
    deprecated: true,
  }),
];

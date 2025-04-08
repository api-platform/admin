import type { HttpError } from 'react-admin';
import fetchMock from 'jest-fetch-mock';
import fetchHydra from './fetchHydra.js';
import schemaAnalyzer from './schemaAnalyzer.js';

fetchMock.enableMocks();

const headers = {
  'Content-Type': 'application/ld+json; charset=utf-8',
  Link: '<http://localhost/docs.jsonld>; rel="http://www.w3.org/ns/hydra/core#apiDocumentation"',
};

test.each([
  [
    'ld+json',
    {
      '@context': '/contexts/ConstraintViolationList',
      '@type': 'ConstraintViolationList',
      'hydra:title': 'An error occurred',
      'hydra:description':
        'plainPassword: Password must be at least 6 characters long.',
      violations: [
        {
          propertyPath: 'plainPassword',
          message: 'Password must be at least 6 characters long.',
        },
      ],
    },
    { plainPassword: 'Password must be at least 6 characters long.' },
  ],
  [
    'problem+json',
    {
      '@id': '\\/validation_errors\\/6b3befbc-2f01-4ddf-be21-b57898905284',
      '@type': 'ConstraintViolationList',
      status: 422,
      violations: [
        {
          propertyPath: 'entitlements',
          message:
            'At least one product must be selected if policy is restricted.',
          code: '6b3befbc-2f01-4ddf-be21-b57898905284',
        },
      ],
      detail:
        'entitlements: At least one product must be selected if policy is restricted.',
      'hydra:title': 'An error occurred',
      'hydra:description':
        'entitlements: At least one product must be selected if policy is restricted.',
      type: '\\/validation_errors\\/6b3befbc-2f01-4ddf-be21-b57898905284',
      title: 'An error occurred',
    },
    {
      entitlements:
        'At least one product must be selected if policy is restricted.',
    },
  ],
  [
    'problem+json',
    {
      '@context': '/contexts/ConstraintViolation',
      '@id': '/validation_errors/2881c032-660f-46b6-8153-d352d9706640',
      '@type': 'ConstraintViolation',
      status: 422,
      violations: [
        {
          propertyPath: 'isbn',
          'ConstraintViolation/message':
            'This value is neither a valid ISBN-10 nor a valid ISBN-13.',
          'ConstraintViolation/code': '2881c032-660f-46b6-8153-d352d9706640',
        },
      ],
      detail:
        'isbn: This value is neither a valid ISBN-10 nor a valid ISBN-13.',
      description:
        'isbn: This value is neither a valid ISBN-10 nor a valid ISBN-13.',
      type: '/validation_errors/2881c032-660f-46b6-8153-d352d9706640',
      title: 'An error occurred',
    },
    {
      isbn: 'This value is neither a valid ISBN-10 nor a valid ISBN-13.',
    },
  ],
])(
  '%s violation list expanding',
  async (format: string, resBody: object, expected: object) => {
    fetchMock.mockResponses(
      [
        JSON.stringify(resBody),
        {
          status: 422,
          statusText: '422 Unprocessable Content',
          headers: {
            ...headers,
            'Content-Type': `application/${format}; charset=utf-8`,
          },
        },
      ],
      [
        JSON.stringify({
          '@context': {
            '@vocab': 'http://localhost/docs.jsonld#',
            hydra: 'http://www.w3.org/ns/hydra/core#',
          },
        }),
        {
          status: 200,
          statusText: 'OK',
          headers,
        },
      ],
    );

    let violations;
    try {
      await fetchHydra(new URL('http://localhost/users'));
    } catch (error) {
      violations = schemaAnalyzer().getSubmissionErrors(error as HttpError);
    }
    expect(violations).toStrictEqual(expected);
  },
);

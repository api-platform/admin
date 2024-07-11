import { Field } from '@api-platform/api-doc-parser';
import getIdentifierValue from './getIdentifierValue.js';
import {
  getFiltersParametersFromSchema,
  getOrderParametersFromSchema,
} from './introspection/schemaAnalyzer.js';
import type { SchemaAnalyzer } from './types.js';

const schemaAnalyzer: SchemaAnalyzer = {
  getFiltersParametersFromSchema,
  getOrderParametersFromSchema,
  getFieldNameFromSchema: () => 'fieldName',
  getSubmissionErrors: () => null,
  getFieldType: (field) => {
    if (field.name === 'stringId') {
      return 'id';
    }
    if (field.name === 'intId') {
      return 'integer_id';
    }

    return 'text';
  },
};

test('Get identifier from a non string value', () => {
  expect(getIdentifierValue(schemaAnalyzer, 'foo', [], 'description', 46)).toBe(
    46,
  );
});

test('Get identifier from a non prefixed value', () => {
  expect(
    getIdentifierValue(schemaAnalyzer, 'foo', [], 'description', 'lorem'),
  ).toBe('lorem');
});

test('Get identifier from a not found field', () => {
  expect(
    getIdentifierValue(schemaAnalyzer, 'foo', [], 'id', '/foo/fooId'),
  ).toBe('/foo/fooId');
});

test('Get identifier from a non identifier field', () => {
  expect(
    getIdentifierValue(
      schemaAnalyzer,
      'foo',
      [new Field('description')],
      'description',
      '/foo/fooId',
    ),
  ).toBe('/foo/fooId');
});

test('Get identifier from an identifier field', () => {
  expect(
    getIdentifierValue(
      schemaAnalyzer,
      'foo',
      [new Field('stringId')],
      'stringId',
      '/foo/fooId',
    ),
  ).toBe('fooId');
});

test('Get identifier from an "id" field', () => {
  expect(
    getIdentifierValue(
      schemaAnalyzer,
      'foo',
      [new Field('id')],
      'id',
      '/foo/fooId',
    ),
  ).toBe('fooId');
});

test('Get identifier from an integer identifier field', () => {
  expect(
    getIdentifierValue(
      schemaAnalyzer,
      'foo',
      [new Field('intId')],
      'intId',
      '/foo/76',
    ),
  ).toBe(76);
});

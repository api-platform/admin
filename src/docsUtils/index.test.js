import {
  getOrderParametersFromResourceSchema,
  getFiltersParametersFromResourceSchema,
} from './index';

describe('docsUtils', () => {
  describe('getFiltersParametersFromResourceSchema', () => {
    const resourceSchema = {
      fields: [
        {
          deprecated: false,
          description: 'The ISBN of the book',
          id: 'http://schema.org/isbn',
          maxCardinality: null,
          name: 'name',
          range: 'http://www.w3.org/2001/XMLSchema#string',
          reference: null,
          required: false,
        },
      ],
      parameters: [
        {
          description: '',
          range: null,
          required: false,
          variable: 'name',
        },
      ],
    };

    it('should return an array of formated filters from the resource schema', () => {
      expect(getFiltersParametersFromResourceSchema(resourceSchema)).toEqual([
        {
          name: 'name',
          isRequired: false,
        },
      ]);
    });

    it('should remove the ordination parameters', () => {
      expect(
        getFiltersParametersFromResourceSchema({
          ...resourceSchema,
          parameters: [
            ...resourceSchema.parameters,
            {
              description: '',
              range: null,
              required: false,
              variable: 'order[id]',
            },
          ],
        }),
      ).toEqual([
        {
          name: 'name',
          isRequired: false,
        },
      ]);
    });

    it('should remove unauthorized fields', () => {
      expect(
        getFiltersParametersFromResourceSchema({
          ...resourceSchema,
          parameters: [
            ...resourceSchema.parameters,
            {
              description: '',
              range: null,
              required: false,
              variable: 'order[id]',
            },
            {
              description: '',
              range: null,
              required: false,
              variable: 'unauthorized',
            },
          ],
        }),
      ).toEqual([
        {
          name: 'name',
          isRequired: false,
        },
      ]);
    });
  });

  describe('getOrdersParametersFromResourceSchema', () => {
    const resourceSchema = {
      fields: [
        {
          deprecated: false,
          description: 'unique id',
          id: 'http://schema.org/id',
          maxCardinality: null,
          name: 'id',
          range: 'http://www.w3.org/2001/XMLSchema#string',
          reference: null,
          required: true,
        },
      ],
      parameters: [
        {
          description: '',
          range: null,
          required: false,
          variable: 'order[id]',
        },
      ],
    };

    it("should return an array of orderable field's names", () => {
      expect(getOrderParametersFromResourceSchema(resourceSchema)).toEqual([
        'id',
      ]);
    });

    it('should remove the filters parameters', () => {
      expect(
        getOrderParametersFromResourceSchema({
          ...resourceSchema,
          parameters: [
            ...resourceSchema.parameters,
            {
              description: '',
              range: null,
              required: false,
              variable: 'name',
            },
          ],
        }),
      ).toEqual(['id']);
    });

    it('should remove unauthorized fields', () => {
      expect(
        getOrderParametersFromResourceSchema({
          ...resourceSchema,
          parameters: [
            ...resourceSchema.parameters,
            {
              description: '',
              range: null,
              required: false,
              variable: 'name',
            },
            {
              description: '',
              range: null,
              required: false,
              variable: 'order[unauthorized]',
            },
          ],
        }),
      ).toEqual(['id']);
    });
  });
});

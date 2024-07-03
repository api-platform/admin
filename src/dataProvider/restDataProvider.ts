import { stringify } from 'query-string';
import { fetchUtils } from 'react-admin';
import type { DataProvider } from 'react-admin';
import { removeTrailingSlash } from '../removeTrailingSlash.js';

// Based on https://github.com/marmelab/react-admin/blob/master/packages/ra-data-simple-rest/src/index.ts

export default (
  entrypoint: string,
  httpClient = fetchUtils.fetchJson,
): DataProvider => {
  const apiUrl = new URL(entrypoint, window.location.href);

  return {
    getList: async (resource, params) => {
      const { page, perPage } = params.pagination ?? { page: 1, perPage: 25 };
      const { field, order } = params.sort ?? { field: 'id', order: 'DESC' };

      const rangeStart = (page - 1) * perPage;
      const rangeEnd = page * perPage - 1;

      const query = {
        sort: JSON.stringify([field, order]),
        range: JSON.stringify([rangeStart, rangeEnd]),
        filter: JSON.stringify(params.filter),
      };
      const url = `${removeTrailingSlash(
        apiUrl.toString(),
      )}/${resource}?${stringify(query)}`;
      const { json } = await httpClient(url);

      return {
        data: json,
        pageInfo: {
          hasNextPage: true,
          hasPreviousPage: page > 1,
        },
      };
    },

    getOne: async (resource, params) => {
      const url = `${removeTrailingSlash(apiUrl.toString())}/${resource}/${
        params.id
      }`;
      const { json } = await httpClient(url);

      return {
        data: json,
      };
    },

    getMany: async (resource, params) => {
      const query = {
        filter: JSON.stringify({ id: params.ids }),
      };
      const url = `${removeTrailingSlash(
        apiUrl.toString(),
      )}/${resource}?${stringify(query)}`;
      const { json } = await httpClient(url);

      return {
        data: json,
      };
    },

    getManyReference: async (resource, params) => {
      const { page, perPage } = params.pagination;
      const { field, order } = params.sort;

      const rangeStart = (page - 1) * perPage;
      const rangeEnd = page * perPage - 1;

      const query = {
        sort: JSON.stringify([field, order]),
        range: JSON.stringify([rangeStart, rangeEnd]),
        filter: JSON.stringify({
          ...params.filter,
          [params.target]: params.id,
        }),
      };
      const url = `${removeTrailingSlash(
        apiUrl.toString(),
      )}/${resource}?${stringify(query)}`;
      const { json } = await httpClient(url);

      return {
        data: json,
        pageInfo: {
          hasNextPage: true,
          hasPreviousPage: page > 1,
        },
      };
    },

    update: async (resource, params) => {
      const url = `${removeTrailingSlash(apiUrl.toString())}/${resource}/${
        params.id
      }`;
      const { json } = await httpClient(url, {
        method: 'PUT',
        body: JSON.stringify(params.data),
      });

      return {
        data: json,
      };
    },

    updateMany: async (resource, params) => {
      const responses = await Promise.all(
        params.ids.map((id) => {
          const url = `${removeTrailingSlash(
            apiUrl.toString(),
          )}/${resource}/${id}`;

          return httpClient(url, {
            method: 'PUT',
            body: JSON.stringify(params.data),
          });
        }),
      );

      return { data: responses.map(({ json }) => json.id) };
    },

    create: async (resource, params) => {
      const url = `${removeTrailingSlash(apiUrl.toString())}/${resource}`;
      const { json } = await httpClient(url, {
        method: 'POST',
        body: JSON.stringify(params.data),
      });

      return {
        data: json,
      };
    },

    delete: async (resource, params) => {
      const url = `${removeTrailingSlash(apiUrl.toString())}/${resource}/${
        params.id
      }`;
      const { json } = await httpClient(url, {
        method: 'DELETE',
      });

      return {
        data: json,
      };
    },

    deleteMany: async (resource, params) => {
      const responses = await Promise.all(
        params.ids.map((id) => {
          const url = `${removeTrailingSlash(
            apiUrl.toString(),
          )}/${resource}/${id}`;

          return httpClient(url, {
            method: 'DELETE',
          });
        }),
      );

      return {
        data: responses.map(({ json }) => json.id),
      };
    },
  };
};

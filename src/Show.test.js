import Api from '@api-platform/api-doc-parser/lib/Api';
import Field from '@api-platform/api-doc-parser/lib/Field';
import Resource from '@api-platform/api-doc-parser/lib/Resource';
import {TextField} from 'react-admin';
import {shallow} from 'enzyme';
import React from 'react';
import fieldFactory from './fieldFactory';
import Show from './Show';

const entrypoint = 'http://entrypoint';

const apiData = {
  entrypoint,
};

const resourceData = {
  name: 'user',
  readableFields: [
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
  url: `${entrypoint}/users`,
};

describe('<Show />', () => {
  test('without overrides', () => {
    const defaultFieldFactory = jest.fn(fieldFactory);

    const resource = new Resource(
      resourceData.name,
      resourceData.url,
      resourceData,
    );

    const api = new Api(apiData.entrypoint, {
      ...apiData,
      resources: [resource],
    });

    const render = shallow(
      <Show
        options={{
          api,
          fieldFactory: defaultFieldFactory,
          resource,
        }}
        location={{}}
        match={{}}
        resource=""
      />,
    );

    expect(defaultFieldFactory).toHaveBeenCalledTimes(2);
    expect(render.find(TextField).length).toEqual(3);
    expect(render.find(TextField).get(0).props.source).toEqual('id');
    expect(render.find(TextField).get(1).props.source).toEqual('fieldA');
    expect(render.find(TextField).get(2).props.source).toEqual('fieldB');
  });

  test('without default identifier field', () => {
    const defaultFieldFactory = jest.fn(fieldFactory);

    const resource = new Resource(resourceData.name, resourceData.url, {
      ...resourceData,
      showProps: {
        addIdField: false,
      },
    });

    const api = new Api(apiData.entrypoint, {
      ...apiData,
      resources: [resource],
    });

    const render = shallow(
      <Show
        options={{
          api,
          fieldFactory: defaultFieldFactory,
          resource,
        }}
        location={{}}
        match={{}}
        resource=""
      />,
    );

    expect(defaultFieldFactory).toHaveBeenCalledTimes(2);
    expect(render.find(TextField).length).toEqual(2);
    expect(render.find(TextField).get(0).props.source).toEqual('fieldA');
    expect(render.find(TextField).get(1).props.source).toEqual('fieldB');
  });

  test('with custom fieldFactory', () => {
    const customFieldFactory = jest.fn(fieldFactory);
    const defaultFieldFactory = jest.fn(fieldFactory);

    const resource = new Resource(resourceData.name, resourceData.url, {
      ...resourceData,
      showProps: {
        options: {
          fieldFactory: customFieldFactory,
        },
      },
    });

    const api = new Api(apiData.entrypoint, {
      ...apiData,
      resources: [resource],
    });

    const render = shallow(
      <Show
        options={{
          api,
          fieldFactory: defaultFieldFactory,
          resource,
        }}
        location={{}}
        match={{}}
        resource=""
      />,
    );

    expect(customFieldFactory).toHaveBeenCalledTimes(2);
    expect(defaultFieldFactory).toHaveBeenCalledTimes(0);
    expect(render.find(TextField).length).toEqual(3);
    expect(render.find(TextField).get(0).props.source).toEqual('id');
    expect(render.find(TextField).get(1).props.source).toEqual('fieldA');
    expect(render.find(TextField).get(2).props.source).toEqual('fieldB');
  });

  test('with custom fields', () => {
    const defaultFieldFactory = jest.fn(fieldFactory);

    const resource = new Resource(resourceData.name, resourceData.url, {
      ...resourceData,
      showFields: [
        new Field('fieldC', {
          id: 'http://schema.org/fieldC',
          range: 'http://www.w3.org/2001/XMLSchema#string',
          reference: null,
          required: true,
        }),
      ],
    });

    const api = new Api(apiData.entrypoint, {
      ...apiData,
      resources: [resource],
    });

    const render = shallow(
      <Show
        options={{
          api,
          fieldFactory: defaultFieldFactory,
          resource,
        }}
        location={{}}
        match={{}}
        resource=""
      />,
    );

    expect(defaultFieldFactory).toHaveBeenCalledTimes(1);
    expect(render.find(TextField).length).toEqual(2);
    expect(render.find(TextField).get(0).props.source).toEqual('id');
    expect(render.find(TextField).get(1).props.source).toEqual('fieldC');
  });

  test('with readable identifier', () => {
    const defaultFieldFactory = jest.fn(fieldFactory);

    const resource = new Resource(resourceData.name, resourceData.url, {
      ...resourceData,
      readableFields: [
        ...resourceData.readableFields,
        new Field('id', {
          id: 'http://schema.org/identifier',
          range: 'http://www.w3.org/2001/XMLSchema#string',
          reference: null,
          required: true,
        }),
      ],
      showProps: {
        addIdField: false,
      },
    });

    const api = new Api(apiData.entrypoint, {
      ...apiData,
      resources: [resource],
    });

    const render = shallow(
      <Show
        options={{
          api,
          fieldFactory: defaultFieldFactory,
          resource,
        }}
        location={{}}
        match={{}}
        resource=""
      />,
    );

    expect(defaultFieldFactory).toHaveBeenCalledTimes(3);
    expect(render.find(TextField).length).toEqual(3);
    expect(render.find(TextField).get(0).props.source).toEqual('fieldA');
    expect(render.find(TextField).get(1).props.source).toEqual('fieldB');
    expect(render.find(TextField).get(2).props.source).toEqual('id');
  });
});

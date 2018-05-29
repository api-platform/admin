import Api from '@api-platform/api-doc-parser/lib/Api';
import Field from '@api-platform/api-doc-parser/lib/Field';
import Resource from '@api-platform/api-doc-parser/lib/Resource';
import {TextField} from 'admin-on-rest';
import {shallow} from 'enzyme';
import React from 'react';
import fieldFactory from './fieldFactory';
import List from './List';

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

describe('<List />', () => {
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
      <List
        hasEdit={true}
        hasShow={true}
        options={{
          api,
          fieldFactory: defaultFieldFactory,
          resource,
        }}
      />,
    );

    expect(defaultFieldFactory).toHaveBeenCalledTimes(2);
    expect(render.find(TextField).length).toEqual(3);
    expect(render.find(TextField).get(0).props.source).toEqual('id');
    expect(render.find(TextField).get(1).props.source).toEqual('fieldA');
    expect(render.find(TextField).get(2).props.source).toEqual('fieldB');
  });

  test('without adding ID', () => {
    const defaultFieldFactory = jest.fn(fieldFactory);

    const resource = new Resource(resourceData.name, resourceData.url, {
      ...resourceData,
      listProps: {
        addIdField: false,
      },
    });

    const api = new Api(apiData.entrypoint, {
      ...apiData,
      resources: [resource],
    });

    const render = shallow(
      <List
        hasEdit={true}
        hasShow={true}
        options={{
          api,
          fieldFactory: defaultFieldFactory,
          resource,
        }}
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
      listProps: {
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
      <List
        hasEdit={true}
        hasShow={true}
        options={{
          api,
          fieldFactory: defaultFieldFactory,
          resource,
        }}
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
      listFields: [
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
      <List
        hasEdit={true}
        hasShow={true}
        options={{
          api,
          fieldFactory: defaultFieldFactory,
          resource,
        }}
      />,
    );

    expect(defaultFieldFactory).toHaveBeenCalledTimes(1);
    expect(render.find(TextField).length).toEqual(2);
    expect(render.find(TextField).get(0).props.source).toEqual('id');
    expect(render.find(TextField).get(1).props.source).toEqual('fieldC');
  });
});

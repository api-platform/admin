import Api from '@api-platform/api-doc-parser/lib/Api';
import Field from '@api-platform/api-doc-parser/lib/Field';
import Resource from '@api-platform/api-doc-parser/lib/Resource';
import {ArrayInput, SimpleFormIterator, TextInput} from 'react-admin';
import {shallow} from 'enzyme';
import React from 'react';
import Create from './Create';
import inputFactory from './inputFactory';

const entrypoint = 'http://entrypoint';

const apiData = {
  entrypoint,
};

const resourceData = {
  name: 'user',
  url: `${entrypoint}/users`,
  writableFields: [
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
    new Field('fieldD', {
      id: 'http://schema.org/fieldD',
      range: 'http://www.w3.org/2001/XMLSchema#array',
      reference: null,
      required: true,
    }),
  ],
};

describe('<Create />', () => {
  test('without overrides', () => {
    const defaultInputFactory = jest.fn(inputFactory);

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
      <Create
        options={{
          api,
          inputFactory: defaultInputFactory,
          resource,
        }}
        location={{}}
        match={{}}
        resource=""
      />,
    );

    expect(defaultInputFactory).toHaveBeenCalledTimes(3);
    expect(render.find(ArrayInput).length).toEqual(1);
    expect(render.find(SimpleFormIterator).length).toEqual(1);
    expect(render.find(TextInput).length).toEqual(3);
    expect(render.find(ArrayInput).get(0).props.source).toEqual('fieldD');
    expect(render.find(TextInput).get(0).props.source).toEqual('fieldA');
    expect(render.find(TextInput).get(1).props.source).toEqual('fieldB');
  });

  test('with custom inputFactory', () => {
    const customInputFactory = jest.fn(inputFactory);
    const defaultInputFactory = jest.fn(inputFactory);

    const resource = new Resource(resourceData.name, resourceData.url, {
      ...resourceData,
      createProps: {
        options: {
          inputFactory: customInputFactory,
        },
      },
    });

    const api = new Api(apiData.entrypoint, {
      ...apiData,
      resources: [resource],
    });

    const render = shallow(
      <Create
        options={{
          api,
          inputFactory: defaultInputFactory,
          resource,
        }}
        location={{}}
        match={{}}
        resource=""
      />,
    );

    expect(customInputFactory).toHaveBeenCalledTimes(3);
    expect(defaultInputFactory).toHaveBeenCalledTimes(0);
    expect(render.find(ArrayInput).length).toEqual(1);
    expect(render.find(SimpleFormIterator).length).toEqual(1);
    expect(render.find(TextInput).length).toEqual(3);
    expect(render.find(ArrayInput).get(0).props.source).toEqual('fieldD');
    expect(render.find(TextInput).get(0).props.source).toEqual('fieldA');
    expect(render.find(TextInput).get(1).props.source).toEqual('fieldB');
  });

  test('with custom fields', () => {
    const defaultInputFactory = jest.fn(inputFactory);

    const resource = new Resource(resourceData.name, resourceData.url, {
      ...resourceData,
      createFields: [
        new Field('fieldC', {
          id: 'http://schema.org/fieldC',
          range: 'http://www.w3.org/2001/XMLSchema#string',
          reference: null,
          required: true,
        }),
        new Field('fieldE', {
          id: 'http://schema.org/fieldE',
          range: 'http://www.w3.org/2001/XMLSchema#array',
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
      <Create
        options={{
          api,
          inputFactory: defaultInputFactory,
          resource,
        }}
        location={{}}
        match={{}}
        resource=""
      />,
    );

    expect(defaultInputFactory).toHaveBeenCalledTimes(2);
    expect(render.find(ArrayInput).length).toEqual(1);
    expect(render.find(SimpleFormIterator).length).toEqual(1);
    expect(render.find(TextInput).length).toEqual(2);
    expect(render.find(ArrayInput).get(0).props.source).toEqual('fieldE');
    expect(render.find(TextInput).get(0).props.source).toEqual('fieldC');
  });
});

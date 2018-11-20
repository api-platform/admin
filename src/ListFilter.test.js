import React from 'react';
import Field from '@api-platform/api-doc-parser/lib/Field';
import Resource from '@api-platform/api-doc-parser/lib/Resource';
import {TextInput} from 'react-admin';
import {shallow} from 'enzyme';
import parameterFactory from './parameterFactory';
import ListFilter from './ListFilter';
import Parameter from '@api-platform/api-doc-parser/lib/Parameter';

const entrypoint = 'http://entrypoint';

const resourceData = {
  name: 'user',
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
  parameters: [
    new Parameter('fieldA', '', false, ''),
    new Parameter('order[fieldA]', '', false, ''),
  ],
  url: `${entrypoint}/users`,
};

describe('<ListFilter />', () => {
  test('without overrides', () => {
    const defaultParameterFactory = jest.fn(parameterFactory);

    const resource = new Resource(
      resourceData.name,
      resourceData.url,
      resourceData,
    );

    const {parameters} = resource;

    const render = shallow(
      <ListFilter
        options={{
          parameters,
          parameterFactory: defaultParameterFactory,
        }}
      />,
    );

    expect(defaultParameterFactory).toHaveBeenCalledTimes(2);
    expect(render.find(TextInput).getNodes()).toHaveLength(1);
    expect(render.find(TextInput).get(0).props.source).toEqual('fieldA');
  });
});

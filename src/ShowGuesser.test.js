import React from 'react';
import { TextField } from 'react-admin';
import { shallow } from 'enzyme';
import FieldGuesser from './FieldGuesser';

import { API_FIELDS_DATA } from './__fixtures__/parsedData';
import { IntrospectedShowGuesser } from './ShowGuesser';

jest.mock('./useMercureSubscription');

describe('<ShowGuesser />', () => {
  // FIXME
  test.skip('renders with no children', () => {
    const wrapper = shallow(
      <IntrospectedShowGuesser
        resource="user"
        schema={{ name: 'users', title: 'User' }}
        readableFields={API_FIELDS_DATA}
        id="ShowComponentId"
      />,
    );

    expect(wrapper).toContainReact(
      <FieldGuesser source="fieldA" addLabel={true} />,
    );
    expect(wrapper).toContainReact(
      <FieldGuesser source="fieldB" addLabel={true} />,
    );
    expect(wrapper).toContainReact(
      <FieldGuesser source="deprecatedField" addLabel={true} />,
    );
  });

  test('renders with custom fields', () => {
    const wrapper = shallow(
      <IntrospectedShowGuesser
        resource="user"
        readableFields={API_FIELDS_DATA}
        id="ShowComponentId">
        <TextField source="id" label={'label of id'} />
        <TextField source="title" label={'label of title'} />
        <TextField source="body" label={'label of body'} />
      </IntrospectedShowGuesser>,
    );

    expect(wrapper).toContainReact(
      <TextField source="id" label={'label of id'} />,
    );
    expect(wrapper).toContainReact(
      <TextField source="title" label={'label of title'} />,
    );
    expect(wrapper).toContainReact(
      <TextField source="body" label={'label of body'} />,
    );
  });
});

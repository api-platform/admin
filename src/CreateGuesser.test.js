import React from 'react';
import {TextField} from 'react-admin';
import ShallowRenderer from 'react-test-renderer/shallow';
import {shallow} from 'enzyme';

import {API_INPUT_DATA} from './common-data-test';
import {CreateGuesser} from './CreateGuesser';

describe('<CreateGuesser />', () => {
  let renderer;

  beforeEach(() => {
    renderer = new ShallowRenderer();
  });

  test(`
    renders: <div>Error while reading the API schema</div>
    when: error is set (comes from react-admin.Query)`, () => {
    // renderer.render(<CreateGuesser error="my error" />);
    // const result = renderer.getRenderOutput();

    // expect(result.type).toBe('div');
    // expect(result.props.children).toEqual('Error while reading the API schema');
  });

});

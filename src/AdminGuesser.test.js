import React from 'react';
import ShallowRenderer from 'react-test-renderer/shallow';
import {createStore} from 'redux';
import {Provider} from 'react-redux';
import {render} from './AdminGuesser';
import {resources} from "./__fixtures__";

describe('<AdminGuesser />', () => {
  const renderer = new ShallowRenderer();
  const store = createStore((state = {}) => state);

  test('renders errors', () => {
    const tree = renderer.render(
      <Provider store={store}>
        {render({}, {error: 'Failed to fetch documentation', loading: false})}
      </Provider>,
    );

    expect(tree).toMatchSnapshot();
  });

  test('renders loading', () => {
    const tree = renderer.render(
      <Provider store={store}>{render({}, {loading: true})}</Provider>,
    );

    expect(tree).toMatchSnapshot();
  });

  test('renders without custom resources', () => {
    const tree = renderer.render(
      <Provider store={store}>
        {render({}, {data: {resources}, loading: false})}
      </Provider>,
    );

    expect(tree).toMatchSnapshot();
  });
});

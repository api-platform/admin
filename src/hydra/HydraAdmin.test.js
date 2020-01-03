import React from 'react';
import ShallowRenderer from 'react-test-renderer/shallow';
import {createStore} from 'redux';
import {Provider} from 'react-redux';
import {AdminGuesser} from './HydraAdmin';
import {resources} from '../__fixtures__';

describe('<AdminGuesser />', () => {
  const renderer = new ShallowRenderer();
  const store = createStore((state = {}) => state);

  test('renders errors', () => {
    const tree = renderer.render(
      <Provider store={store}>
        {AdminGuesser({
          error: 'Failed to fetch documentation',
          resources: resources,
          fetching: false,
        })}
      </Provider>,
    );

    expect(tree).toMatchSnapshot();
  });

  test('renders loading', () => {
    const tree = renderer.render(
      <Provider store={store}>{AdminGuesser({fetching: true})}</Provider>,
    );

    expect(tree).toMatchSnapshot();
  });

  test('renders without custom resources', () => {
    const tree = renderer.render(
      <Provider store={store}>
        {AdminGuesser({resources: resources, fetching: false})}
      </Provider>,
    );

    expect(tree).toMatchSnapshot();
  });

  test('renders without data', () => {
    const tree = renderer.render(
      <Provider store={store}>{AdminGuesser({fetching: false})}</Provider>,
    );

    expect(tree).toMatchSnapshot();
  });

  test('renders errors without data', () => {
    const tree = renderer.render(
      <Provider store={store}>
        {AdminGuesser({
          error: 'Failed to fetch documentation',
          fetching: false,
        })}
      </Provider>,
    );

    expect(tree).toMatchSnapshot();
  });
});

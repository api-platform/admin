import React from 'react';
import ReactTestRenderer from 'react-test-renderer/shallow';
import ResourceGuesser from './ResourceGuesser.js';

describe('<ResourceGuesser />', () => {
  const renderer = ReactTestRenderer.createRenderer();

  test('renders with create', () => {
    const CustomCreate = () => null;

    renderer.render(<ResourceGuesser name="dummy" create={CustomCreate} />);

    expect(renderer.getRenderOutput()).toMatchSnapshot();
  });

  test('renders without create', () => {
    renderer.render(<ResourceGuesser name="dummy" />);

    expect(renderer.getRenderOutput()).toMatchSnapshot();
  });

  test('renders with edit', () => {
    const CustomEdit = () => null;

    renderer.render(<ResourceGuesser name="dummy" edit={CustomEdit} />);

    expect(renderer.getRenderOutput()).toMatchSnapshot();
  });

  test('renders without edit', () => {
    renderer.render(<ResourceGuesser name="dummy" />);

    expect(renderer.getRenderOutput()).toMatchSnapshot();
  });

  test('renders with list', () => {
    const CustomList = () => null;

    renderer.render(<ResourceGuesser name="dummy" list={CustomList} />);

    expect(renderer.getRenderOutput()).toMatchSnapshot();
  });

  test('renders without list', () => {
    renderer.render(<ResourceGuesser name="dummy" />);

    expect(renderer.getRenderOutput()).toMatchSnapshot();
  });

  test('renders with show', () => {
    const CustomShow = () => null;

    renderer.render(<ResourceGuesser name="dummy" show={CustomShow} />);

    expect(renderer.getRenderOutput()).toMatchSnapshot();
  });

  test('renders without show', () => {
    renderer.render(<ResourceGuesser name="dummy" />);

    expect(renderer.getRenderOutput()).toMatchSnapshot();
  });
});

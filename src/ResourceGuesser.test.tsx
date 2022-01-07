import React from 'react';
import ResourceGuesser from './ResourceGuesser';
import ShallowRenderer from 'react-test-renderer/shallow';

describe('<ResourceGuesser />', () => {
  const renderer = new ShallowRenderer();

  test('renders with create', () => {
    const CustomCreate = () => null;

    const tree = renderer.render(
      <ResourceGuesser name="dummy" create={CustomCreate} />,
    );

    expect(tree).toMatchSnapshot();
  });

  test('renders without create', () => {
    const tree = renderer.render(<ResourceGuesser name="dummy" />);

    expect(tree).toMatchSnapshot();
  });

  test('renders with edit', () => {
    const CustomEdit = () => null;

    const tree = renderer.render(
      <ResourceGuesser name="dummy" edit={CustomEdit} />,
    );

    expect(tree).toMatchSnapshot();
  });

  test('renders without edit', () => {
    const tree = renderer.render(<ResourceGuesser name="dummy" />);

    expect(tree).toMatchSnapshot();
  });

  test('renders with list', () => {
    const CustomList = () => null;

    const tree = renderer.render(
      <ResourceGuesser name="dummy" list={CustomList} />,
    );

    expect(tree).toMatchSnapshot();
  });

  test('renders without list', () => {
    const tree = renderer.render(<ResourceGuesser name="dummy" />);

    expect(tree).toMatchSnapshot();
  });

  test('renders with show', () => {
    const CustomShow = () => null;

    const tree = renderer.render(
      <ResourceGuesser name="dummy" show={CustomShow} />,
    );

    expect(tree).toMatchSnapshot();
  });

  test('renders without show', () => {
    const tree = renderer.render(<ResourceGuesser name="dummy" />);

    expect(tree).toMatchSnapshot();
  });
});

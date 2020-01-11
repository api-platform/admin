import React from 'react';
import ShallowRenderer from 'react-test-renderer/shallow';
import { AdminResourcesGuesser } from './AdminGuesser';
import resources from './__fixtures__/resources';

describe('<AdminGuesser />', () => {
  const renderer = new ShallowRenderer();

  test('renders errors', () => {
    const tree = renderer.render(
      <AdminResourcesGuesser
        error={new Error('Failed to fetch documentation')}
        resources={resources}
        loading={false}
      />,
    );

    expect(tree).toMatchSnapshot();
  });

  test('renders loading', () => {
    const tree = renderer.render(<AdminResourcesGuesser loading={true} />);

    expect(tree).toMatchSnapshot();
  });

  test('renders without custom resources', () => {
    const tree = renderer.render(
      <AdminResourcesGuesser resources={resources} loading={false} />,
    );

    expect(tree).toMatchSnapshot();
  });

  test('renders without data', () => {
    const tree = renderer.render(<AdminResourcesGuesser loading={false} />);

    expect(tree).toMatchSnapshot();
  });

  test('renders errors without data', () => {
    const tree = renderer.render(
      <AdminResourcesGuesser
        error={new Error('Failed to fetch documentation')}
        loading={false}
      />,
    );

    expect(tree).toMatchSnapshot();
  });
});

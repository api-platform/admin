import React from 'react';
import ShallowRenderer from 'react-test-renderer/shallow';
import { AdminResourcesGuesser } from './AdminGuesser';
import ResourceGuesser from './ResourceGuesser';
import resources from './__fixtures__/resources';

describe('<AdminGuesser />', () => {
  const renderer = new ShallowRenderer();

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

  test('renders with custom resources', () => {
    const tree = renderer.render(
      <AdminResourcesGuesser resources={resources} loading={false}>
        <ResourceGuesser name="custom" />
      </AdminResourcesGuesser>,
    );

    expect(tree).toMatchSnapshot();
  });

  test('renders without data', () => {
    const tree = renderer.render(<AdminResourcesGuesser loading={false} />);

    expect(tree).toMatchSnapshot();
  });
});

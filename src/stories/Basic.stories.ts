import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/test';
import Basic from './Basic';

const meta = {
  title: 'Admin/Basic',
  component: Basic,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Basic>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Admin: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByRole('heading', { name: 'Greetings' });

    await userEvent.click(canvas.getByText('Create'));
    await userEvent.type(canvasElement.querySelector('#name'), 'test');
    await userEvent.click(canvasElement.querySelector('button[type=submit]'));

  },
  args: {
    entrypoint: process.env.ENTRYPOINT,
  },
};

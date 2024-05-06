import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/test';

import Admin from './Admin';

const meta = {
  title: 'Admin/Auth',
  component: Admin,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Admin>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('Sign in');
    await step('Enter email and password', async () => {
      await userEvent.type(canvas.getByLabelText('Username *'), 'john');
      await userEvent.type(canvas.getByLabelText('Password *'), '123');
    });
  },
  args: {
    entrypoint: process.env.ENTRYPOINT,
  },
};

export const Loggedin: Story = {
  play: async ({ canvasElement, step }) => {
    const canvas = within(canvasElement);
    const signIn = await canvas.findByText('Sign in');
    await step('Enter email and password', async () => {
      await userEvent.type(canvas.getByLabelText('Username *'), 'john');
      await userEvent.type(canvas.getByLabelText('Password *'), '123');
    });

    await step('Submit form', async () => {
      await userEvent.click(signIn);
    });

    await canvas.findByText('John Doe');
  },
  args: {
    entrypoint: process.env.ENTRYPOINT,
  },
};

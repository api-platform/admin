import type { Meta, StoryObj } from '@storybook/react';
import { userEvent, within } from '@storybook/test';

import Admin from './Admin';
import authProvider from './basicAuth';

const meta = {
  title: 'Admin/Auth',
  component: Admin,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Admin>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('Sign in');
    const username = await canvas.findByLabelText('Username *');
    await userEvent.type(username, 'john');
    const password = await canvas.findByLabelText('Password *');
    await userEvent.type(password, '123');
  },
  args: {
    entrypoint: process.env.API_URL,
    authProvider,
  },
};

export const Loggedin: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const submit = await canvas.findByText('Sign in');
    const username = await canvas.findByLabelText('Username *');
    await userEvent.type(username, 'john');
    const password = await canvas.findByLabelText('Password *');
    await userEvent.type(password, '123');
    await userEvent.click(submit);
  },
  args: {
    entrypoint: process.env.API_URL,
    authProvider,
  },
};

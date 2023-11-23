import type { Meta, StoryObj } from '@storybook/react';

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

declare const process: {
  env: {
    SIMPLE_ENTRYPOINT: string;
  };
};

export const Admin: Story = {
  args: {
    entrypoint: process.env.SIMPLE_ENTRYPOINT,
  },
};

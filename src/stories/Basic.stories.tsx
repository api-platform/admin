import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { within } from '@storybook/test';
import { HydraAdmin, type HydraAdminProps } from '../hydra';
import { OpenApiAdmin } from '../openapi';

/**
 * # Basic `<HydraAdmin>` component
 * The `<HydraAdmin>` component without any parameter.
 */
const Basic = ({ entrypoint }: BasicProps) => (
  <HydraAdmin entrypoint={entrypoint} />
);

interface BasicProps extends Pick<HydraAdminProps, 'entrypoint'> {}

const meta = {
  title: 'Admin/Basic',
  component: Basic,
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof Basic>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Hydra: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await canvas.findByText('Greetings');
  },
  args: {
    entrypoint: process.env.ENTRYPOINT,
  },
};

export const OpenApi = () => (
  <OpenApiAdmin
    entrypoint={process.env.ENTRYPOINT}
    docEntrypoint={`${process.env.ENTRYPOINT}/docs.jsonopenapi`}
  />
);

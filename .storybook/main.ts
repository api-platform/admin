import type { StorybookConfig } from '@storybook/react-webpack5';

const config: StorybookConfig = {
  stories: ['../src/**/*.mdx', '../src/**/*.stories.@(js|jsx|mjs|ts|tsx)'],
  addons: [
    '@storybook/addon-links',
    '@storybook/addon-essentials',
    '@storybook/addon-onboarding',
    '@storybook/addon-interactions',
  ],
  framework: {
    name: '@storybook/react-webpack5',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  env: (config) => ({
    ...config,
  }),
  async webpackFinal(config, { configType }) {
    config.resolve = {
      ...config.resolve,
      extensionAlias: {
        '.js': ['.ts', '.js', '.tsx'],
      },
    };
    return config;
  },
};

export default config;

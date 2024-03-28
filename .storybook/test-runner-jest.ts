import { getJestConfig, waitForPageReady } from '@storybook/test-runner';

/**
 * Jest configuration for running tests in Storybook.
 */
module.exports = {
  // The default Jest configuration comes from @storybook/test
  ...getJestConfig(),

  /**
   * Add your own overrides below, and make sure
   * to merge testRunnerConfig properties with your own.
   * @see https://jestjs.io/docs/configuration
   */
  testTimeout: 30000,
};

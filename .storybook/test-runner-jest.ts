import { getJestConfig, waitForPageReady } from '@storybook/test-runner';
// The default Jest configuration comes from @storybook/test
module.exports = {
  // The default Jest configuration comes from @storybook/test
  ...getJestConfig(),
  /** Add your own overrides below, and make sure
   *  to merge testRunnerConfig properties with your own
   * @see https://jestjs.io/docs/configuration
   */
  testTimeout: 30000,

  async postVisit(page) {
    await waitForPageReady(page);
  },
};

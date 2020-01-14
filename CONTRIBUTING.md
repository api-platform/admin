# Contributing to API Platform

First of all, thank you for contributing, you're awesome!

To have your code integrated in the API Platform project, there are some rules to follow, but don't panic, it's easy!

## Reporting Bugs

If you happen to find a bug, we kindly request you to report it. However, before submitting it, please:

* Check the [project documentation available online](https://api-platform.com/docs/)

Then, if it appears that it's a real bug, you may report it using GitHub by following these 3 points:

* Check if the bug is not already reported!
* A clear title to resume the issue
* A description of the workflow needed to reproduce the bug

> _NOTE:_ Don't hesitate giving as much information as you can (OS, browser, ...)

## Pull Requests

### Writing a Pull Request

Please base your changes on the `master` branch.

### Installing the Source Version

To install the source version of API Platform Admin in your project and contribute a patch, follow the instructions below.

Create your client that will use `api-platform-admin` (replace `<yourproject>` by your project's name):

```shell
yarn create react-app <yourproject>
cd <yourproject>
yarn add @api-platform/admin
```

Replace `src/App.js` by this one:

```javascript
import React from 'react';
import { HydraAdmin } from '@api-platform/admin';

export default () => <HydraAdmin entrypoint="https://demo.api-platform.com" />; // Replace with your own API entrypoint
```

Install your own version of `@api-platform/admin`:

```shell
cd ..
git clone https://github.com/api-platform/admin.git
```

Link it:

```shell
cd admin
yarn link
cd ../<yourproject>
yarn link "@api-platform/admin"
```

Use the React version of your project to build `@api-platform/admin`:

```shell
cd node_modules/react/
yarn link
cd ../../../admin
yarn link react
```

Start your `api-platform-admin` version:

```shell
yarn install
yarn watch
```

Open a new terminal console with the same path.

Start your client:

```shell
cd ../<yourproject>/
yarn start
```

You can now hack in the cloned repository of `api-platform-admin`.

### Testing Your Changes

Before sending a Pull Request, make sure the tests pass correctly:

```shell
yarn test
```

### Matching Coding Standards

The API Platform Admin project follows coding standards inspired by the [Airbnb JavaScript style guide](https://github.com/airbnb/javascript).
But don't worry, you can fix CS issues automatically using the [ESLint](https://eslint.org/) tool:

```shell
yarn fix
```

And then, add the fixed files to your commit before pushing.
Be sure to add only **your modified files**. If any other file is fixed by CS tools, just revert it before committing.

### Sending a Pull Request

When you send a PR, just make sure that:

* You add valid test cases (Jest).
* Tests are green.
* You make a PR on the related documentation in the [api-platform/docs](https://github.com/api-platform/docs) repository.
* You make the PR on the same branch you based your changes on. If you see commits
that you did not make in your PR, you're doing it wrong.
* Also don't forget to add a comment when you update a PR with a ping to [the maintainers](https://github.com/orgs/api-platform/people), so he/she will get a notification.
* Squash your commits into one commit (see the next chapter).

All Pull Requests must include [this header](.github/PULL_REQUEST_TEMPLATE.md).

## Squash your Commits

If you have 3 commits, start with:

```shell
git rebase -i HEAD~3
```

An editor will be opened with your 3 commits, all prefixed by `pick`.

Replace all `pick` prefixes by `fixup` (or `f`) **except the first commit** of the list.

Save and quit the editor.

After that, all your commits will be squashed into the first one and the commit message will be the first one.

If you would like to rename your commit message, type:

```shell
git commit --amend
```

Now force push to update your PR:

```shell
git push --force-with-lease
```

# Tag a New Version (Contributors Only)

Always execute the tests before releasing a new version:

```shell
yarn build
yarn test
yarn lint
```

To fix linting errors, you can use `yarn fix`.

To release a new version:

```shell
yarn version # this creates a tag and a commit
git push
git push --tags
```

Travis will then publish the version on npm.

# License and Copyright Attribution

When you open a Pull Request to the API Platform project, you agree to license your code under the [MIT license](LICENSE)
and to transfer the copyright on the submitted code to Kévin Dunglas.

Be sure to you have the right to do that (if you are a professional, ask your company)!

If you include code from another project, please mention it in the Pull Request description and credit the original author.

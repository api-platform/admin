# Contributing to API Platform

First of all, thank you for contributing, you're awesome!

To have your code integrated in the API Platform project, there is some rules to follow, but don't panic, it's easy!

## Reporting bugs

If you happen to find a bug, we kindly request you to report it. However, before submitting it, please:

  * Check the [project documentation available online](https://api-platform.com/docs/)

Then, if it appears that it's a real bug, you may report it using Github by following these 3 points:

  * Check if the bug is not already reported!
  * A clear title to resume the issue
  * A description of the workflow needed to reproduce the bug,

> _NOTE:_ Don’t hesitate giving as much information as you can

## Pull requests

### Writing a Pull Request

First of all, you must decide on what branch your changes will be based. If the changes your are going to make are
fully backward-compatible, you should base your changes on the latest stable branch.
Otherwise, you should base your changes on the `master` branch.

### Installing the source version

To install the source version of API Platform Admin in your project and contribute a patch, run the following command:

    # Link the source version of API Platform admin
    $ cd ..
    $ git clone git@github.com:api-platform/admin.git -b the-latest-stable-branch
    $ cd admin
    $ yarn link
    $ cd ../yourpoject
    $ yarn link "@api-platform/admin"
    # Use the React version of your project to build API Platform admin
    $ cd node_modules/react
    $ yarn link
    $ cd ../../../admin
    $ yarn link react
    $ yarn watch

You can now hack in the cloned repository of `api-platform-admin`.

### Testing your changes

Before sending a Pull Request, make sure the tests pass correctly:

```bash
yarn test
```

### Matching coding standards

The API Platform Admin project is inspired by the [Airbnb JavaScript style guide](https://github.com/airbnb/javascript).
But don't worry, you can fix CS issues automatically using [ESLint](https://eslint.org/) tool:

```bash
yarn fix
```

And then, add fixed file to your commit before push.
Be sure to add only **your modified files**. If another files are fixed by cs tools, just revert it before commit.

### Sending a Pull Request

When you send a PR, just make sure that:

* You add valid test cases (Behat and PHPUnit).
* Tests are green.
* You make a PR on the related documentation in the [api-platform/doc](https://github.com/api-platform/doc) repository.
* You make the PR on the same branch you based your changes on. If you see commits
that you did not make in your PR, you're doing it wrong.
* Also don't forget to add a comment when you update a PR with a ping to [the maintainer](https://github.com/orgs/api-platform/people), so he/she will get a notification.
* Squash your commits into one commit. (see the next chapter)

All Pull Requests must include the following header:

```markdown
| Q             | A
| ------------- | ---
| Bug fix?      | yes/no
| New feature?  | yes/no
| BC breaks?    | no
| Deprecations? | no
| Tests pass?   | yes
| Fixed tickets | #1234, #5678
| License       | MIT
| Doc PR        | api-platform/doc#1234
```

## Squash your commits

If you have 3 commits. So start with:

```bash
git rebase -i HEAD~3
```

An editor will be opened with your 3 commits, all prefixed by `pick`.

Replace all `pick` prefixes by `fixup` (or `f`) **except the first commit** of the list.

Save and quit the editor.

After that, all your commits where squashed into the first one and the commit message of the first commit.

If you would like to rename your commit message type:

```bash
git commit --amend
```

Now force push to update your PR:

```bash
git push --force
```

# Tag a new version (contributors only)

Always test before releasing a new one:

```
yarn build
yarn test
yarn lint
```

To fix linting errors, you can use `yarn fix`.

To release a new version:

```bash
yarn version # this creates a tag
git push
git push --tags
```

Travis will then publish the version on npm.

# License and copyright attribution

When you open a Pull Request to the API Platform project, you agree to license your code under the [MIT license](LICENSE)
and to transfer the copyright on the submitted code to Kévin Dunglas.

Be sure to you have the right to do that (if you are a professional, ask your company)!

If you include code from another project, please mention it in the Pull Request description and credit the original author.

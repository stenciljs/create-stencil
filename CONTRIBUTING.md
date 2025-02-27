# Contributing

Thanks for your interest in contributing to create-stencil! :tada:

## Contributing Etiquette

Please see our [Contributor Code of Conduct](https://github.com/stenciljs/.github/blob/main/CODE_OF_CONDUCT.md) for information on our rules of conduct.

## Creating an Issue

* If you have a question about using the CLI or Stencil in general, please ask in the [Stencil Discord server](https://chat.stenciljs.com).

* It is required that you clearly describe the steps necessary to reproduce the issue you are running into. Although we would love to help our users as much as possible, diagnosing issues without clear reproduction steps is extremely time-consuming and simply not sustainable.

* The issue list of this repository is exclusively for bug reports and feature requests. Non-conforming issues will be closed immediately.

* Issues with no clear steps to reproduce will not be triaged. If an issue is labeled with "Awaiting Reply" and receives no further replies from the author of the issue for more than 5 days, it will be closed.

* If you think you have found a bug, or have a new feature idea, please start by making sure it hasn't already been [reported](https://github.com/stenciljs/core/issues?utf8=%E2%9C%93&q=is%3Aissue). You can search through existing issues to see if there is a similar one reported. Include closed issues as it may have been closed with a solution.

* Next, [create a new issue](https://github.com/stenciljs/create-stencil/issues/new?assignees=&labels=&projects=&template=bug_report.yml&title=bug%3A+) that thoroughly explains the problem. Please fill out the populated issue form before submitting the issue.


## Creating a Pull Request

* We appreciate you taking the time to contribute! Before submitting a pull request, we ask that you please [create an issue](#creating-an-issue) that explains the bug or feature request and let us know that you plan on creating a pull request for it. If an issue already exists, please comment on that issue letting us know you would like to submit a pull request for it. This helps us to keep track of the pull request and make sure there isn't duplicated effort.

### Setup

1. Fork the repo.
2. Clone your fork.
3. Make a branch for your change.
4. This project uses [volta](https://volta.sh) to manage its npm and Node versions.
   [Install it](https://docs.volta.sh/guide/getting-started) before proceeding.
   1. There's no need to install a specific version of npm or Node right now, it shall be done automatically for you in
      the next step
5. Run `npm install`

### Making Changes and Running Locally

Next, make changes to the contents of the `src/` file(s) to support your changes.
Changes can be manually tested by compiling & running the project using:
```bash
npm run dev
```

### Commit Message Format

Please see the [Commit Message Format section](https://github.com/stenciljs/core/blob/main/CONTRIBUTING.md#commit-message-format) of the Stencil README.

## License

By contributing your code to the [stenciljs/core](https://github.com/stenciljs/core/blob/main/CONTRIBUTING.md) GitHub Repository, you agree to license your contribution under the MIT license.

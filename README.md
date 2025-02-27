# The create-stencil CLI

create-stencil is a CLI for creating new Stencil projects based on predefined templates, or "starters".
It is the official CLI maintained by the Stencil team, and is recommended for all new projects.

## Prerequisites

The create-stencil CLI requires `npm` version 6 or higher to be installed.
For instructions for installing or upgrading npm, please see the [npm Documentation](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm). 

## Starters

The create-stencil CLI offers the following starters for bootstrapping your project:

- `component` - allows one to spin up a component library containing one or more Stencil components. Best suited for
teams/individuals looking to reuse components across one or more applications. ([Source Code](https://github.com/stenciljs/component-starter))
- `app` - allows one to spin up an application, complete with routing. This is a **community-driven** project,
and is not formally owned by the Stencil team. ([Source Code](https://github.com/stencil-community/stencil-app-starter))
- `ionic-pwa` - allows one to spin up an Ionic PWA, complete with tabs layout and routing. This is a **community-driven** project,
and is not formally owned by the Stencil team. ([Source Code](https://github.com/stencil-community/stencil-ionic-starter))

The CLI can also generate projects using starters that are not officially developed by Ionic or the Stencil Community.
See the documentation for [Command Mode](#command-mode) for additional information on using additional templates.

## Usage

The create-stencil CLI can be run in one of two modes - Interactive Mode or Command Mode.

### Interactive Mode

Interactive Mode allows a user to interactively select options for creating a new Stencil project.
create-stencil can be started in Interactive Mode by running:
```console
$ npm init stencil
```

Running the CLI in Interactive Mode will prompt you to select one of the [available starters](#starters) to use:
```console
$ npm init stencil

✔ Select a starter project.

Starters marked as [community] are developed by the Stencil Community,
rather than Ionic. For more information on the Stencil Community, please see
https://github.com/stencil-community › - Use arrow-keys. Return to submit.
❯   component                Collection of web components that can be used anywhere
    app [community]          Minimal starter for building a Stencil app or website
    ionic-pwa [community]    Ionic PWA starter with tabs layout and routes
```

Followed by a name for your new project:
```console
✔ Project name > my-stencil-library
```

After confirming your selections, your project will be created.
In this example, a new [component library starter](#starters) will have been copied into a newly created `my-stencil-library` directory:
```console
✔ Confirm? … yes
✔ All setup  in 29 ms

  We suggest that you begin by typing:

  $ cd my-stencil-library
  $ npm install
  $ npm start

  You may find the following commands will be helpful:

  $ npm start
    Starts the development server.

  $ npm run build
    Builds your project in production mode.

  $ npm test
    Starts the test runner.


  Further reading:

   - https://github.com/stenciljs/component-starter
   - https://stenciljs.com/docs

  Happy coding! 🎈
```

### Command Mode

Command Mode allows you to create a new Stencil project by specifying all project options upfront.

To run the CLI in Command Mode, a [starter](#starters) and project name must be specified:
```
npm init stencil [starter] [project-name]
```

An example of creating a component starter with the name "my-stencil-library" is shown below:
```
npm init stencil component my-stencil-library
```
In the example above, a new [component library starter](#starters) will have been created in a newly created `my-stencil-library` directory.

#### Custom Templates
In addition to the provided template options, users may choose to use one of their own custom templates hosted on [GitHub.com](https://github.com).

To use a custom starter template, provide the GitHub repository owner and repository name as the starter name, using the format `REPO_OWNER/REPO_NAME`.
For example, to retrieve a template that is owned by 'my-organization' that has the name 'my-stencil-template':
```
npm init stencil my-organization/my-stencil-template my-stencil-library
```
The command above will create a copy of the `my-organization/my-stencil-template` repository, and place it under `my-stencil-library` on disk.

This can be used in conjunction with [Self Hosted GitHub Instances](#stencilselfhostedurl) to use custom starter templates that live on a self-hosted GitHub instance.

### Additional Flags

**Note:** When passing flags to the create-stencil CLI, a double dash ('--') must be placed between `npm init stencil`
and the flag(s) passed to the CLI:
```console
$ npm init stencil -- --help
```

#### `--help`, `-h`

The `--help` flag shows usage examples for the CLI.

#### `--info`

The `--info` will print the current version of the CLI.

### Environment Variables

#### `https_proxy`

If you are behind a proxy, the `https_proxy` environment variable can be set when running the CLI:
```console
$ https_proxy=https://[IP_ADDRESS] npm init stencil
```

Stencil uses [https-proxy-agent](https://github.com/TooTallNate/proxy-agents/tree/main/packages/https-proxy-agent)
under the hood to connect to the specified proxy server.
The value provided for `https_proxy` will be passed directly to the constructor for a new
[`HttpsProxyAgent` instance](https://github.com/TooTallNate/proxy-agents/tree/main/packages/https-proxy-agent#api).

#### `stencil_self_hosted_url`

In some scenarios, teams may find themselves working solely out of a self-hosted GitHub instance.

Users wishing to point the create-stencil CLI at a GitHub instance other than [GitHub](https://github.com) have two options:

1. Set `stencil_self_hosted_url` in your `.npmrc` file, like so:
    ```
    // .npmrc
    stencil_self_hosted_url=https://your_self_hosted_github_repo.com/
    ```

    Using this option, the CLI can be called as such, automatically picking up the value in `stencil_self_hosted_url`:
    ```
    npm init stencil [starter] [project-name]
    ```

2. Set [`stencil_self_hosted_url`](#stencilselfhostedurl) at invocation time:
    ```console
    stencil_self_hosted_url=https://your_self_hosted_github_repo.com/ npm init stencil
    ```
   
    When using this option, `stencil_self_hosted_url` must always be set every time the CLI is called.

When both options are set, the value provided on the command line takes precedence over the value in your `.npmrc` file.

## Citations

Original project was created by William M. Riley:
* [Twitter](https://twitter.com/splitinfinities)
* [Github](https://github.com/splitinfinities)

## Related Links

* The [Stencil Documentation](https://stenciljs.com/) site has more information on using Stencil.
* Check out the [Stencil Discord](https://chat.stenciljs.com/) for help and general Stencil discussion!

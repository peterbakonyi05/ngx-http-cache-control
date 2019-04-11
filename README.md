[![CircleCI](https://circleci.com/gh/peterbakonyi05/ngx-http-cache-control.svg?style=svg)](https://circleci.com/gh/peterbakonyi05/ngx-http-cache-control)


# Angular Http Cache Control Mono Repo
An Angular mono repository to provide HTTP layer caching when making HTTP calls during server-side rendering.

Mono-repo structure is based on [Angular Mono Repo Starter](https://github.com/alan-agius4/ng-mono-repo-starter).

## Packages
- [@ngx-http-cache-control/core](packages/core/README.md)

## Future plans
Check the [TODOs](./TODO.md)

## Contributing

### Getting started

1) Clone the repository
```shell
git clone https://github.com/peterbakonyi05/ngx-http-cache-control <project_name>
```

2) Install dependencies
```shell
cd <project_name>
npm install
```

3) During development
```shell
# suggested and fastest option: running the specs in watch mode
npm t -- --watch
# or build once and try it with your application
npm run build
# or run inceremental builds while trying with your application
npm run watch
```


### NPM Tasks

| Task         | Description                                                                                                                                            |
| ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------|
| aio          | Generates a static documentation of the libraries                                                                                                      |
| bootstrap    | Install packages dependencies and bootstrap the mono repo                                                                                              |
| build        | Build all the packages inside the mono repo                                                                                                            |
| watch        | Build all the packages inside the mono repo and perform an incremental build when a file changes (NB: it's recommanded that you first perform a build) |
| build-tools  | Build the tools script that are used for building the mono repo                                                                                        |
| clean        | Clean up packages `node_modules` and `dist` folders                                                                                                    |
| test         | Run unit and integration tests                                                                                                                         |
| test-debug   | Run unit and integration tests in debug mode                                                                                                           |
| test-tdd     | Run unit and integration tests in watch mode                                                                                                           |                   

### Using the debugger in VS Code
This project comes pre-configured `launch.json`. All you need to do is hit `F5` in `VS Code` while a `.spec.ts` file is opened and get debugging!

### When creating a PR
Please follow [Angular's commit guidelines](https://github.com/angular/angular/blob/master/CONTRIBUTING.md#commit)

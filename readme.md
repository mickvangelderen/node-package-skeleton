NPS_DESCRIPTION

# Documentation

A link will be generated here.

# Contributing

Here is some information in case you would like to contribute to this project.

## Organization

The source code for this package lives in the root of the repository. The package is [built](scripts/build-release.js) to the `release/` directory which is ignored by git. The `package.json` along with some other files are also built to the `release/` directory. This architecture allows us to have code at the root of the repository even if we are transpiling it. Having code at the root means we can include it like so

```js
import aBitOfFunctionality from 'my-package/aBitOfFunctionality'

// versus

import aBitOfFunctionality from 'my-package/lib/aBitOfFunctionality'
```

## Cloning

```bash
git clone <repo_url> <repo_folder>
cd <repo_folder>
npm install
npm run setup
```

## Publishing

To publish a new version of this package you need to update its version, build it and publish it. This procedure is usually done with the following commands.

```bash
npm version (major|minor|patch)
cd release/
npm publish
```

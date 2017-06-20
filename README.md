# API Platform Admin

API Platform Admin is a tool to automatically create a fancy (Material Design) and fully-featured administration interface
for any API supporting [the Hydra Core Vocabulary](http://www.hydra-cg.com/), including but not limited to all APIs created
using [the API Platform framework](https://api-platform.com).

The generated administration is a 100% standalone Single-Page-Application with no coupling to the server part, according
to the API-first paradigm.

API Platform Admin parses the Hydra documentation then uses the awesome [Admin On Rest](https://marmelab.com/admin-on-rest/)
library (and [React](https://facebook.github.io/react/)) to expose a nice, responsive, management interface (Create-Retrieve-Update-Delete)
for all available resources.

You can also customize all screens by using Admin On Rest components and even raw JavaScript/React code.

## Features

* Automatically generate an admin interface for all the resources of the API thanks to hypermedia features of Hydra
* Generate list, create, show, edit screens as well as a delete button
* Generate suitable inputs and fields according to the API doc (e.g. number HTML input for numbers, checkbox for booleans, selectbox for relationships...)
* Generate suitable inputs and fields according to Schema.org types if available (e.g. email field for http://schema.org/email)
* Handle relationships
* Pagination support
* Automatically validate if a field is mandatory client-side according to the API description
* Send proper HTTP requests to the API and decode them using Hydra and JSON-LD formats
* Nicely display server-side errors (e.g. advanced validation)
* **100% customizable**

TODO: Parse and add filters

## Getting Started

Install the skeleton and the library:

Start by installing [the Yarn package manager](https://yarnpkg.com/) ([NPM](https://www.npmjs.com/) is also supported) and
the [Create React App](https://github.com/facebookincubator/create-react-app) tool.

Then, create a new React application for your admin:

    $ create-react-app my-admin

Now, add install `api-platform-admin` library in your newly created project:

    $ yarn add api-platform-admin

Finally, edit the `src/App.js` file like the following:

```javascript
import React, { Component } from 'react';
import { HydraAdmin } from 'api-platform-admin';

class App extends Component {
  render() {
    return <HydraAdmin entrypoint="https://demo.api-platform.com"/> // Replace with your own API entrypoint
  }
}

export default App;
```

Your new administration interface is ready! Type `yarn start` to try it!

Note: if you don't want to hardcode the API URL, you can [use an environment variable](https://github.com/facebookincubator/create-react-app/blob/master/packages/react-scripts/template/README.md#adding-custom-environment-variables).

## Contribute a Patch

To install the source version of API Platform Admin in your project and contribute a patch, run the following command:

    # Link the source version of API Platform admin
    $ cd ..
    $ git clone git@github.com:api-platform/admin.git
    $ cd admin
    $ yarn link
    $ cd ../yourpoject
    $ yarn link api-platform-admin
    # Use the React version of your project to build API Platform admin
    $ cd node_modules/react
    $ yarn link
    $ cd ../../../admin
    $ yarn link react
    $ yarn watch

You can now hack in the cloned repository of `api-platform-admin`. When you're done, be sure to run the following commands
before opening your Pull Request:

    $ yarn test
    $ yarn lint

## Credits

Created by [Kévin Dunglas](https://dunglas.fr). Sponsored by [Les-Tilleuls.coop](https://les-tilleuls.coop).
Commercial support available upon request.

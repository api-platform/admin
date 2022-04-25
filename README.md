# API Platform Admin

[![GitHub Actions](https://github.com/api-platform/admin/workflows/CI/badge.svg?branch=main)](https://github.com/api-platform/admin/actions?query=workflow%3ACI+branch%3Amain)
[![npm version](https://badge.fury.io/js/%40api-platform%2Fadmin.svg)](https://badge.fury.io/js/%40api-platform%2Fadmin)

API Platform Admin is a tool to automatically create a beautiful (Material Design) and fully-featured administration interface
for any API supporting [the Hydra Core Vocabulary](http://www.hydra-cg.com/) or exposing an [OpenAPI documentation](https://www.openapis.org/),
including but not limited to all APIs created using [the API Platform framework](https://api-platform.com).

![Demo of API Platform Admin in action](https://api-platform.com/97cd2738071d63989db0bbcb6ba85a25/admin-demo.gif)

The generated administration is a 100% standalone Single-Page-Application with no coupling to the server part, according
to the API-first paradigm.

API Platform Admin parses Hydra or OpenAPI documentations, then uses the awesome [React-admin](https://marmelab.com/react-admin/)
library (and [React](https://facebook.github.io/react/)) to expose a nice, responsive, management interface (Create-Retrieve-Update-Delete)
for all available resources.

You can also customize all screens by using React-admin components and even raw JavaScript/React code.

## Demo

[Click here](https://demo.api-platform.com/admin) to test API Platform Admin in live.

The source code of the demo is available [in this repository](https://github.com/api-platform/demo).

## Installation

    yarn add @api-platform/admin

## Usage

```javascript
import React from 'react';
import ReactDOM from 'react-dom';
import { HydraAdmin, OpenApiAdmin } from '@api-platform/admin';

// To use Hydra:
const Admin = () => <HydraAdmin entrypoint="https://demo.api-platform.com" />; // Replace with your own API entrypoint
// To use OpenAPI (with a very simple REST data provider):
const Admin = () => <OpenApiAdmin
  docEntrypoint="https://demo.api-platform.com/docs.json" // Replace with your own OpenAPI documentation entrypoint
  entrypoint="https://demo.api-platform.com" // Replace with your own API entrypoint
/>;

ReactDOM.render(<Admin />, document.getElementById('root'));
```

Or alternatively:

```javascript
import React from 'react';
import ReactDOM from 'react-dom';
import {
  AdminGuesser,
  hydraDataProvider,
  hydraSchemaAnalyzer,
  openApiDataProvider,
  openApiSchemaAnalyzer
} from '@api-platform/admin';
import simpleRestProvider from 'ra-data-simple-rest';

// Use your custom data provider or resource schema analyzer
// Hydra:
const dataProvider = hydraDataProvider({ entrypoint: 'https://demo.api-platform.com' });
const schemaAnalyzer = hydraSchemaAnalyzer();
// OpenAPI:
const dataProvider = openApiDataProvider({
  // Use any data provider you like
  dataProvider: simpleRestProvider('https://demo.api-platform.com'),
  entrypoint: 'https://demo.api-platform.com',
  docEntrypoint: 'https://demo.api-platform.com/docs.json',
});
const schemaAnalyzer = openApiSchemaAnalyzer();

const Admin = () => (
  <AdminGuesser
    dataProvider={dataProvider}
    schemaAnalyzer={schemaAnalyzer}
  />
);

ReactDOM.render(<Admin />, document.getElementById('root'));
```

## Features

* Automatically generates an admin interface for all the resources of the API thanks to the hypermedia features of Hydra or to the OpenAPI documentation
* Generates 'list', 'create', 'show', and 'edit' screens, as well as a delete button
* Generates suitable inputs and fields according to the API doc (e.g. number HTML input for numbers, checkbox for booleans, selectbox for relationships...)
* Generates suitable inputs and fields according to Schema.org types if available (e.g. email field for `http://schema.org/email`)
* Handles relationships
* Supports pagination
* Supports filters and ordering
* Automatically validates whether a field is mandatory client-side according to the API description
* Sends proper HTTP requests to the API and decodes them using Hydra and JSON-LD formats if available
* Nicely displays server-side errors (e.g. advanced validation)
* Supports real-time updates with [Mercure](https://mercure.rocks)
* All the [features provided by React-admin](https://marmelab.com/react-admin/Tutorial.html) can also be used
* **100% customizable**

## Documentation

The documentation of API Platform Admin can be browsed [on the official website](https://api-platform.com/docs/admin/).

Check also the documentation of React-admin [on their official website](https://marmelab.com/react-admin/Tutorial.html).

## Credits

Created by [Kévin Dunglas](https://dunglas.fr). Sponsored by [Les-Tilleuls.coop](https://les-tilleuls.coop).
Commercial support available upon request.

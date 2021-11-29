# API Platform Admin

[![Build Status](https://travis-ci.org/api-platform/admin.svg?branch=master)](https://travis-ci.org/api-platform/admin)
[![npm version](https://badge.fury.io/js/%40api-platform%2Fadmin.svg)](https://badge.fury.io/js/%40api-platform%2Fadmin)

API Platform Admin is a tool to automatically create a beautiful (Material Design) and fully-featured administration interface
for any API supporting [the Hydra Core Vocabulary](http://www.hydra-cg.com/), including but not limited to all APIs created
using [the API Platform framework](https://api-platform.com).

![Demo of API Platform Admin in action](https://api-platform.com/97cd2738071d63989db0bbcb6ba85a25/admin-demo.gif)

The generated administration is a 100% standalone Single-Page-Application with no coupling to the server part, according
to the API-first paradigm.

API Platform Admin parses Hydra or OpenAPI documentations, then uses the awesome [React-admin](https://marmelab.com/react-admin/)
library (and [React](https://facebook.github.io/react/)) to expose a nice, responsive, management interface (Create-Retrieve-Update-Delete)
for all available resources.

You can also customize all screens by using React-admin components and even raw JavaScript/React code.

## Installation

    yarn add @api-platform/admin

## Usage

```javascript
import React from 'react';
import ReactDOM from 'react-dom';
import { HydraAdmin } from '@api-platform/admin';

const Admin = () => <HydraAdmin entrypoint="https://demo.api-platform.com" />; // Replace with your own API entrypoint

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
} from '@api-platform/admin';

const Admin = () => (
  <AdminGuesser
    // Use your custom data provider or resource schema analyzer
    dataProvider={hydraDataProvider({ entrypoint: 'https://demo.api-platform.com' })}
    schemaAnalyzer={hydraSchemaAnalyzer()}
  />
);

ReactDOM.render(<Admin />, document.getElementById('root'));
```

## Features

* Automatically generates an admin interface for all the resources of the API thanks to hypermedia features of Hydra
* Generates 'list', 'create', 'show', and 'edit' screens, as well as a delete button
* Generates suitable inputs and fields according to the API doc (e.g. number HTML input for numbers, checkbox for booleans, selectbox for relationships...)
* Generates suitable inputs and fields according to Schema.org types if available (e.g. email field for `http://schema.org/email`)
* Handles relationships
* Supports pagination
* Supports filters and ordering
* Automatically validates whether a field is mandatory client-side according to the API description
* Sends proper HTTP requests to the API and decodes them using Hydra and JSON-LD formats
* Nicely displays server-side errors (e.g. advanced validation)
* Supports real-time updates with [Mercure](https://mercure.rocks)
* **100% customizable**

## Documentation

The documentation of API Platform Admin can be browsed [on the official website](https://api-platform.com/docs/admin/).

## Credits

Created by [Kévin Dunglas](https://dunglas.fr). Sponsored by [Les-Tilleuls.coop](https://les-tilleuls.coop).
Commercial support available upon request.

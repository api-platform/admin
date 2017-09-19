# API Platform Admin

[![Build Status](https://travis-ci.org/api-platform/admin.svg?branch=master)](https://travis-ci.org/api-platform/admin)
[![npm version](https://badge.fury.io/js/%40api-platform%2Fadmin.svg)](https://badge.fury.io/js/%40api-platform%2Fadmin)
[![MIT Licence](https://badges.frapsoft.com/os/mit/mit.svg?v=103)](https://opensource.org/licenses/mit-license.php)

API Platform Admin is a tool to automatically create a fancy (Material Design) and fully-featured administration interface
for any API supporting [the Hydra Core Vocabulary](http://www.hydra-cg.com/), including but not limited to all APIs created
using [the API Platform framework](https://api-platform.com).

The generated administration is a 100% standalone Single-Page-Application with no coupling to the server part, according
to the API-first paradigm.

API Platform Admin parses the Hydra documentation then uses the awesome [Admin On Rest](https://marmelab.com/admin-on-rest/)
library (and [React](https://facebook.github.io/react/)) to expose a nice, responsive, management interface (Create-Retrieve-Update-Delete)
for all available resources.

You can also customize all screens by using Admin On Rest components and even raw JavaScript/React code.

## Installation

    yarn add @api-platform/admin

## Usage

```javascript
import React, { Component } from 'react';
import { HydraAdmin } from '@api-platform/admin';

class App extends Component {
  render() {
    return <HydraAdmin entrypoint="https://demo.api-platform.com"/> // Replace with your own API entrypoint
  }
}

export default App;
```

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

## Documentation

The documentation of API Platform Admin can be browsed [on the official website](https://api-platform.com/docs/admin/).

## Credits

Created by [Kévin Dunglas](https://dunglas.fr). Sponsored by [Les-Tilleuls.coop](https://les-tilleuls.coop).
Commercial support available upon request.

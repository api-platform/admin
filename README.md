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
    
**Warning:** Admin On Rest and Material UI [aren't compatible with React 15.6 yet](https://github.com/marmelab/admin-on-rest/issues/802). During the meantime, you need to downgrade React to v15.5. Apply the following patch to `packages.json` then run `yarn upgrade` to downgrade:

```patch
-    "react": "^15.6.1",
+    "react": "~15.5.4",
-    "react-dom": "^15.6.1",
+    "react-dom": "~15.5.4",
```

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

## Customize the Admin

The API Platform's admin parses the Hydra documentation exposed by the API and transforms it to an object data structure. This data structure can be customized to add, remove or customize resources and properties. To do so, we can leverage the `AdminBuilder` component provided by the library. It's a lower level component than the `HydraAdmin` one we used in the previous example. It allows to access to the object storing the structure of admin's screens.

### Use Custom Components

In the following example, we change components used for the `description` property of the `books` resource to ones accepting HTML (respectively `RichTextField` that renders HTML markup and `RichTextInput`, a WYSWYG editor).
(To use the `RichTextInput`, the `aor-rich-text-input` package is must be installed: `yarn add aor-rich-text-input`).

```javascript
import React from 'react';
import { RichTextField } from 'admin-on-rest';
import RichTextInput from 'aor-rich-text-input';
import HydraAdmin from 'api-platform-admin/lib/hydra/HydraAdmin';
import parseHydraDocumentation from 'api-doc-parser/lib/hydra/parseHydraDocumentation';

const entrypoint = 'https://demo.api-platform.com';

const apiDocumentationParser = entrypoint => parseHydraDocumentation(entrypoint)
  .then(api => {
    api.resources.map(resource => {
      const books = api.resources.find(r => 'books' === r.name);
      books.fields.find(f => 'description' === f.name).fieldComponent = <RichTextField source="description" key="description"/>;
      books.fields.find(f => 'description' === f.name).inputComponent = <RichTextInput source="description" key="description"/>;

      return resource;
    });

    return api;
  })
;

export default (props) => (
  <HydraAdmin apiDocumentationParser={apiDocumentationParser} entrypoint={entrypoint}/>
);
```

The `fieldComponent` property of the `Field` class allows to set the component used to render a property in list and show screens.
The `inputComponent` property allows to set the component to use to render the input used in create and edit screens.

Any [field](https://marmelab.com/admin-on-rest/Fields.html) or [input](https://marmelab.com/admin-on-rest/Inputs.html) provided by the Admin On Rest library can be used.

To go further, take a look to the "[Including admin-on-rest on another React app](https://marmelab.com/admin-on-rest/CustomApp.html)" documentation page of Admin On Rest to learn how to use directly redux, react-router, and redux-saga along with components provided by this library.

### Manage Files and Images

In the following example, we will:
* find every [ImageObject](http://schema.org/ImageObject) resources. For each [contentUrl](http://schema.org/contentUrl) fields, we will use [ImageField](https://marmelab.com/admin-on-rest/Fields.html#imagefield) as `field` and [ImageInput](https://marmelab.com/admin-on-rest/Inputs.html#imageinput) as `input`.
* [ImageInput](https://marmelab.com/admin-on-rest/Inputs.html#imageinput) will return a [File](https://developer.mozilla.org/en/docs/Web/API/File) instance. In this example, we will send a multi-part form data to a special action (`https://demo.api-platform.com/images/upload`). The action will return the ID of the uploaded image. We will "replace" the [File](https://developer.mozilla.org/en/docs/Web/API/File) instance by the ID in `normalizeData`.
* As `contentUrl` fields will return a string, we have to convert Hydra data to AOR data. This action will be done by `denormalizeData`.

```javascript
import { FunctionField, ImageField, ImageInput } from 'admin-on-rest/lib/mui';
import React from 'react';
import HydraAdmin from 'api-platform-admin/lib/hydra/HydraAdmin';
import parseHydraDocumentation from 'api-doc-parser/lib/hydra/parseHydraDocumentation';

const entrypoint = 'https://demo.api-platform.com';

const apiDocumentationParser = entrypoint => parseHydraDocumentation(entrypoint)
  .then(api => {
    api.resources.map(resource => {
      if ('http://schema.org/ImageObject' === resource.id) {
        resource.fields.map(field => {
          if ('http://schema.org/contentUrl' === field.id) {
            field.denormalizeData = value => ({
              src: value
            });

            field.fieldComponent = (
              <FunctionField
                key={field.name}
                render={
                  record => (
                    <ImageField key={field.name} record={record} source={`${field.name}.src`}/>
                  )
                }
                source={field.name}
              />
            );

            field.inputComponent = (
              <ImageInput accept="image/*" key={field.name} multiple={false} source={field.name}>
                <ImageField source="src"/>
              </ImageInput>
            );

            field.normalizeData = value => {
              if (value[0] && value[0].rawFile instanceof File) {
                const body = new FormData();
                body.append('file', value[0].rawFile);

                return fetch(`${entrypoint}/images/upload`, { body, method: 'POST' })
                  .then(response => response.json());
              }

              return value.src;
            };
          }

          return field;
        });
      }

      return resource;
    });

    return api;
  })
;

export default (props) => (
  <HydraAdmin apiDocumentationParser={apiDocumentationParser} entrypoint={entrypoint}/>
);
```

__Note__: In this example, we choose to send the file via a multi-part form data, but you are totally free to use another solution (like `base64`). But keep in mind that multi-part form data is the most efficient solution.

## Add Authentication Support

Authentication can easily be handled when using the API Platform's admin library.
In the following section, we will assume [the API is secured using JWT](https://api-platform.com/docs/core/jwt), but the
process is similar for other authentication mechanisms.

The first step is to create a client to handle the authentication process:

```javascript
import { AUTH_LOGIN, AUTH_LOGOUT, AUTH_ERROR } from 'admin-on-rest';

const entrypoint = 'https://demo.api-platform.com'; // Change this by your own entrypoint

export default (type, params) => {
  switch (type) {
    case AUTH_LOGIN:
      const { username, password } = params;
      const request = new Request(`${entrypoint}/login_check`, {
        method: 'POST',
        body: JSON.stringify({ email: username, password }),
        headers: new Headers({ 'Content-Type': 'application/json' }),
      });

      return fetch(request)
        .then(response => {
          if (response.status < 200 || response.status >= 300) throw new Error(response.statusText);

          return response.json();
        })
        .then(({ token }) => {
          localStorage.setItem('token', token); // The JWT token is stored in the browser's local storage
        });

    case AUTH_LOGOUT:
      localStorage.removeItem('token');
      break;

    case AUTH_ERROR:
      if (401 === params.status || 403 === params.status) {
        localStorage.removeItem('token');

        return Promise.reject();
      }
      break;
      
      default:
          return Promise.resolve();
  }
}
```

Then, configure the `Admin` component to use the authentication client we just created:

```javascript
import React, { Component } from 'react';
import { HydraAdmin, hydraClient, fetchHydra } from 'api-platform-admin';
import authClient from './authClient';

const entrypoint = 'https://demo.api-platform.com';

const fetchWithAuth = (url, options = {}) => {
  if (!options.headers) options.headers = new Headers({ Accept: 'application/ld+json' });

  options.headers.set('Authorization', `Bearer ${localStorage.getItem('token')}`);
  return fetchHydra(url, options);
};

class Admin extends Component {
  render() {
    return <HydraAdmin restClient={hydraClient(entrypoint, fetchWithAuth)} authClient={authClient}/>
  }
}

export default Admin;
```

Refer to [the chapter dedicated to authentication in the Admin On Rest documentation](https://marmelab.com/admin-on-rest/Authentication.html)
for more information.

## Handle Relations to Collections

Currently, API Platform Admin doesn't handle `to-many` relations. The core library [is being patched](https://github.com/api-platform/core/pull/1189)
to document relations to collections through OWL.

During the meantime, it is possible to configure manually API Platform to handle relations to collections.

We will create the admin for an API exposing `Person` and `Book` resources linked with a `many-to-many`
relation between them (trough the `authors` property).

This API can be created using the following PHP code:

```php
<?php

namespace App\Entity;

use ApiPlatform\Core\Annotation\ApiResource;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ApiResource
 * @ORM\Entity
 */
class Person
{
    /**
     * @ORM\Column(type="integer")
     * @ORM\GeneratedValue
     * @ORM\Id
     */
    public $id;

    /**
     * @ORM\Column
     */
    public $name;
}
```

```php
<?php

namespace App\Entity;

use ApiPlatform\Core\Annotation\ApiResource;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\ORM\Mapping as ORM;

/**
 * @ApiResource
 * @ORM\Entity
 */
class Book
{
    /**
     * @ORM\Column(type="integer")
     * @ORM\GeneratedValue
     * @ORM\Id
     */
    public $id;

    /**
     * @ORM\ManyToMany(targetEntity="Person")
     */
    public $authors;

    public function __construct()
    {
        $this->authors = new ArrayCollection();
    }
}
```

Let's customize the components used for the `authors` property:

```javascript
import React, { Component } from 'react';
import { ReferenceArrayField, SingleFieldList, ChipField, ReferenceArrayInput, SelectArrayInput } from 'admin-on-rest';
import { AdminBuilder, hydraClient } from 'api-platform-admin';
import parseHydraDocumentation from 'api-doc-parser/lib/hydra/parseHydraDocumentation';

const entrypoint = 'https://demo.api-platform.com';

class Admin extends Component {
  state = {api: null};

  componentDidMount() {
    parseHydraDocumentation(entrypoint).then(api => {
        const r = api.resources;

        const books = r.find(r => 'books' === r.name);

        // Set the field in the list and the show views
        books.readableFields.find(f => 'authors' === f.name).fieldComponent =
          <ReferenceArrayField label="Authors" reference="people" source="authors" key="authors">
            <SingleFieldList>
              <ChipField source="name" key="name"/>
            </SingleFieldList>
          </ReferenceArrayField>
        ;

        // Set the input in the edit and create views
        books.writableFields.find(f => 'authors' === f.name).inputComponent =
          <ReferenceArrayInput label="Authors" reference="people" source="authors" key="authors">
            <SelectArrayInput optionText="name"/>
          </ReferenceArrayInput>
        ;

        this.setState({api: api});
      }
    )
  }

  render() {
    if (null === this.state.api) return <div>Loading...</div>;

    return <AdminBuilder api={this.state.api} restClient={hydraClient(entrypoint)}/>
  }
}

export default Admin;
```

The admin now properly handle this `to-many` relation!

### Using an Autocomplete Input for Relations

We'll do a last improvement to our admin: transform the relation selector we just created to use autocompletion.

Start by adding a "partial search" filter on the `name` property of the `Book` resource class.

```yaml
# etc/packages/api_platform.yaml

services:
    person.search_filter:
        parent: 'api_platform.doctrine.orm.search_filter'
        arguments: [ { name: 'partial' } ]
        tags: ['api_platform.filter']
```

```php

// ...

/**
 * @ApiResource(attributes={"filters"={"person.search_filter"}})
 * @ORM\Entity
 */
class Person
{
// ...
```

Then edit the configuration of API Platform Admin to pass a `filterToQuery` property to the `ReferenceArrayInput` component.

```javascript
    componentDidMount() {

        // ...

        // Set the input in the edit and create views
        books.writableFields.find(f => 'authors' === f.name).inputComponent =
          <ReferenceArrayInput label="Authors" reference="people" source="authors" key="authors" filterToQuery={searchText => ({ name: searchText })}>
            <SelectArrayInput optionText="name"/>
          </ReferenceArrayInput>
        ;

        // ...
    }
```

The autocomplete field should now work properly!

## Use a Custom Validation Function or Inject Custom Props

You can use `fieldProps` and `inputProps` to respectively inject custom properties to fields and inputs generated by API
Platform Admin. This is particularly useful to add custom validation rules:

```javascript
import React, { Component } from 'react';
import { AdminBuilder, hydraClient } from 'api-platform-admin';
import parseHydraDocumentation from 'api-doc-parser/lib/hydra/parseHydraDocumentation';

const entrypoint = 'https://demo.api-platform.com';

class App extends Component {
  state = {api: null};

  componentDidMount() {
    parseHydraDocumentation(entrypoint).then(api => {
        const books = api.resources.find(r => 'books' === r.name);

        books.writableFields.find(f => 'description' === f.name).inputProps = {
            validate: value => value.length >= 30 ? undefined : 'Minimum length: 30';
        };

        this.setState({api: api});
      }
    )
  }

  render() {
    if (null === this.state.api) return <div>Loading...</div>;

    return <AdminBuilder api={this.state.api} restClient={hydraClient(entrypoint)}/>
  }
}

export default App;
```

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

If you get errors related to coding standards, run `yarn fix` to fix them automatically.

## Credits

Created by [Kévin Dunglas](https://dunglas.fr). Sponsored by [Les-Tilleuls.coop](https://les-tilleuls.coop).
Commercial support available upon request.

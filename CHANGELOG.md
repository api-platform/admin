# Changelog

## 4.0.0

* Compatibility with react-admin v5

## 3.4.5

* Fix validation errors shown as "Server communication error" when creating an entity

## 3.4.4

* Enum support in field guesser
* Fix random error message about apiSchema being null

## 3.4.3

* Fix inconsistencies between dark and light theme

## 3.4.2

* Format identifier values on save (needed when not modified in the form)

## 3.4.1

* Fix empty array in form would trigger a file upload

## 3.4.0

* Add enum input guesser
* Handle multiple file upload
* Allow to use tabbed components in guessers
* Use native react-admin `sanitizeEmptyValues`

## 3.3.8

* Fix reference input validation

## 3.3.7

* Fix missing fully-specified imports for @mui

## 3.3.6

* Build only ESM

## 3.3.5

* Fix operations registration in resource guesser

## 3.3.4

* Remove type module from package.json

## 3.3.3

* Fix getting the field type for https://schema.org

## 3.3.2

* Fix displaying name of relation in place of iri not working for https://schema.org/name

## 3.3.1

* A relative entrypoint can be used
* Improve performance

## 3.3.0

* Add `sanitizeEmptyValues` prop (default `true`) to `CreateGuesser` and `EditGuesser`
* Add `sanitizeEmptyValue` prop (default `true`) to `InputGuesser`
* Fix `transform` prop in `CreateGuesser` and `EditGuesser`

## 3.2.0

* Take the operations into account (list, create, edit, delete)

## 3.1.1

* Mercure: add back the possibility to use a boolean

## 3.1.0

* Add full OpenAPI support (introduce `OpenApiAdmin`)
* Make sure i18n provider and theme are passed down to `AdminGuesser`

## 3.0.2

* Introduce `useDisplayOverrideCode` hook to avoid displaying the code message if the guesser component is rendered multiple times

## 3.0.1

* Make sure columns can be sorted when there is an order filter in `ListGuesser`

## 3.0.0

* Compatibility with react-admin 4 (see UPGRADE.md)
* Add a light/dark theme switcher by default
* Improve the error page with more information to get help
* Improve parsing and formatting of embedded relations
* Add a new `useIntrospect` hook (calling the actual introspection request, use `useIntrospection` to ask for a new introspection)
* Partial pagination support is back (native to react-admin)
* Embedded support is enabled by default

## 2.8.4

* Hydra: manage empty response correctly

## 2.8.3

* Hydra: total was overridden by partial pagination

## 2.8.2

* Make sure i18n provider is passed down to `AdminGuesser`

## 2.8.1

* TypeScript: make some props partial in HydraAdmin and AdminGuesser
* Hydra: use right URL for getManyReference

## 2.8.0

* Migrate codebase to TypeScript (export CommonJS module and ECMAScript module)
* Correctly parse the `id` input in `InputGuesser`
* Hydra: use pagination when fetching data with a search id filter (getMany)
* Mercure: close event source connection when unsubscribing

## 2.7.1

* Extract the Mercure hub from response headers

## 2.7.0

* Mercure support
* Hydra: add possibility to disable caching
* Make sure a property's value is not null before checking if there is a `toJSON` property in a form data value

## 2.6.7

* Always use an array for `inputChildren` in guessers

## 2.6.6

* Do not use modern operators

## 2.6.5

* Accept `extraInformation` in data passed to data provider. Use a `hasFileField` field to force multipart encoding.
* `CreateGuesser` and `EditGuesser` add the `hasFileField` field to `extraInformation` if a child is a `File`

## 2.6.4

* Call `toJSON` instead of `JSON.stringify` when there is a `toJSON` property in a form data value

## 2.6.3

* Use `JSON.stringify` when there is a `toJSON` property in a form data value

## 2.6.2

* Downgrade history
* Remove final-form-submit-errors

## 2.6.1

* Bump dependencies (history, jsonld)

## 2.6.0

* Submission errors per field
* Add missing props for `SimpleForm` and `Datagrid` in guessers
* Improve react-admin compatibility
* Hydra: return id when deleting in the data provider

## 2.5.8

* Fix `customSagas` prop type in `AdminGuesser`
* Pause validation when the Final Form field is registered in `InputGuesser`

## 2.5.7

* Add `rowClick` prop in `ListGuesser`
* Do not display user menu if there is no auth provider
* Do not use guessers in `ResourceGuesser` if `create`, `edit`, `show`, `list` props have a falsy value
* Add ESLint hook rules

## 2.5.6

* Add sort for nested properties in ListGuesser

## 2.5.5

* Hydra: use `fetchJsonLd` when expanding an error (to use authorization header)

## 2.5.4

* Fix sent `FormData` when a value is an object or an array (use JSON)

## 2.5.3

* Fix `ResourceGuesser` propTypes

## 2.5.2

* Bump dependencies (`@api-platform/api-doc-parser` to 0.11)

## 2.5.1

* Call `logoutIfAccessDenied` if the `schemaAnalyzer` throws an error (to logout in case of an unauthorized access)

## 2.5.0

* Hydra: manage file upload (use `FormData` instead of JSON)

## 2.4.3

* Humanize `ReferenceInput` and `ReferenceArrayInput` label in `InputGuesser`

## 2.4.2

* Introspection should be done before loading

## 2.4.1

* Set loading when introspecting with `useIntrospection`
* Add React 17 as peer dependency

## 2.4.0

* Add `useIntrospection` hook in order to ask for a new introspection if needed
* Hydra: `apiSchema` should not be cached if there are no resources

## 2.3.0

* Add custom `searchParams` for the Hydra data provider methods

## 2.2.6

* Define history only in a browser context
* Add missing propTypes
* Fix `loading` props usage in `AdminUI`

## 2.2.5

* Remove unuseful optional chaining

## 2.2.4

* Fix updateMany to send parameters into data fetch

## 2.2.3

* Hydra: display empty page when `hydra:totalItems` is 0

## 2.2.2

* Hydra: correctly display all errors

## 2.2.1

* Embedded support for array relation
* Fix optimistic introspect calls
* Hydra: better CORS error

## 2.2.0

* Add embedded support (disabled by default, set `useEmbedded` to `true` in the Hydra data provider)
* **BC**: If your API uses an embedded, it will not be a reference anymore if you use `ListGuesser`, `InputGuesser` or `ResourceGuesser`. Use the new way of handling embedded instead.
* **BC**: In the `schemaAnalyser`, `getReferenceNameField` has been renamed to `getFieldNameFromSchema`.
* Require `@api-platform/api-doc-parser` ^0.9 (embedded)
* Add partial pagination support
* Hydra: fix default per page parameter value

## 2.1.1

* Hydra: remove `trace` in error
* Hydra: add `body` to `HttpError`

## 2.1.0

* If a search filter for the identifier is available, use it for `MANY` requests

## 2.0.1

* Fix authentication
* Better error handling
* Use readable and writable fields instead of fields
* Use array notation for exists, range and date filters

## 2.0.0

* Compatibility with react-admin 3
* Use hooks instead of classes
* `AdminGuesser` can be used instead of `HydraAdmin`
* A custom `resourceSchemaAnalyzer` can be pass as a prop of `AdminGuesser`
* A custom `history` can be pass as a prop
* The Hydra data provider is using the new type
* Do not display guesser console logs in production
* Better UI when displaying errors at the first loading
* Undoable editing has been fixed

Breaking Changes:
* `dataProvider` imported from `@api-platform/admin` has been renamed to `hydraDataProvider`

## 1.0.2

* Pass down initial props to `HydraAdmin`
* Allow to disable filters on `ListGuesser`
* Fix nested search filters and search filter for collection in Hydra data provider
* Add console logs in guessers to improve DX
* Check for the value to be defined before checking the position of the prefix in `InputGuesser`

## 1.0.1

* Render login page when unauthorized
* Allow to inject custom API documentation parser in Hydra data provider

## 1.0.0

* Initial release (use `Guesser` components)

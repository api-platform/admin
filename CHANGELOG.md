# Changelog

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

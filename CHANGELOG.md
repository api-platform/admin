# Changelog

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

# API Platform Admin

**This project is an early stage. It's actually a Proof of Concept.
It is highly experimental and will be fully rewritten.
Use it at your own risk.**

Generate automatically an admin interface for any API built with [API Platform](https://api-platform.com)
or exposing a [Hydra](http://hydra-cg.com) documentation.

The admin is generated using the awesome [ng-admin](https://github.com/marmelab/ng-admin) library.

# Features

* Configure entities and properties (full CRUD support)
* Guess field types
* Guess required types
* Add placeholders
* Paginate

# Install

1. Clone the project and install dependencies:
    ```
    git clone https://github.com/dunglas/api-platform-admin
    bower install
    ```
2. Edit the `index.html` file and point the `ENTRYPOINT_URL` to your API entrypoint.
3. Your admin is up and running.

# Troubleshooting

* Be sure to set the correct CORS headers on the API.

# Todo

* [ ] Relations support
* [ ] Expand JSON-LD document in the Restangular response interceptor
* [ ] Sort support
* [ ] Rewrite it in ES6
* [ ] Add tests

# Credits

Built by [Kévin Dunglas](https://dunglas.fr) and sponsored by [Les-Tilleuls.coop](https://les-tilleuls.coop).
Released under [the MIT license](LICENSE).

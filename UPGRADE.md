# Upgrade to 3.0

First of all, read the [UPGRADE guide from react-admin](https://marmelab.com/react-admin/doc/4.0/Upgrade.html).

Since API Platform Admin is built on top of react-admin, almost everything in the react-admin upgrade guide applies to API Platform Admin as well.

This UPGRADE guide will only cover the specific changes for API Platform Admin.

## Authentication Support

Since the way to define custom routes has completely changed in react-admin, the way to add authentication support in API Platform Admin has also been modified.

In short, you need to use the `<CustomRoutes>` component inside the `<HydraAdmin>` or `<AdminGuesser>` component, with a redirect condition on its child.
The condition is taken from a state variable, and the state updater function is given to the data provider and will be used when there is an unauthorized error.

To see the full updated example, please [go to the related documentation page](https://api-platform.com/docs/main/admin/authentication-support/).

## Mercure Support

Since react-admin does not use Redux anymore, it's also the case for Mercure in API Platform Admin.

Instead it uses react-query cache to update the received changes in real time.

You will not see the Redux data action when a resource is updated by Mercure anymore.

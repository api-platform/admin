import {Resource} from 'react-admin';
import resourceFactory from './resourceFactory';

describe('makes Resource component', () => {
  const resource = {
    name: 'name',
    props: {custom: 'props'},
  };
  const api = {
    name: 'api',
  };

  const fieldFactory = jest.fn();
  const inputFactory = jest.fn();
  const parameterFactory = jest.fn();

  describe('makes default Resource component', () => {
    const resourceComponent = resourceFactory(
      resource,
      api,
      fieldFactory,
      inputFactory,
      parameterFactory,
    );

    test('is Resource component', () => {
      expect(resourceComponent.type.prototype).toEqual(Resource.prototype);
    });

    test('have props defined', () => {
      expect(resourceComponent.props).toBeDefined();
    });

    test('have proper name prop set', () => {
      expect(resourceComponent.props.name).toEqual(resource.name);
    });
    
    test('have proper icon prop set', () => {
      expect(resourceComponent.props.icon).toEqual(resource.icon);
    });

    test('have default actions: create, edit, list, show set', () => {
      expect(resourceComponent.props.create).toBeInstanceOf(Function);
      expect(resourceComponent.props.edit).toBeInstanceOf(Function);
      expect(resourceComponent.props.list).toBeInstanceOf(Function);
      expect(resourceComponent.props.show).toBeInstanceOf(Function);
    });

    test('have proper custom props set', () => {
      Object.keys(resource.props).forEach(key => {
        expect(resourceComponent.props[key]).toEqual(resource.props[key]);
      });
    });

    test('have proper options prop set', () => {
      expect(resourceComponent.props.options).toEqual({
        api,
        fieldFactory,
        inputFactory,
        parameterFactory,
        resource,
      });
    });
  });

  describe('makes Resource component with custom actions', () => {
    test('have custom create action', () => {
      const customCreate = jest.fn();
      const resourceComponent = resourceFactory(
        Object.assign({}, resource, {
          create: customCreate,
        }),
        api,
        fieldFactory,
        inputFactory,
      );

      expect(resourceComponent.props.create).toEqual(customCreate);
    });

    test('have custom create action', () => {
      const customCreate = jest.fn();
      const resourceComponent = resourceFactory(
        Object.assign({}, resource, {
          create: customCreate,
        }),
        api,
        fieldFactory,
        inputFactory,
        parameterFactory,
      );

      expect(resourceComponent.props.create).toEqual(customCreate);
    });

    test('have custom icon action', () => {
      const customIcon = jest.fn();
      const resourceComponent = resourceFactory(
        Object.assign({}, resource, {
          icon: customIcon,
        }),
        api,
        fieldFactory,
        inputFactory,
        parameterFactory,
      );

      expect(resourceComponent.props.icon).toEqual(customIcon);
    });

    test('have custom list action', () => {
      const customList = jest.fn();
      const resourceComponent = resourceFactory(
        Object.assign({}, resource, {
          list: customList,
        }),
        api,
        fieldFactory,
        inputFactory,
        parameterFactory,
      );

      expect(resourceComponent.props.list).toEqual(customList);
    });

    test('have custom show action', () => {
      const customShow = jest.fn();
      const resourceComponent = resourceFactory(
        Object.assign({}, resource, {
          show: customShow,
        }),
        api,
        fieldFactory,
        inputFactory,
        parameterFactory,
      );

      expect(resourceComponent.props.show).toEqual(customShow);
    });

    test('have custom edit action', () => {
      const customEdit = jest.fn();
      const resourceComponent = resourceFactory(
        Object.assign({}, resource, {
          edit: customEdit,
        }),
        api,
        fieldFactory,
        inputFactory,
        parameterFactory,
      );

      expect(resourceComponent.props.edit).toEqual(customEdit);
    });
  });
});

import {
  DateInput,
  NullableBooleanInput,
  NumberInput,
  TextInput,
} from 'react-admin';
import parameterFactory from './parameterFactory';

function mockParameter(range, variable = 'defaultValue') {
  return {
    range: 'http://www.w3.org/2001/XMLSchema#' + range,
    variable,
  };
}

describe('generate parameters input component', () => {
  const options = {option1: 'some_option'};

  describe('generate parameter input component based on parameter range', () => {
    const rangeToComponentType = {
      string: TextInput,
      integer: NumberInput,
      float: NumberInput,
      boolean: NullableBooleanInput,
      dateTime: DateInput,
    };

    Object.keys(rangeToComponentType).forEach(function(range) {
      describe(
        "generate parameter input component for parameter with range '" +
          range +
          "'",
        () => {
          let parameter;
          let result;

          beforeEach(() => {
            parameter = mockParameter(range);

            result = parameterFactory(parameter, [], options);
          });

          test('generated input component is instance of', () => {
            const expectedComponentType = rangeToComponentType[range];

            expect(result.type.prototype).toEqual(
              expectedComponentType.prototype,
            );
          });

          test('generated input component has options passed as props', () => {
            const props = result.props;
            Object.keys(options).forEach(key => {
              expect(props).toHaveProperty(key, options[key]);
            });
            expect(props).toHaveProperty('source', parameter.variable);
          });
        },
      );
    });
  });

  test("TODO: generate parameter input component for parameter with variable 'between'", () => {
    const result = parameterFactory(
      mockParameter(null, 'someVariable[between]'),
      [],
      options,
    );

    // Generation of input component is not implemented yet for parameter with variable 'between'
    expect(result).toBeNull();
  });
});

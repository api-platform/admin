import React from 'react';
import inflection from 'inflection';
import { Resource } from 'react-admin';
import PropTypes from 'prop-types';
import ListGuesser from './ListGuesser';
import CreateGuesser from './CreateGuesser';
import EditGuesser from './EditGuesser';
import ShowGuesser from './ShowGuesser';

const ResourceGuesser = ({ list, edit, create, show, ...props }) => {
  if (typeof props.options === 'undefined') {
    props.options = {};
  }

  props.options.label =
    typeof props.options.label !== 'undefined'
      ? props.options.label
      : inflection.transform(props.name.replace(/-/g, '_'), [
          'underscore',
          'humanize',
        ]);

  return (
    <Resource
      {...props}
      create={undefined === create ? CreateGuesser : create}
      edit={undefined === edit ? EditGuesser : edit}
      list={undefined === list ? ListGuesser : list}
      show={undefined === show ? ShowGuesser : show}
    />
  );
};

ResourceGuesser.propTypes = {
  name: PropTypes.string.isRequired,
};

export default ResourceGuesser;

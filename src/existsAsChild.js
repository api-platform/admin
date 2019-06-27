import {Children} from 'react';

const existsAsChild = children => {
  const childrenNames = new Set(
    Children.map(children, child => child.props.name),
  );

  return ({name}) => !childrenNames.has(name);
};

export default existsAsChild;

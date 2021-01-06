import React from 'react';
import { AppBar, useAuthProvider } from 'react-admin';
import { Typography, withStyles } from '@material-ui/core';

import Logo from './Logo';

const styles = {
  title: {
    flex: 1,
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
  spacer: {
    flex: 1,
  },
};

const CustomAppBar = withStyles(styles)(({ classes, userMenu, ...props }) => {
  const authProvider = useAuthProvider();

  return (
    <AppBar userMenu={userMenu || !!authProvider} {...props}>
      <Typography
        variant="h6"
        color="inherit"
        className={classes.title}
        id="react-admin-title"
      />
      <Logo />
      <span className={classes.spacer} />
    </AppBar>
  );
});

export default CustomAppBar;

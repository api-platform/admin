import React from 'react';
import { AppBar, useAuthProvider } from 'react-admin';
import { Typography, withStyles, WithStyles } from '@material-ui/core';

import Logo from './Logo';

interface CustomAppBarProps extends WithStyles {
  userMenu?: boolean | JSX.Element;
}

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
} as const;

const CustomAppBar = ({ classes, userMenu, ...props }: CustomAppBarProps) => {
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
};

export default withStyles(styles)(CustomAppBar);

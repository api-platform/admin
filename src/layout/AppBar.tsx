import React from 'react';
import {
  AppBar,
  AppBarClasses,
  ToggleThemeButton,
  useAuthProvider,
} from 'react-admin';
import type { AppBarProps } from 'react-admin';
import { Box, Typography } from '@mui/material';

import Logo from './Logo';
import { darkTheme, lightTheme } from './themes';

const CustomAppBar = ({ classes, userMenu, ...props }: AppBarProps) => {
  const authProvider = useAuthProvider();

  return (
    <AppBar userMenu={userMenu ?? !!authProvider} {...props}>
      <Typography
        variant="h6"
        color="inherit"
        className={AppBarClasses.title}
        id="react-admin-title"
      />
      <Logo />
      <Box component="span" sx={{ flex: 1 }} />
      <ToggleThemeButton lightTheme={lightTheme} darkTheme={darkTheme} />
    </AppBar>
  );
};

export default CustomAppBar;

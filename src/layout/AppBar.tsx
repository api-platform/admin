import React from 'react';
import { AppBar as RaAppBAr, TitlePortal, useAuthProvider } from 'react-admin';
import type { AppBarProps } from 'react-admin';
import { Box, useMediaQuery } from '@mui/material';
import type { Theme } from '@mui/material';

import Logo from './Logo.js';

const AppBar = ({ classes, userMenu, ...props }: AppBarProps) => {
  const authProvider = useAuthProvider();
  const isLargeEnough = useMediaQuery<Theme>((theme) =>
    theme.breakpoints.up('sm'),
  );
  return (
    <RaAppBAr userMenu={userMenu ?? !!authProvider} {...props}>
      <TitlePortal />
      {isLargeEnough && <Logo />}
      {isLargeEnough && <Box component="span" sx={{ flex: 1 }} />}
    </RaAppBAr>
  );
};

export default AppBar;

import { defaultTheme } from 'react-admin';
import type { RaThemeOptions } from 'react-admin';

export const darkTheme: RaThemeOptions = {
  ...defaultTheme,
  palette: {
    ...defaultTheme.palette,
    background: {
      default: '#424242',
    },
    primary: {
      contrastText: '#ffffff',
      main: '#52c9d4',
      light: '#9bf5fe',
      dark: '#21a1ae',
    },
    secondary: {
      ...defaultTheme.palette?.secondary,
      main: '#51b2bc',
    },
    mode: 'dark',
  },
  components: {
    ...defaultTheme.components,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore react-admin doesn't add its own components
    RaMenuItemLink: {
      styleOverrides: {
        root: {
          borderLeft: '3px solid #000',
          '&.RaMenuItemLink-active': {
            borderLeft: '3px solid #52c9d4',
          },
        },
      },
    },
    MuiFilledInput: {
      styleOverrides: undefined,
    },
  },
};

export const lightTheme: RaThemeOptions = {
  ...defaultTheme,
  palette: {
    ...defaultTheme.palette,
    primary: {
      contrastText: '#ffffff',
      main: '#38a9b4',
      light: '#74dde7',
      dark: '#006a75',
    },
    secondary: {
      ...defaultTheme.palette?.secondary,
      main: '#288690',
    },
    mode: 'light',
  },
  components: {
    ...defaultTheme.components,
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore react-admin doesn't add its own components
    RaMenuItemLink: {
      styleOverrides: {
        root: {
          borderLeft: '3px solid #fff',
          '&.RaMenuItemLink-active': {
            borderLeft: '3px solid #38a9b4',
          },
        },
      },
    },
  },
};

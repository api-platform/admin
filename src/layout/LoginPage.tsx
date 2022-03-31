import React from 'react';
import { Login, LoginClasses } from 'react-admin';
import type { LoginProps } from 'react-admin';

const LoginPage = (props: LoginProps) => (
  <Login
    sx={{
      backgroundImage:
        'radial-gradient(circle at 50% 14em, #90dfe7 0%, #288690 60%, #288690 100%)',
      [`& .${LoginClasses.icon}`]: {
        backgroundColor: 'secondary.main',
      },
    }}
    {...props}
  />
);

export default LoginPage;

const authProvider = {
  login: ({ username, password }: { username: string; password: string }) => {
    if (username !== 'john' || password !== '123') {
      return Promise.reject();
    }
    localStorage.setItem('username', username);
    return Promise.resolve();
  },
  logout: () => {
    localStorage.removeItem('username');
    return Promise.resolve();
  },
  checkAuth: () =>
    localStorage.getItem('username') ? Promise.resolve() : Promise.reject(),
  checkError: (error: { status: number }) => {
    const { status } = error;
    if (status === 401 || status === 403) {
      return Promise.reject();
    }
    // other error code (404, 500, etc): no need to log out
    return Promise.resolve();
  },
  getIdentity: () =>
    Promise.resolve({
      id: 'user',
      fullName: 'John Doe',
    }),
  getPermissions: () => Promise.resolve(''),
};

export default authProvider;

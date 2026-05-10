import Cookies from 'universal-cookie';

const cookies = new Cookies();

export const setAuthToken = (token: string, maxAge: number = 86400) => {
  cookies.set('auth_token', token, {
    path: '/',
    maxAge,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
  });
};

export const removeAuthToken = () => {
  cookies.remove('auth_token', { path: '/' });
};

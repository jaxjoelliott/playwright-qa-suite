export const STANDARD_USER = { username: 'standard_user', password: 'secret_sauce' };

export const INVALID_LOGINS = [
  { name: 'wrong password', username: 'standard_user', password: 'nope', error: 'Username and password do not match any user in this service' },
  { name: 'unknown user', username: 'ghost_user', password: 'secret_sauce', error: 'Username and password do not match any user in this service' },
  { name: 'locked out user', username: 'locked_out_user', password: 'secret_sauce', error: 'Sorry, this user has been locked out.' },
  { name: 'empty username', username: '', password: 'secret_sauce', error: 'Username is required' },
  { name: 'empty password', username: 'standard_user', password: '', error: 'Password is required' },
];

export const CHECKOUT_INFO = { firstName: 'Ada', lastName: 'Lovelace', postalCode: '12345' };

import api from './http';

export function register(data) {
  return api.post('/users/register/', data);
}

export function login(identifier, password) {
  const payload = { password };
  if (identifier.includes('@')) {
    payload.email = identifier;
  } else if (/^\d+$/.test(identifier)) {
    payload.phone_number = identifier;
  } else {
    payload.username = identifier;
  }
  return api.post('/users/login/', payload);
}

export function logout(refreshToken) {
  return api.post('/users/logout/', { refresh_token: refreshToken });
}

export function fetchProfile() {
  return api.get('/users/profile/');
}

export function changePassword(data) {
  return api.put('/users/change-password/', data);
}

export function deleteAccount() {
  return api.delete('/users/delete-account/');
}

export function bindEmail(email, code) {
  return api.post('/users/bind-email/', { email, code });
}

export function bindPhone(phone_number, code) {
  return api.post('/users/bind-phone/', { phone_number, code });
}

export function unbindEmail() {
  return api.post('/users/unbind-email/');
}

export function unbindPhone() {
  return api.post('/users/unbind-phone/');
}

export function getSettings() {
  return api.get('/users/settings/');
}

export function updateSettings(data) {
  return api.put('/users/settings/', data);
}

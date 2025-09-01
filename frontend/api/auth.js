import axios from 'axios';

export function register(data) {
  return axios.post('/users/register/', data);
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
  return axios.post('/users/login/', payload);
}

export function logout(refreshToken) {
  return axios.post('/users/logout/', { refresh_token: refreshToken });
}

export function fetchProfile() {
  return axios.get('/users/profile/');
}

export function changePassword(data) {
  return axios.put('/users/change-password/', data);
}

export function deleteAccount() {
  return axios.delete('/users/delete-account/');
}

export function bindEmail(email, code) {
  return axios.post('/users/bind-email/', { email, code });
}

export function bindPhone(phone_number, code) {
  return axios.post('/users/bind-phone/', { phone_number, code });
}

export function unbindEmail() {
  return axios.post('/users/unbind-email/');
}

export function unbindPhone() {
  return axios.post('/users/unbind-phone/');
}

export function getSettings() {
  return axios.get('/users/settings/');
}

export function updateSettings(data) {
  return axios.put('/users/settings/', data);
}

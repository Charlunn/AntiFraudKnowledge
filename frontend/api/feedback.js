import api from './http';

export function submitFeedback(data) {
  return api.post('/feedback/', data);
}

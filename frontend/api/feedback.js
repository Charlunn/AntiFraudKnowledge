import axios from 'axios';

export function submitFeedback(data) {
  return axios.post('/feedback/', data);
}

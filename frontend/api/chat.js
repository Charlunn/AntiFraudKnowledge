import axios from 'axios';

export function sendMessage(message, reset = false) {
  return axios.post('/chat/', { message, reset });
}

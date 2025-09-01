import api from './http';

export function sendMessage(message, reset = false) {
  return api.post('/chat/', { message, reset });
}

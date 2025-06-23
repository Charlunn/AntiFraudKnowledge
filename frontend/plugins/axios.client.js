import { defineNuxtPlugin } from '#app';
import axios from 'axios';

export default defineNuxtPlugin(() => {
  // Docker 环境下用 backend 服务名，开发环境用 localhost
  const isDocker = process.env.DOCKER_ENV === 'true';
  axios.defaults.baseURL = isDocker ? 'http://backend:8000/api' : 'http://localhost:8000/api';
}); 
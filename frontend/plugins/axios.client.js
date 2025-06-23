import { defineNuxtPlugin } from '#app';
import axios from 'axios';
import { useRuntimeConfig } from '#imports';

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();
  axios.defaults.baseURL = config.public.apiBase;
});
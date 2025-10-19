import { $fetch as ofetch } from "ofetch";

export const useApi = () => {
  const config = useRuntimeConfig();
  const runtimeBase = process.server ? config.apiBase : config.public?.apiBase;

  const baseURL =
    runtimeBase ??
    (process.server
      ? process.env.API_BASE_SERVER ||
        process.env.NUXT_API_BASE_SERVER ||
        "http://api:8000"
      : process.env.API_BASE_CLIENT ||
        process.env.NUXT_PUBLIC_API_BASE ||
        "/api");

  const fetcher = (globalThis as any).$fetch || ofetch;

  return fetcher.create({
    baseURL,
    timeout: 5000,
    retry: 0,
  });
};

import { $fetch as ofetch } from "ofetch";

const truthy = (value?: string | null) =>
  typeof value === "string" &&
  ["1", "true", "yes", "y", "on"].includes(value.toLowerCase());

const resolveDefaultBase = (target: "server" | "client") => {
  const dockerEnv =
    truthy(process.env.DOCKER_ENV) ||
    truthy(process.env.DOCKER) ||
    truthy(process.env.IN_DOCKER);

  if (target === "server") {
    return dockerEnv ? "http://backend:8000" : "http://localhost:8000";
  }

  return dockerEnv ? "/api" : "http://localhost:8000";
};

export const useApi = () => {
  const config = useRuntimeConfig();
  const runtimeBase = process.server ? config.apiBase : config.public?.apiBase;

  const baseURL =
    runtimeBase ??
    (process.server
      ? process.env.API_BASE_SERVER ||
        process.env.NUXT_API_BASE_SERVER ||
        resolveDefaultBase("server")
      : process.env.API_BASE_CLIENT ||
        process.env.NUXT_PUBLIC_API_BASE ||
        resolveDefaultBase("client"));

  const fetcher = (globalThis as any).$fetch || ofetch;

  return fetcher.create({
    baseURL,
    timeout: 5000,
    retry: 0,
  });
};

import { $fetch } from "ofetch";

const describeRequest = (request: any) => {
  if (typeof request === "string") {
    return request;
  }

  if (request?.url) {
    return request.url;
  }

  return request?.toString?.() || "[Request]";
};

export default defineNitroPlugin(() => {
  console.log("[Nitro] fetch logger plugin initialized");
  const originalOfetch = (globalThis.$fetch || $fetch).create({
    onRequest({ request }) {
      console.log("[SSR $fetch] ->", describeRequest(request));
    },
    onResponse({ request, response }) {
      console.log("[SSR $fetch OK]", response.status, describeRequest(request));
    },
    onRequestError({ request, error }) {
      console.error("[SSR $fetch ERR]", describeRequest(request), error?.message);
    },
  });

  // @ts-ignore
  globalThis.$fetch = originalOfetch;

  if (typeof globalThis.fetch === "function" && !(globalThis.fetch as any).__logged) {
    const nativeFetch = globalThis.fetch.bind(globalThis);

    const loggedNativeFetch: typeof fetch & { __logged?: boolean } = (async (
      input: RequestInfo | URL,
      init?: RequestInit,
    ) => {
      const target = describeRequest(input);
      const started = Date.now();
      try {
        const response = await nativeFetch(input, init);
        console.log("[SSR fetch OK]", response.status, target, `${Date.now() - started}ms`);
        return response;
      } catch (error: any) {
        console.error("[SSR fetch ERR]", target, error?.message || error);
        throw error;
      }
    }) as any;

    loggedNativeFetch.__logged = true;
    globalThis.fetch = loggedNativeFetch as typeof fetch;
  }
});

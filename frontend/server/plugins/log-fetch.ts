import { $fetch } from "ofetch";

export default defineNitroPlugin(() => {
  const orig = globalThis.$fetch || $fetch;
  const logged = orig.create({
    onRequest({ request }) {
      const url =
        typeof request === "string"
          ? request
          : request?.toString?.() || "[Request]";
      console.log("[SSR fetch] ->", url);
    },
    onResponse({ request, response }) {
      const url =
        typeof request === "string"
          ? request
          : request?.toString?.() || "[Request]";
      console.log("[SSR fetch OK]", response.status, url);
    },
    onRequestError({ request, error }) {
      const url =
        typeof request === "string"
          ? request
          : request?.toString?.() || "[Request]";
      console.error("[SSR fetch ERR]", url, error?.message);
    },
  });

  // @ts-ignore
  globalThis.$fetch = logged;
});

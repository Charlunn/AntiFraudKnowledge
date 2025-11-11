import { apiClient } from "~/services/api"

const ABSOLUTE_URL_REGEX = /^([a-z][a-z0-9+.-]*:)?\/\//i
const trimSlashes = (value = "") => value.replace(/^\/+|\/+$/g, "")

const resolveApiBase = (value?: string | null) => {
  if (!value) {
    return { origin: "", prefix: "api" }
  }

  const fallbackOrigin = "http://nuxt.local"

  try {
    const url = new URL(value, fallbackOrigin)
    const isRelative = !ABSOLUTE_URL_REGEX.test(value)
    const origin = isRelative ? "" : url.origin
    const prefix = trimSlashes(url.pathname)

    return {
      origin,
      prefix
    }
  } catch {
    return {
      origin: "",
      prefix: trimSlashes(value)
    }
  }
}

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig()
  const baseValue = process.server ? config.apiBase : config.public.apiBase
  const { origin, prefix } = resolveApiBase(baseValue)
  const envPrefix =
    process.env.API_PATH_PREFIX ??
    process.env.NUXT_API_PATH_PREFIX ??
    process.env.NUXT_PUBLIC_API_PATH_PREFIX
  const normalizedEnvPrefix = typeof envPrefix === "string" ? trimSlashes(envPrefix) : undefined
  const finalPrefix = normalizedEnvPrefix !== undefined ? normalizedEnvPrefix : (prefix || "api")

  apiClient.baseURL = origin || ""
  apiClient.pathPrefix = finalPrefix
})

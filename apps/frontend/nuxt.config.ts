import { fileURLToPath } from "node:url";

export default defineNuxtConfig({
  compatibilityDate: "2025-01-01",

  modules: [
    "@pinia/nuxt",
  ],

  alias: {
    "@assets": fileURLToPath(new URL("./app/assets", import.meta.url)),
    "@css": fileURLToPath(new URL("./app/assets/css", import.meta.url)),
    "@constants": fileURLToPath(new URL("./app/constants", import.meta.url)),
    "@components": fileURLToPath(new URL("./app/components", import.meta.url)),
    "@shared": fileURLToPath(new URL("./app/components/shared", import.meta.url)),
    "@admin": fileURLToPath(new URL("./app/components/admin", import.meta.url)),
    "@client": fileURLToPath(new URL("./app/components/client", import.meta.url)),
    "@stores": fileURLToPath(new URL("./app/stores", import.meta.url)),
  },

  components: [
    {
      path: fileURLToPath(new URL("./app/components", import.meta.url)),
      pathPrefix: false,
    },
  ],

  css: [
    "@css/main.css",
  ],

  runtimeConfig: {
    public: {
      apiBase: process.env.NUXT_PUBLIC_API_BASE || "http://localhost:4000/api",
    },
  },

  routeRules: {
    "/chat": {
      ssr: false,
    },
    "/admin/**": {
      ssr: false,
    },
  },

  devtools: {
    enabled: true,
  },
});
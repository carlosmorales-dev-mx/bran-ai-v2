import { defineStore } from "pinia";

export type PreviewRole = "admin" | "client";
export type PreviewLang = "es" | "en";

export const usePreviewStore = defineStore("preview", {
  state: () => ({
    role: "admin" as PreviewRole,
    lang: "es" as PreviewLang,
  }),

  actions: {
    setRole(role: PreviewRole) {
      this.role = role;
    },

    setLang(lang: PreviewLang) {
      this.lang = lang;
    },
  },
});

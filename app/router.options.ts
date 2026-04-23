import type { RouterConfig } from "@nuxt/schema";
import { useNuxtApp } from "#app";

export default <RouterConfig>{
  scrollBehavior(to, from, savedPosition) {
    const nuxtApp = useNuxtApp();

    if (savedPosition) {
      return savedPosition;
    }

    const isSamePageNavigation = to.path === from.path;

    if (to.hash && isSamePageNavigation) {
      return {
        el: to.hash,
        behavior: "smooth",
      };
    }

    const position = to.hash
      ? { el: to.hash, behavior: "smooth" as const }
      : { left: 0, top: 0 };

    return new Promise((resolve) => {
      nuxtApp.hooks.hookOnce("page:finish", () => {
        resolve(position);
      });
    });
  },
};

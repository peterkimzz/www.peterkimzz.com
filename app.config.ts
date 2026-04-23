export default defineAppConfig({
  ui: {
    colors: {
      primary: "neutral",
    },
    prose: {
      h2: {
        slots: {
          leading:
            "absolute -ms-8 top-1/2 hidden -translate-y-1/2 rounded-md bg-elevated p-1 text-muted opacity-0 transition group-hover:opacity-100 group-focus:opacity-100 hover:text-primary lg:flex",
        },
      },
      h3: {
        slots: {
          leading:
            "absolute -ms-8 top-1/2 hidden -translate-y-1/2 rounded-md bg-elevated p-1 text-muted opacity-0 transition group-hover:opacity-100 group-focus:opacity-100 hover:text-primary lg:flex",
        },
      },
    },
  },
});

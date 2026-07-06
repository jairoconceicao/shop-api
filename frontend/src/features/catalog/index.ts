export const catalogFeature = {
  key: "catalog",
  routes: {
    list: "/catalogo",
    detail: (id: string) => `/produto/${id}`,
  },
} as const;

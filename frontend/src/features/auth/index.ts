export const authFeature = {
  key: "auth",
  routes: {
    login: "/login",
  },
} as const;

export { loginSchema } from "./auth.schemas";
export type { LoginFormValues } from "./auth.schemas";
export { useAuthStore } from "./auth.store";
export { ProtectedRoute } from "./ProtectedRoute";

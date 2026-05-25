import { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

export const respectiveDashboard = (
  user: { role: string },
  router: AppRouterInstance,
) => {
  if (user.role === "tac") {
    router.push("/dashboard");
  } else if (user.role === "user") {
    router.push("/inquiry");
  }
};

export const CamelCase = (text: string) => {
  return text
    ?.replace(/_/g, " ")
    ?.replace(/\b\w/g, (char) => char.toUpperCase())
}

import { useAuthStore } from "@stores/auth";

export default defineNuxtRouteMiddleware(async () => {
    const auth = useAuthStore();

    const user = await auth.bootstrap();

    if (!user) return;

    if (user.role === "ADMIN") {
        return navigateTo("/admin");
    }

    return navigateTo("/chat");
});
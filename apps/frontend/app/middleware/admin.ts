import { useAuthStore } from "@stores/auth";

export default defineNuxtRouteMiddleware(async () => {
    if (import.meta.server) {
        return;
    }

    const auth = useAuthStore();

    const user = await auth.bootstrap();

    if (!user) {
        return navigateTo("/login");
    }

    if (user.role !== "ADMIN") {
        return navigateTo("/chat");
    }
});
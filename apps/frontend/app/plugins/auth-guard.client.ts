import { useAuthStore } from "@stores/auth";

export default defineNuxtPlugin(() => {
    const router = useRouter();

    router.beforeEach(async (to) => {
        const auth = useAuthStore();

        const user = await auth.bootstrap();

        const isGuestRoute = ["/login", "/register"].includes(to.path);
        const isAdminRoute = to.path.startsWith("/admin");
        const isClientRoute = to.path === "/chat";

        // Usuario logueado intentando ir a login/register
        if (user && isGuestRoute) {
            return user.role === "ADMIN" ? "/admin" : "/chat";
        }

        // Usuario NO logueado intentando entrar a rutas privadas
        if (!user && (isAdminRoute || isClientRoute)) {
            return "/login";
        }

        // Cliente intentando entrar al admin
        if (user && isAdminRoute && user.role !== "ADMIN") {
            return "/chat";
        }

        // Admin intentando entrar al chat cliente
        if (user && isClientRoute && user.role !== "CLIENT") {
            return "/admin";
        }
    });
});
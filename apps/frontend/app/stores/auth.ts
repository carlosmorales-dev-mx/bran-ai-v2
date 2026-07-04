import { defineStore } from "pinia";

export type UserRole = "ADMIN" | "CLIENT";

export type AuthUser = {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    createdAt?: string;
    updatedAt?: string;
};

type LoginResponse = {
    access_token: string;
};

type RegisterPayload = {
    name: string;
    email: string;
    password: string;
};

let bootstrapPromise: Promise<AuthUser | null> | null = null;

export const useAuthStore = defineStore("auth", {
    state: () => ({
        token: null as string | null,
        user: null as AuthUser | null,
        loading: false,
        bootstrapped: false,
    }),

    getters: {
        isAuthenticated: (state) => Boolean(state.token && state.user),
        isAdmin: (state) => state.user?.role === "ADMIN",
        isClient: (state) => state.user?.role === "CLIENT",
    },

    actions: {
        loadToken() {
            if (!process.client) return null;

            const token = localStorage.getItem("token");
            this.token = token;

            return token;
        },

        saveToken(token: string) {
            this.token = token;

            if (process.client) {
                localStorage.setItem("token", token);
            }
        },

        clearAuth() {
            this.token = null;
            this.user = null;
            this.bootstrapped = true;
            bootstrapPromise = null;

            if (process.client) {
                localStorage.removeItem("token");
            }
        },

        async login(email: string, password: string) {
            const { request } = useApi();

            this.loading = true;

            try {
                const response = await request<LoginResponse>("/auth/login", {
                    method: "POST",
                    body: {
                        email,
                        password,
                    },
                });

                this.saveToken(response.access_token);

                const user = await this.me();

                return user;
            } finally {
                this.loading = false;
            }
        },

        async register(payload: RegisterPayload) {
            const { request } = useApi();

            this.loading = true;

            try {
                const response = await request<LoginResponse>("/auth/register", {
                    method: "POST",
                    body: payload,
                });

                this.saveToken(response.access_token);

                const user = await this.me();

                return user;
            } finally {
                this.loading = false;
            }
        },

        async me() {
            const { request } = useApi();

            if (!this.token) {
                this.loadToken();
            }

            if (!this.token) {
                this.bootstrapped = true;
                return null;
            }

            try {
                const user = await request<AuthUser>("/auth/me");
                this.user = user;
                this.bootstrapped = true;

                return user;
            } catch {
                this.clearAuth();
                return null;
            }
        },

        async bootstrap() {
            const storedToken = process.client
                ? localStorage.getItem("token")
                : null;

            if (!storedToken) {
                this.token = null;
                this.user = null;
                this.bootstrapped = true;
                bootstrapPromise = null;
                return null;
            }

            if (this.bootstrapped && this.user && this.token === storedToken) {
                return this.user;
            }

            if (bootstrapPromise) {
                return await bootstrapPromise;
            }

            this.token = storedToken;

            bootstrapPromise = this.me()
                .finally(() => {
                    bootstrapPromise = null;
                });

            return await bootstrapPromise;
        },

        logout() {
            this.clearAuth();
            return navigateTo("/login");
        },
    },
});
type ApiOptions = {
    method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
    body?: any;
    headers?: Record<string, string>;
};

export function useApi() {
    const config = useRuntimeConfig();

    function getToken() {
        if (!process.client) return null;
        return localStorage.getItem("token");
    }

    async function request<T = any>(
        path: string,
        options: ApiOptions = {},
    ): Promise<T> {
        const token = getToken();

        try {
            const response = await $fetch<any>(`${config.public.apiBase}${path}`, {
                method: options.method || "GET",
                body: options.body,
                headers: {
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                    ...(options.headers || {}),
                },
            });

            if (response?.success === true && "data" in response) {
                return response.data as T;
            }

            return response as T;
        } catch (error: any) {
            const message =
                error?.data?.error ||
                error?.data?.message ||
                error?.message ||
                "Error de conexión";

            throw new Error(message);
        }
    }

    return {
        request,
    };
}
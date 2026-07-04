import { usePreviewStore } from "@stores/preview";

const translations = {
    es: {
        // ── Sidebar nav ──────────────────────────────
        nav_panel: "Panel",
        nav_knowledge: "Base de Conocimiento",
        nav_sessions: "Sesiones",
        nav_logout: "Salir",

        // ── Topbar ───────────────────────────────────
        page_dashboard: "Dashboard",
        page_knowledge: "Base de Conocimiento",
        page_sessions: "Sesiones",

        // ── Dashboard ────────────────────────────────
        dash_title: "Panel de Monitoreo",
        dash_subtitle_global: "Últimos 30 días · global",
        dash_subtitle_user: "Últimos 30 días · usuario",
        dash_refresh: "Actualizar",
        dash_refreshing: "Actualizando...",
        dash_tokens: "Tokens Totales",
        dash_cost: "Costo Total",
        dash_sessions: "Sesiones",
        dash_latency: "Latencia",
        dash_trend_usage: "↑ uso acumulado",
        dash_trend_estimated: "↑ estimado",
        dash_trend_chats: "↑ chats creados",
        dash_trend_avg: "↓ promedio",
        dash_token_day: "Consumo de Tokens / Día",
        dash_cost_chat: "Costo por Chat",
        dash_recent: "Sesiones Recientes",
        dash_no_sessions: "No hay sesiones con métricas todavía.",
        dash_no_recent: "No hay sesiones recientes todavía.",
        col_session: "Sesión",
        col_user: "Usuario",
        col_tokens_in: "Tokens In",
        col_tokens_out: "Tokens Out",
        col_cost: "Costo",
        col_time: "Hora",

        // ── Knowledge ────────────────────────────────
        know_title: "Base de Conocimiento",
        know_loading: "Cargando...",
        know_refresh: "Actualizar",
        know_sources: "fuentes indexadas",
        know_chunks: "chunks",
        know_unknown_status: "estado desconocido",
        know_search: "Buscar...",
        know_filter_all: "Todos",
        know_loading_docs: "Cargando documentos...",
        know_empty: "No hay contextos que coincidan con tu búsqueda.",
        know_delete_confirm: "¿Eliminar",
        know_delete_confirm2: "de la base de conocimiento?",
        know_admin: "Admin",
        know_chunks_label: "chunks",

        // ── Upload ───────────────────────────────────
        up_file: "Archivo",
        up_url: "URL",
        up_text: "Texto",
        up_drag: "Arrastra o haz clic para subir",
        up_uploading: "Subiendo e indexando...",
        up_url_label: "URL",
        up_url_placeholder: "https://ejemplo.com/guia",
        up_url_title: "Título opcional",
        up_url_title_placeholder: "Ej. Guía de servicios",
        up_index_url: "Indexar URL",
        up_indexing_url: "Indexando URL...",
        up_title_label: "Título",
        up_title_placeholder: "Ej. Políticas de atención",
        up_content_label: "Contenido",
        up_content_placeholder: "Pega aquí el contenido que quieres indexar...",
        up_index_text: "Indexar texto",
        up_indexing_text: "Indexando...",
        up_url_required: "La URL es requerida.",
        up_title_required: "Título y contenido son requeridos.",
        up_success_file: "enviado a indexación.",
        up_success_url: "URL enviada a indexación.",
        up_success_text: "Texto indexado correctamente.",
        up_error_file: "No pude subir el archivo.",
        up_error_url: "No pude indexar la URL.",
        up_error_text: "No pude indexar el texto.",

        // ── Chat (admin) ─────────────────────────────
        chat_new: "+ Nueva sesión",
        chat_loading_sessions: "Cargando sesiones...",
        chat_no_sessions: "No hay sesiones todavía.",
        chat_rag_active: "RAG activo",
        chat_draft: "Sesión nueva · RAG",
        chat_admin_subtitle: "Admin · RAG",
        chat_untitled: "Sin título",
        chat_draft_label: "Borrador",

        // ── Chat (shared) ────────────────────────────
        chat_placeholder: "Escribe tu pregunta o contexto para los archivos...",
        chat_user: "Tú",
        chat_assistant: "Asistente",
        chat_typing: "Escribiendo...",
        chat_online: "Asistente en línea",
        chat_new_conversation: "Nueva conversación",
        chat_conversations: "Conversaciones",
        chat_history: "Historial del usuario",
        chat_no_history: "Aún no hay conversaciones guardadas.",
        chat_loading_history: "Cargando historial...",
        chat_draft_unsaved: "Sin guardar",
        chat_untitled_conv: "Conversación sin título",

        // ── Auth ─────────────────────────────────────
        login_welcome: "Bienvenido de nuevo 👋",
        login_subtitle: "Ingresa tus credenciales para continuar",
        login_email: "Correo electrónico",
        login_password: "Contraseña",
        login_submit: "Iniciar sesión →",
        login_loading: "Autenticando...",
        login_forgot: "¿Olvidaste tu contraseña?",
        login_recover: "Recuperar",
        login_no_account: "¿Aún no tienes cuenta?",
        login_create: "Crear una",

        register_title: "Crea tu cuenta",
        register_subtitle: "Completa tus datos para continuar",
        register_name: "Nombre completo",
        register_name_placeholder: "Carlos Martínez",
        register_submit: "Crear cuenta →",
        register_loading: "Creando cuenta...",
        register_has_account: "¿Ya tienes cuenta?",
        register_login: "Iniciar sesión",
        register_confirm: "Confirmar contraseña",
    },

    en: {
        // ── Sidebar nav ──────────────────────────────
        nav_panel: "Panel",
        nav_knowledge: "Knowledge Base",
        nav_sessions: "Sessions",
        nav_logout: "Sign out",

        // ── Topbar ───────────────────────────────────
        page_dashboard: "Dashboard",
        page_knowledge: "Knowledge Base",
        page_sessions: "Sessions",

        // ── Dashboard ────────────────────────────────
        dash_title: "Monitoring Dashboard",
        dash_subtitle_global: "Last 30 days · global",
        dash_subtitle_user: "Last 30 days · user",
        dash_refresh: "Refresh",
        dash_refreshing: "Refreshing...",
        dash_tokens: "Total Tokens",
        dash_cost: "Total Cost",
        dash_sessions: "Sessions",
        dash_latency: "Latency",
        dash_trend_usage: "↑ accumulated usage",
        dash_trend_estimated: "↑ estimated",
        dash_trend_chats: "↑ chats created",
        dash_trend_avg: "↓ average",
        dash_token_day: "Token Usage / Day",
        dash_cost_chat: "Cost per Chat",
        dash_recent: "Recent Sessions",
        dash_no_sessions: "No sessions with metrics yet.",
        dash_no_recent: "No recent sessions yet.",
        col_session: "Session",
        col_user: "User",
        col_tokens_in: "Tokens In",
        col_tokens_out: "Tokens Out",
        col_cost: "Cost",
        col_time: "Time",

        // ── Knowledge ────────────────────────────────
        know_title: "Knowledge Base",
        know_loading: "Loading...",
        know_refresh: "Refresh",
        know_sources: "indexed sources",
        know_chunks: "chunks",
        know_unknown_status: "unknown status",
        know_search: "Search...",
        know_filter_all: "All",
        know_loading_docs: "Loading documents...",
        know_empty: "No documents match your search.",
        know_delete_confirm: "Delete",
        know_delete_confirm2: "from the knowledge base?",
        know_admin: "Admin",
        know_chunks_label: "chunks",

        // ── Upload ───────────────────────────────────
        up_file: "File",
        up_url: "URL",
        up_text: "Text",
        up_drag: "Drag or click to upload",
        up_uploading: "Uploading and indexing...",
        up_url_label: "URL",
        up_url_placeholder: "https://example.com/guide",
        up_url_title: "Optional title",
        up_url_title_placeholder: "e.g. Service guide",
        up_index_url: "Index URL",
        up_indexing_url: "Indexing URL...",
        up_title_label: "Title",
        up_title_placeholder: "e.g. Service policies",
        up_content_label: "Content",
        up_content_placeholder: "Paste the content you want to index...",
        up_index_text: "Index text",
        up_indexing_text: "Indexing...",
        up_url_required: "URL is required.",
        up_title_required: "Title and content are required.",
        up_success_file: "sent for indexing.",
        up_success_url: "URL sent for indexing.",
        up_success_text: "Text indexed successfully.",
        up_error_file: "Could not upload the file.",
        up_error_url: "Could not index the URL.",
        up_error_text: "Could not index the text.",

        // ── Chat (admin) ─────────────────────────────
        chat_new: "+ New session",
        chat_loading_sessions: "Loading sessions...",
        chat_no_sessions: "No sessions yet.",
        chat_rag_active: "RAG active",
        chat_draft: "New session · RAG",
        chat_admin_subtitle: "Admin · RAG",
        chat_untitled: "Untitled",
        chat_draft_label: "Draft",

        // ── Chat (shared) ────────────────────────────
        chat_placeholder: "Type your question or context for the files...",
        chat_user: "You",
        chat_assistant: "Assistant",
        chat_typing: "Typing...",
        chat_online: "Assistant online",
        chat_new_conversation: "New conversation",
        chat_conversations: "Conversations",
        chat_history: "User history",
        chat_no_history: "No conversations saved yet.",
        chat_loading_history: "Loading history...",
        chat_draft_unsaved: "Unsaved",
        chat_untitled_conv: "Untitled conversation",

        // ── Auth ─────────────────────────────────────
        login_welcome: "Welcome back 👋",
        login_subtitle: "Enter your credentials to continue",
        login_email: "Email address",
        login_password: "Password",
        login_submit: "Sign in →",
        login_loading: "Signing in...",
        login_forgot: "Forgot your password?",
        login_recover: "Recover",
        login_no_account: "Don't have an account?",
        login_create: "Create one",

        register_title: "Create your account",
        register_subtitle: "Complete your details to continue",
        register_name: "Full name",
        register_name_placeholder: "Carlos Martinez",
        register_submit: "Create account →",
        register_loading: "Creating account...",
        register_has_account: "Already have an account?",
        register_login: "Sign in",
        register_confirm: "Confirm password",
    },
} as const;

export type TranslationKey = keyof typeof translations.es;

export function useT() {
    const preview = usePreviewStore();

    function t(key: TranslationKey): string {
        const lang = preview.lang as "es" | "en";
        return (translations[lang]?.[key] ?? translations.es[key] ?? key) as string;
    }

    const lang = computed(() => preview.lang);

    return { t, lang };
}
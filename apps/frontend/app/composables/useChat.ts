import { useAuthStore } from "@stores/auth";

export interface ChatAttachment {
    name: string;
    type: string;
    size: number;
    previewUrl?: string;
}

export interface ChatSession {
    id: string;
    title: string;
    createdAt: string;
    updatedAt: string;
    isDraft?: boolean;
}

export interface ChatMessage {
    id?: string;
    role: "user" | "assistant";
    content: string;
    createdAt?: string;
    attachments?: ChatAttachment[];
}

interface ChatResponse {
    sessionId: string;
    question: string;
    answer: string;
    context?: string[];
    usage?: {
        prompt_tokens?: number;
        completion_tokens?: number;
        total_tokens?: number;
        model?: string;
        cached?: boolean;
    };
    cached?: boolean;
}

interface ChatUploadResponse {
    sessionId: string;
    answer: string;
    file?: {
        name: string;
        type: string;
        size: number;
    };
    usage?: {
        prompt_tokens?: number;
        completion_tokens?: number;
        total_tokens?: number;
        model?: string;
        cached?: boolean;
    };
    chunks?: number;
    indexed?: boolean;
    error?: boolean;
}

const DRAFT_SESSION_ID = "__draft_new_chat__";

function createAttachment(file: File): ChatAttachment {
    return {
        name: file.name,
        type: file.type || "application/octet-stream",
        size: file.size,
        previewUrl: file.type.startsWith("image/")
            ? URL.createObjectURL(file)
            : undefined,
    };
}

export function useChat() {
    const { request } = useApi();
    const auth = useAuthStore();

    const realSessions = useState<ChatSession[]>("chat-real-sessions", () => []);
    const draftSession = useState<ChatSession | null>("chat-draft-session", () => null);
    const activeSessionId = useState<string | null>("chat-active-session-id", () => null);

    const loading = useState<boolean>("chat-loading", () => false);
    const uploading = useState<boolean>("chat-uploading", () => false);
    const loadingHistory = useState<boolean>("chat-loading-history", () => false);

    function assistantName() {
        return auth.user?.name || "tu asistente";
    }

    function welcomeMessage(): ChatMessage {
        return {
            id: "local-welcome",
            role: "assistant",
            content: `¡Hola! Soy el asistente virtual de ${assistantName()}. ¿En qué puedo ayudarte hoy?`,
        };
    }

    const messages = useState<ChatMessage[]>("chat-messages", () => [
        welcomeMessage(),
    ]);

    const sessions = computed<ChatSession[]>(() => {
        if (draftSession.value) {
            return [draftSession.value, ...realSessions.value];
        }

        return realSessions.value;
    });

    function resetMessagesToWelcome() {
        messages.value = [welcomeMessage()];
    }

    const fetchSessions = async () => {
        loadingHistory.value = true;

        try {
            const data = await request<ChatSession[]>("/chat/sessions");
            realSessions.value = data;
        } catch (error) {
            console.error("Error cargando sesiones:", error);
        } finally {
            loadingHistory.value = false;
        }
    };

    const loadSession = async (sessionId: string) => {
        if (sessionId === DRAFT_SESSION_ID) {
            activeSessionId.value = DRAFT_SESSION_ID;
            resetMessagesToWelcome();
            return;
        }

        loading.value = true;

        try {
            const data = await request<any[]>(`/chat/${sessionId}`);

            activeSessionId.value = sessionId;
            draftSession.value = null;

            const dbMessages: ChatMessage[] = (data || []).map((item) => ({
                id: item.id,
                role: item.role,
                content: item.content,
                createdAt: item.createdAt,
            }));

            messages.value = [
                welcomeMessage(),
                ...dbMessages,
            ];
        } catch (error) {
            console.error("Error cargando historial:", error);
        } finally {
            loading.value = false;
        }
    };

    const newConversation = () => {
        const now = new Date().toISOString();

        draftSession.value = {
            id: DRAFT_SESSION_ID,
            title: "Nuevo chat",
            createdAt: now,
            updatedAt: now,
            isDraft: true,
        };

        activeSessionId.value = DRAFT_SESSION_ID;
        resetMessagesToWelcome();
    };

    const sendMessage = async (question: string) => {
        const trimmed = question.trim();

        if (!trimmed || loading.value || uploading.value) return;

        const isDraftConversation = activeSessionId.value === DRAFT_SESSION_ID;

        messages.value.push({
            role: "user",
            content: trimmed,
        });

        loading.value = true;

        try {
            const response = await request<ChatResponse>("/chat", {
                method: "POST",
                body: {
                    question: trimmed,
                    sessionId: isDraftConversation
                        ? undefined
                        : activeSessionId.value || undefined,
                },
            });

            if (response.sessionId) {
                activeSessionId.value = response.sessionId;
                draftSession.value = null;

                await fetchSessions();
            }

            messages.value.push({
                role: "assistant",
                content: response.answer || "No tengo respuesta por el momento.",
            });
        } catch (error: any) {
            console.error("Error enviando mensaje:", error);

            messages.value.push({
                role: "assistant",
                content:
                    error?.message ||
                    "Ocurrió un error al consultar el asistente. Intenta de nuevo.",
            });
        } finally {
            loading.value = false;
        }
    };

    const uploadFiles = async (files: File[], instruction = "") => {
        if (!files.length || loading.value || uploading.value) return;

        uploading.value = true;

        try {
            const cleanInstruction = instruction.trim();

            for (const file of files) {
                const attachment = createAttachment(file);

                messages.value.push({
                    role: "user",
                    content: cleanInstruction
                        ? `Contexto: ${cleanInstruction}`
                        : "",
                    attachments: [attachment],
                });

                const form = new FormData();
                form.append("file", file);

                if (cleanInstruction) {
                    form.append("instruction", cleanInstruction);
                }

                const isDraftConversation = activeSessionId.value === DRAFT_SESSION_ID;

                if (!isDraftConversation && activeSessionId.value) {
                    form.append("sessionId", activeSessionId.value);
                }

                const response = await request<ChatUploadResponse>("/chat/upload", {
                    method: "POST",
                    body: form,
                });

                if (response.sessionId) {
                    activeSessionId.value = response.sessionId;
                    draftSession.value = null;

                    await fetchSessions();
                }

                messages.value.push({
                    role: "assistant",
                    content: response.answer || `Ya analicé el archivo ${file.name}.`,
                });
            }
        } catch (error: any) {
            console.error("Error subiendo archivo:", error);

            messages.value.push({
                role: "assistant",
                content:
                    error?.message ||
                    "No pude analizar el archivo. Puede que el modelo esté saturado temporalmente. Intenta de nuevo en unos segundos.",
            });
        } finally {
            uploading.value = false;
        }
    };

    // ✅ NUEVO: borra una sesión de chat (backend + estado local)
    const deleteSession = async (sessionId: string) => {
        try {
            await request(`/chat/${sessionId}`, { method: "DELETE" });

            realSessions.value = realSessions.value.filter(
                (s) => s.id !== sessionId
            );

            // Si la sesión activa era la que se borró, arranca una conversación nueva
            if (activeSessionId.value === sessionId) {
                newConversation();
            }
        } catch (error) {
            console.error("Error borrando sesión:", error);
            throw error;
        }
    };

    return {
        sessions,
        activeSessionId,
        messages,
        loading,
        uploading,
        loadingHistory,
        fetchSessions,
        loadSession,
        sendMessage,
        uploadFiles,
        newConversation,
        deleteSession,
    };
}

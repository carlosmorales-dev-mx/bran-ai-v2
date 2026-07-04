import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from "@nestjs/common";
import { extname } from "path";

import { PrismaService } from "../prisma/prisma.service";
import { RagProxyService } from "../rag-proxy/rag-proxy.service";

const ALLOWED_EXTENSIONS = [
    ".pdf",
    ".docx",
    ".xlsx",
    ".csv",
    ".txt",
    ".mp4",
    ".mov",
    ".jpg",
    ".jpeg",
    ".png",
];

@Injectable()
export class ChatService {
    constructor(
        private prisma: PrismaService,
        private rag: RagProxyService
    ) { }

    async handleChat(userId: string, question: string, sessionId?: string) {
        const cleanQuestion = question?.trim();

        if (!cleanQuestion) {
            throw new BadRequestException("La pregunta es requerida");
        }

        const session = await this.getOrCreateSession(
            userId,
            cleanQuestion,
            sessionId
        );

        await this.prisma.message.create({
            data: {
                role: "user",
                content: cleanQuestion,
                sessionId: session.id,
            },
        });

        try {
            const response = await this.answerWithRagOnlyPipeline(
                userId,
                session.id,
                cleanQuestion
            );

            return {
                sessionId: session.id,
                question: cleanQuestion,
                ...response,
                error: false,
            };
        } catch (error: any) {
            const answer = this.buildChatErrorMessage(error);

            await this.prisma.message.create({
                data: {
                    role: "assistant",
                    content: answer,
                    sessionId: session.id,
                },
            });

            await this.touchSession(session.id);

            console.error("❌ CHAT PIPELINE ERROR SAVED:", error);

            return {
                sessionId: session.id,
                question: cleanQuestion,
                answer,
                context: [],
                usage: null,
                cached: false,
                error: true,
                ragOnly: true,
            };
        }
    }

    async analyzeUploadedFile(
        userId: string,
        file: Express.Multer.File,
        sessionId?: string,
        instruction?: string
    ) {
        if (!file) {
            throw new BadRequestException("Archivo requerido");
        }

        const extension = extname(file.originalname).toLowerCase();

        if (!ALLOWED_EXTENSIONS.includes(extension)) {
            throw new BadRequestException(
                `Tipo de archivo no soportado: ${extension}`
            );
        }

        const cleanInstruction = instruction?.trim() || "";

        const session = await this.getOrCreateSession(
            userId,
            cleanInstruction || `Archivo: ${file.originalname}`,
            sessionId
        );

        await this.prisma.message.create({
            data: {
                role: "user",
                content: cleanInstruction
                    ? `Archivo adjunto: ${file.originalname}\n\nContexto: ${cleanInstruction}`
                    : `Archivo adjunto: ${file.originalname}`,
                sessionId: session.id,
            },
        });

        try {
            const extraction = await this.rag.extractFile(file);
            const extractedText = extraction?.extractedText || "";

            if (!extractedText.trim()) {
                throw new Error("No se pudo extraer texto del archivo");
            }

            const question = this.buildUploadQuestion(
                file.originalname,
                cleanInstruction
            );

            const searchText = this.buildUploadSearchText(
                file.originalname,
                cleanInstruction,
                extractedText
            );

            const response = await this.answerWithRagOnlyPipeline(
                userId,
                session.id,
                question,
                searchText
            );

            return {
                sessionId: session.id,
                answer: response.answer,
                file: {
                    name: file.originalname,
                    type: this.getDocumentType(extension),
                    size: file.size,
                },
                usage: response.usage,
                chunks: extraction?.chunks || 0,
                indexed: false,
                error: false,
                ragOnly: true,
            };
        } catch (error: any) {
            const answer = this.buildFileAnalyzeErrorMessage(error);

            await this.prisma.message.create({
                data: {
                    role: "assistant",
                    content: answer,
                    sessionId: session.id,
                },
            });

            await this.touchSession(session.id);

            console.error("❌ FILE EXTRACT / RAG PIPELINE ERROR SAVED:", error);

            return {
                sessionId: session.id,
                answer,
                file: {
                    name: file.originalname,
                    type: this.getDocumentType(extension),
                    size: file.size,
                },
                usage: null,
                chunks: 0,
                indexed: false,
                error: true,
                ragOnly: true,
            };
        }
    }

    /**
     * ✅ FIX: streamChat ahora persiste la respuesta del asistente en la BD.
     *
     * Usa TransformStream para interceptar cada chunk mientras se transmite
     * al cliente. Al finalizar el stream (flush), concatena todos los chunks
     * y guarda el mensaje del asistente + actualiza la sesión.
     *
     * Esto no bloquea el streaming — el cliente sigue recibiendo chunks en
     * tiempo real mientras en paralelo se acumula el texto para guardarlo.
     */
    async streamChat(userId: string, question: string, sessionId?: string) {
        const cleanQuestion = question?.trim();

        if (!cleanQuestion) {
            throw new BadRequestException("La pregunta es requerida");
        }

        const session = await this.getOrCreateSession(
            userId,
            cleanQuestion,
            sessionId
        );

        await this.prisma.message.create({
            data: {
                role: "user",
                content: cleanQuestion,
                sessionId: session.id,
            },
        });

        const rawStream = await this.rag.stream(cleanQuestion);

        // Capturamos referencias para usarlas en el closure del TransformStream
        const prisma = this.prisma;
        const sessionId_ = session.id;
        const decoder = new TextDecoder();
        const chunks: string[] = [];

        const transform = new TransformStream<Uint8Array, Uint8Array>({
            transform(chunk, controller) {
                // Acumula el texto para guardarlo al final
                chunks.push(decoder.decode(chunk, { stream: true }));
                // Pasa el chunk al cliente sin demora
                controller.enqueue(chunk);
            },

            // flush se llama cuando el stream upstream se cierra
            async flush() {
                const fullAnswer = chunks.join("").trim();

                if (!fullAnswer) return;

                try {
                    await prisma.message.create({
                        data: {
                            role: "assistant",
                            content: fullAnswer,
                            sessionId: sessionId_,
                        },
                    });

                    await prisma.chatSession.update({
                        where: { id: sessionId_ },
                        data: { updatedAt: new Date() },
                    });
                } catch (err) {
                    // No lanzamos — el cliente ya recibió la respuesta completa
                    console.error("❌ STREAM PERSIST ERROR:", err);
                }
            },
        });

        // Pipe: rawStream → TransformStream (intercepta + guarda) → cliente
        rawStream.pipeTo(transform.writable).catch((err) => {
            console.error("❌ STREAM PIPE ERROR:", err);
        });

        return transform.readable;
    }

    async getSessions(userId: string) {
        return this.prisma.chatSession.findMany({
            where: { userId },
            orderBy: { updatedAt: "desc" },
            take: 30,
            select: {
                id: true,
                title: true,
                createdAt: true,
                updatedAt: true,
            },
        });
    }

    async getSessionMessages(userId: string, sessionId: string) {
        const session = await this.prisma.chatSession.findFirst({
            where: { id: sessionId, userId },
            select: { id: true },
        });

        if (!session) {
            throw new NotFoundException("Session no encontrada");
        }

        return this.prisma.message.findMany({
            where: {
                sessionId,
                role: { in: ["user", "assistant"] },
            },
            orderBy: { createdAt: "asc" },
            select: {
                id: true,
                role: true,
                content: true,
                createdAt: true,
            },
        });
    }

    async getUsage(userId: string) {
        return this.prisma.usage.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            take: 100,
            select: {
                id: true,
                sessionId: true,
                model: true,
                promptTokens: true,
                completionTokens: true,
                totalTokens: true,
                latencyMs: true,
                createdAt: true,
            },
        });
    }

    // ✅ NUEVO: borra una sesión completa (usage desvinculado, mensajes y sesión eliminados)
    async deleteSession(userId: string, sessionId: string) {
        const session = await this.prisma.chatSession.findFirst({
            where: { id: sessionId, userId },
            select: { id: true },
        });

        if (!session) {
            throw new NotFoundException("Session no encontrada");
        }

        // Los registros de Usage tienen sessionId opcional (onDelete: SetNull en el schema
        // no está declarado explícitamente para Usage->ChatSession, así que lo desvinculamos
        // manualmente antes de borrar para no romper la FK).
        await this.prisma.usage.updateMany({
            where: { sessionId },
            data: { sessionId: null },
        });

        await this.prisma.message.deleteMany({ where: { sessionId } });

        await this.prisma.chatSession.delete({ where: { id: sessionId } });

        return { status: "deleted", id: sessionId };
    }

    // ── Private helpers ──────────────────────────────────────────────────────

    private async answerWithRagOnlyPipeline(
        userId: string,
        sessionId: string,
        question: string,
        searchText?: string
    ) {
        const startedAt = Date.now();

        const response = await this.rag.query(question, searchText);
        const latencyMs = Date.now() - startedAt;

        const answer = response?.answer || "no tengo contexto de eso!";

        await this.prisma.message.create({
            data: {
                role: "assistant",
                content: answer,
                sessionId,
            },
        });

        await this.touchSession(sessionId);

        if (response?.usage) {
            await this.saveUsage(userId, sessionId, response.usage, latencyMs);
        }

        return {
            answer,
            context: response?.context || [],
            usage: response?.usage,
            cached: response?.cached || false,
            ragOnly: true,
        };
    }

    private async getOrCreateSession(
        userId: string,
        titleSource: string,
        sessionId?: string
    ) {
        if (!sessionId) {
            return this.prisma.chatSession.create({
                data: {
                    title: this.buildSessionTitle(titleSource),
                    userId,
                },
                select: {
                    id: true,
                    title: true,
                    createdAt: true,
                    updatedAt: true,
                },
            });
        }

        const session = await this.prisma.chatSession.findFirst({
            where: { id: sessionId, userId },
            select: {
                id: true,
                title: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        if (!session) {
            throw new NotFoundException("Session no encontrada");
        }

        return session;
    }

    private buildUploadQuestion(filename: string, instruction: string) {
        const clean = instruction.trim();

        if (clean) {
            return [
                `El usuario adjuntó el archivo "${filename}".`,
                "",
                "Responde SOLO con información encontrada en la base de conocimiento RAG.",
                "No uses el contenido extraído del archivo como fuente de respuesta.",
                "El archivo solo sirve para buscar contexto relacionado en el RAG.",
                "Si el RAG no contiene contexto suficiente, responde exactamente: no tengo contexto de eso!",
                "",
                `Pregunta del usuario: ${clean}`,
            ].join("\n");
        }

        return [
            `El usuario adjuntó el archivo "${filename}".`,
            "",
            "Busca en la base de conocimiento RAG si existe contexto relacionado con este archivo.",
            "Responde SOLO con información encontrada en el RAG.",
            "No uses el contenido extraído del archivo como fuente de respuesta.",
            "Si el RAG no contiene contexto suficiente, responde exactamente: no tengo contexto de eso!",
        ].join("\n");
    }

    private buildUploadSearchText(
        filename: string,
        instruction: string,
        extractedText: string
    ) {
        return [
            `Archivo adjunto: ${filename}`,
            instruction ? `Instrucción del usuario: ${instruction}` : "",
            "",
            "Texto extraído usado SOLO para búsqueda semántica en RAG:",
            extractedText.slice(0, 6000),
        ]
            .filter(Boolean)
            .join("\n");
    }

    private getErrorStatus(error: any) {
        if (typeof error?.getStatus === "function") return error.getStatus();
        return error?.status || error?.statusCode || error?.response?.status || error?.response?.statusCode || null;
    }

    private getErrorText(error: any) {
        const raw =
            error?.response?.message ||
            error?.response?.error ||
            error?.response?.detail ||
            error?.message || "";
        return String(raw).toLowerCase();
    }

    private isPermissionError(error: any) {
        const s = this.getErrorStatus(error);
        const m = this.getErrorText(error);
        return (
            s === 401 || s === 403 ||
            m.includes("permission_denied") || m.includes("permission denied") ||
            m.includes("denied access") || m.includes("project has been denied access") ||
            m.includes("api key") || m.includes("authentication") || m.includes("unauthorized")
        );
    }

    private isQuotaError(error: any) {
        const s = this.getErrorStatus(error);
        const m = this.getErrorText(error);
        return (
            s === 429 ||
            m.includes("quota") || m.includes("resource_exhausted") ||
            m.includes("rate limit") || m.includes("too many requests") ||
            m.includes("429") || m.includes("límite temporal") || m.includes("limite temporal")
        );
    }

    private isUnavailableError(error: any) {
        const s = this.getErrorStatus(error);
        const m = this.getErrorText(error);
        return (
            s === 503 ||
            m.includes("503") || m.includes("unavailable") || m.includes("high demand") ||
            m.includes("saturado") || m.includes("no está disponible") || m.includes("no esta disponible")
        );
    }

    private buildChatErrorMessage(error: any) {
        if (this.isPermissionError(error)) {
            return "No pude responder porque el proveedor del modelo rechazó el acceso del proyecto/API key.\n\nRevisa la API key, permisos del proyecto o cambia de proveedor/modelo.";
        }
        if (this.isQuotaError(error)) {
            return "No pude responder porque se alcanzó el límite temporal del modelo.\n\nIntenta de nuevo más tarde o cambia de modelo/API key.";
        }
        if (this.isUnavailableError(error)) {
            return "No pude responder porque el modelo está saturado temporalmente.\n\nIntenta de nuevo en unos segundos.";
        }
        return "No pude responder en este momento.\n\nRevisa que el servicio RAG esté activo e intenta de nuevo.";
    }

    private buildFileAnalyzeErrorMessage(error: any) {
        if (this.isPermissionError(error)) {
            return "No pude procesar el archivo porque el proveedor del modelo rechazó el acceso.\n\nRevisa la API key, permisos del proyecto o cambia de modelo/proveedor.";
        }
        if (this.isQuotaError(error)) {
            return "No pude consultar el RAG porque se alcanzó el límite temporal del modelo.\n\nEl archivo sí se recibió. Intenta más tarde o cambia de modelo/API key.";
        }
        if (this.isUnavailableError(error)) {
            return "No pude consultar el RAG porque el modelo está saturado temporalmente.\n\nEl archivo sí se recibió. Intenta de nuevo en unos segundos.";
        }
        return "No pude analizar el archivo en este momento.\n\nRevisa que el archivo sea compatible, no supere el límite de tamaño y que el servicio RAG esté activo.";
    }

    private async touchSession(sessionId: string) {
        await this.prisma.chatSession.update({
            where: { id: sessionId },
            data: { updatedAt: new Date() },
        });
    }

    private async saveUsage(
        userId: string,
        sessionId: string,
        usage: any,
        latencyMs?: number
    ) {
        try {
            await this.prisma.usage.create({
                data: {
                    userId,
                    sessionId,
                    model: usage.model || "unknown",
                    promptTokens:     usage.prompt_tokens     ?? null,
                    completionTokens: usage.completion_tokens ?? null,
                    totalTokens:      usage.total_tokens      ?? null,
                    latencyMs:        latencyMs               ?? null,
                },
            });
        } catch (err) {
            console.error("❌ USAGE SAVE ERROR:", err);
        }
    }

    private buildSessionTitle(value: string) {
        const title = value.trim().replace(/\s+/g, " ");
        return title.length <= 30 ? title : `${title.slice(0, 30)}...`;
    }

    private getDocumentType(extension: string) {
        if (extension === ".pdf")  return "pdf";
        if (extension === ".docx") return "docx";
        if (extension === ".xlsx") return "xlsx";
        if (extension === ".csv")  return "csv";
        if (extension === ".txt")  return "text";
        if ([".jpg", ".jpeg", ".png"].includes(extension)) return "image";
        if ([".mp4", ".mov"].includes(extension))          return "video";
        return "file";
    }
}

import {
    HttpException,
    Injectable,
    InternalServerErrorException,
    ServiceUnavailableException,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
// ✅ form-data: paquete confiable para multipart en Node.js (evita problemas de Blob nativo)
import FormDataNode from "form-data";

@Injectable()
export class RagProxyService {
    // ✅ FIX: baseUrl desde .env, no hardcodeado
    private readonly baseUrl: string;

    constructor(private config: ConfigService) {
        this.baseUrl = this.config.get<string>("RAG_URL") || "http://localhost:8008";
    }

    async ingest(payload: {
        title: string;
        content: string;
        type?: string;
        source?: string;
    }) {
        try {
            const res = await fetch(`${this.baseUrl}/ingest`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await this.safeJson(res);

            if (!res.ok) {
                console.error("RAG INGEST ERROR:", data);
                throw new Error(this.getErrorMessage(data, "RAG ingest error"));
            }

            return data;
        } catch (err) {
            if (err instanceof HttpException) throw err;
            console.error("FETCH INGEST ERROR:", err);
            throw new InternalServerErrorException("RAG service unavailable");
        }
    }

    async ingestFile(file: Express.Multer.File) {
        try {
            const form = this.buildFileForm(file);
            const headers = form.getHeaders() as Record<string, string>;

            const res = await fetch(`${this.baseUrl}/ingest/file`, {
                method: "POST",
                // Buffer extiende Uint8Array → es BodyInit válido; el cast evita el error de tipos
                body: form.getBuffer() as unknown as BodyInit,
                headers,
            });

            const data = await this.safeJson(res);

            if (!res.ok) {
                console.error("RAG FILE INGEST ERROR:", data);

                if (res.status === 429 || res.status === 503) {
                    throw new ServiceUnavailableException(
                        this.getErrorMessage(data, "El modelo no está disponible temporalmente")
                    );
                }

                throw new Error(this.getErrorMessage(data, "RAG file ingest error"));
            }

            return data;
        } catch (err) {
            if (err instanceof HttpException) throw err;
            console.error("FETCH FILE INGEST ERROR:", err);
            throw new InternalServerErrorException("RAG file ingest failed");
        }
    }

    async extractFile(file: Express.Multer.File) {
        try {
            const form = this.buildFileForm(file);
            const headers = form.getHeaders() as Record<string, string>;

            const res = await fetch(`${this.baseUrl}/extract/file`, {
                method: "POST",
                body: form.getBuffer() as unknown as BodyInit,
                headers,
            });

            const data = await this.safeJson(res);

            if (!res.ok) {
                console.error("RAG FILE EXTRACT ERROR:", data);

                if (res.status === 429 || res.status === 503) {
                    throw new ServiceUnavailableException(
                        this.getErrorMessage(data, "El modelo no está disponible temporalmente")
                    );
                }

                throw new Error(this.getErrorMessage(data, "RAG file extract error"));
            }

            return data;
        } catch (err) {
            if (err instanceof HttpException) throw err;
            console.error("FETCH FILE EXTRACT ERROR:", err);
            throw new InternalServerErrorException("RAG file extract failed");
        }
    }

    async query(question: string, searchText?: string) {
        try {
            const res = await fetch(`${this.baseUrl}/query`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ question, searchText }),
            });

            const data = await this.safeJson(res);

            if (!res.ok) {
                console.error("RAG QUERY ERROR:", data);

                if (res.status === 429) {
                    throw new ServiceUnavailableException(
                        this.getErrorMessage(
                            data,
                            "Se alcanzó el límite temporal del modelo. Intenta más tarde o cambia de API key/modelo."
                        )
                    );
                }

                if (res.status === 503) {
                    throw new ServiceUnavailableException(
                        this.getErrorMessage(
                            data,
                            "El modelo está saturado temporalmente. Intenta de nuevo más tarde."
                        )
                    );
                }

                throw new Error(this.getErrorMessage(data, "RAG query error"));
            }

            return data;
        } catch (err) {
            if (err instanceof HttpException) throw err;
            console.error("FETCH QUERY ERROR:", err);
            throw new InternalServerErrorException("RAG query failed");
        }
    }

    async stream(question: string) {
        try {
            const res = await fetch(`${this.baseUrl}/query/stream`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ question }),
            });

            if (!res.ok || !res.body) {
                throw new InternalServerErrorException("RAG stream unavailable");
            }

            return res.body;
        } catch (err) {
            if (err instanceof HttpException) throw err;
            console.error("FETCH STREAM ERROR:", err);
            throw new InternalServerErrorException("RAG stream failed");
        }
    }

    async deleteDocument(ragDocumentId: string) {
        try {
            const res = await fetch(`${this.baseUrl}/documents/${ragDocumentId}`, {
                method: "DELETE",
            });

            if (!res.ok) {
                const data = await this.safeJson(res);
                throw new Error(this.getErrorMessage(data, "RAG delete error"));
            }

            return true;
        } catch (err) {
            if (err instanceof HttpException) throw err;
            console.error("FETCH DELETE DOCUMENT ERROR:", err);
            throw new InternalServerErrorException("RAG delete failed");
        }
    }

    // ✅ NUEVO: getMetrics centralizado — KnowledgeService ya no hace fetch directo
    async getMetrics() {
        try {
            const res = await fetch(`${this.baseUrl}/metrics`);
            const data = await this.safeJson(res);

            if (!res.ok) {
                throw new Error("RAG metrics error");
            }

            return data;
        } catch (err) {
            console.error("RAG METRICS ERROR:", err);
            throw new InternalServerErrorException("RAG metrics unavailable");
        }
    }

    // ── Helpers ────────────────────────────────────────────────────────────────

    /**
     * ✅ FIX: usa el paquete `form-data` en lugar de Blob nativo de Node.js
     * — evita errores de compatibilidad con fetch en Node.js 18/20/22.
     * form-data maneja buffers de Multer directamente sin conversión.
     */
    private buildFileForm(file: Express.Multer.File): FormDataNode {
        const form = new FormDataNode();

        form.append("file", file.buffer, {
            filename: file.originalname,
            contentType: file.mimetype || "application/octet-stream",
            knownLength: file.size,
        });

        return form;
    }

    private async safeJson(res: Response) {
        try {
            return await res.json();
        } catch {
            return {};
        }
    }

    private getErrorMessage(data: any, fallback: string): string {
        if (!data) return fallback;

        return (
            data.detail ||
            data.message ||
            data.error ||
            fallback
        );
    }
}
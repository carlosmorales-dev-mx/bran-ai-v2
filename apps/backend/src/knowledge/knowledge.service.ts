import {
    BadRequestException,
    Injectable,
    InternalServerErrorException,
    NotFoundException,
} from "@nestjs/common";
import { extname } from "path";

import { PrismaService } from "../prisma/prisma.service";
import { IngestDto } from "./dto/ingest.dto";
import { IngestUrlDto } from "./dto/ingest-url.dto";
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
export class KnowledgeService {
    constructor(
        private prisma: PrismaService,
        private rag: RagProxyService
    ) { }

    async getDocuments() {
        return this.prisma.document.findMany({
            orderBy: { createdAt: "desc" },
            take: 200,
            select: {
                id: true,
                title: true,
                type: true,
                source: true,
                status: true,
                url: true,
                sizeBytes: true,
                chunks: true,
                ragDocumentId: true,
                createdAt: true,
                updatedAt: true,
                uploadedBy: {
                    select: { id: true, name: true, email: true },
                },
                // extractedText NO se incluye aquí a propósito: puede pesar
                // mucho y el frontend no lo necesita en el listado.
            },
        });
    }

    async createDocument(userId: string, dto: IngestDto) {
        const doc = await this.prisma.document.create({
            data: {
                title: dto.title,
                type: "text",
                source: "manual",
                status: "PENDING",
                sizeBytes: Buffer.byteLength(dto.content, "utf8"),
                uploadedById: userId,
                // ✅ NUEVO: el contenido manual ya es el texto a indexar, se guarda tal cual
                extractedText: dto.content,
            },
        });

        try {
            const ragResponse = await this.rag.ingest({
                title: dto.title,
                content: dto.content,
                type: "text",
                source: "manual",
            });

            const updated = await this.prisma.document.update({
                where: { id: doc.id },
                data: {
                    status: "INDEXED",
                    chunks: ragResponse?.chunks ?? 0,
                    ragDocumentId: ragResponse?.document_id ?? null,
                },
                include: {
                    uploadedBy: { select: { id: true, name: true, email: true } },
                },
            });

            return { ...updated, rag: ragResponse };
        } catch (err) {
            await this.prisma.document.update({
                where: { id: doc.id },
                data: { status: "ERROR" },
            });

            console.error("KNOWLEDGE INGEST ERROR:", err);
            throw new InternalServerErrorException("Error ingestando documento");
        }
    }

    async createUrlDocument(userId: string, dto: IngestUrlDto) {
        const cleanUrl = dto.url.trim();

        const doc = await this.prisma.document.create({
            data: {
                title: dto.title?.trim() || this.buildUrlTitle(cleanUrl),
                type: "url",
                source: "url",
                status: "PENDING",
                url: cleanUrl,
                uploadedById: userId,
            },
        });

        try {
            const content = await this.fetchUrlContent(cleanUrl);
            const title = dto.title?.trim() || this.extractHtmlTitle(content) || this.buildUrlTitle(cleanUrl);
            const text = this.htmlToText(content);

            if (!text.trim() || text.trim().length < 20) {
                throw new BadRequestException("No se pudo extraer texto suficiente de la URL");
            }

            const ragResponse = await this.rag.ingest({
                title,
                content: text,
                type: "url",
                source: cleanUrl,
            });

            const updated = await this.prisma.document.update({
                where: { id: doc.id },
                data: {
                    title,
                    status: "INDEXED",
                    sizeBytes: Buffer.byteLength(text, "utf8"),
                    chunks: ragResponse?.chunks ?? 0,
                    ragDocumentId: ragResponse?.document_id ?? null,
                    // ✅ NUEVO: guardamos el texto ya extraído de la URL
                    extractedText: text,
                },
                include: {
                    uploadedBy: { select: { id: true, name: true, email: true } },
                },
            });

            return { ...updated, rag: ragResponse };
        } catch (err) {
            await this.prisma.document.update({
                where: { id: doc.id },
                data: { status: "ERROR" },
            });

            console.error("KNOWLEDGE URL INGEST ERROR:", err);

            if (err instanceof BadRequestException) throw err;

            throw new InternalServerErrorException("Error ingestando URL");
        }
    }

    async uploadDocument(userId: string, file: Express.Multer.File) {
        if (!file) {
            throw new BadRequestException("Archivo requerido");
        }

        const extension = extname(file.originalname).toLowerCase();

        if (!ALLOWED_EXTENSIONS.includes(extension)) {
            throw new BadRequestException(`Tipo de archivo no soportado: ${extension}`);
        }

        const type = this.getDocumentType(extension);

        const doc = await this.prisma.document.create({
            data: {
                title: file.originalname,
                type,
                source: "upload",
                status: "PENDING",
                sizeBytes: file.size,
                uploadedById: userId,
            },
        });

        try {
            const ragResponse = await this.rag.ingestFile(file);

            const updated = await this.prisma.document.update({
                where: { id: doc.id },
                data: {
                    status: "INDEXED",
                    chunks: ragResponse?.chunks ?? 0,
                    ragDocumentId: ragResponse?.document_id ?? null,
                    // ✅ NUEVO: el RAG ahora devuelve el texto extraído del archivo
                    extractedText: ragResponse?.extractedText ?? null,
                },
                include: {
                    uploadedBy: { select: { id: true, name: true, email: true } },
                },
            });

            return { ...updated, rag: ragResponse };
        } catch (err) {
            await this.prisma.document.update({
                where: { id: doc.id },
                data: { status: "ERROR" },
            });

            console.error("KNOWLEDGE FILE INGEST ERROR:", err);
            throw new InternalServerErrorException("Error ingestando archivo");
        }
    }

    async deleteDocument(id: string) {
        const doc = await this.prisma.document.findUnique({ where: { id } });

        if (!doc) {
            throw new NotFoundException("Documento no encontrado");
        }

        if (doc.ragDocumentId) {
            try {
                await this.rag.deleteDocument(doc.ragDocumentId);
            } catch (err) {
                console.error("RAG DELETE DOCUMENT ERROR:", err);
                throw new InternalServerErrorException("Error eliminando contexto del RAG");
            }
        }

        await this.prisma.document.delete({ where: { id } });

        return {
            status: "deleted",
            id,
            title: doc.title,
            ragDeleted: Boolean(doc.ragDocumentId),
        };
    }

    // ✅ NUEVO: reindexar un documento existente sin volver a subirlo.
    // Requiere que extractedText ya esté guardado (documentos indexados
    // ANTES de este fix no lo tendrán — hay que volver a subirlos una vez).
    async reindexDocument(id: string) {
        const doc = await this.prisma.document.findUnique({ where: { id } });

        if (!doc) {
            throw new NotFoundException("Documento no encontrado");
        }

        if (!doc.extractedText || !doc.extractedText.trim()) {
            throw new BadRequestException(
                "No hay texto guardado para este documento. Vuelve a subirlo para poder reindexarlo."
            );
        }

        await this.prisma.document.update({
            where: { id },
            data: { status: "PENDING" },
        });

        try {
            // Borra los embeddings viejos antes de generar los nuevos,
            // para no dejar chunks huérfanos duplicados en ChromaDB.
            if (doc.ragDocumentId) {
                try {
                    await this.rag.deleteDocument(doc.ragDocumentId);
                } catch (err) {
                    console.error("REINDEX: error borrando embeddings previos:", err);
                }
            }

            const ragResponse = await this.rag.ingest({
                title: doc.title,
                content: doc.extractedText,
                type: doc.type,
                source: doc.source,
            });

            const updated = await this.prisma.document.update({
                where: { id },
                data: {
                    status: "INDEXED",
                    chunks: ragResponse?.chunks ?? 0,
                    ragDocumentId: ragResponse?.document_id ?? null,
                },
                include: {
                    uploadedBy: { select: { id: true, name: true, email: true } },
                },
            });

            return updated;
        } catch (err) {
            await this.prisma.document.update({
                where: { id },
                data: { status: "ERROR" },
            });

            console.error("KNOWLEDGE REINDEX ERROR:", err);
            throw new InternalServerErrorException("Error reindexando documento");
        }
    }

    // ✅ FIX: getMetrics usa RagProxyService (no fetch directo con URL hardcodeada)
    async getMetrics() {
        return this.rag.getMetrics();
    }

    // ── Private helpers ──────────────────────────────────────────────────────

    private async fetchUrlContent(url: string) {
        const res = await fetch(url, {
            headers: {
                "User-Agent": "bran.ai/1.0 knowledge-ingestor",
                "Accept": "text/html,text/plain,application/xhtml+xml",
            },
        });

        if (!res.ok) {
            throw new BadRequestException(`No pude leer la URL. Status: ${res.status}`);
        }

        return await res.text();
    }

    private htmlToText(html: string) {
        return html
            .replace(/<script[\s\S]*?<\/script>/gi, " ")
            .replace(/<style[\s\S]*?<\/style>/gi, " ")
            .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
            .replace(/<[^>]+>/g, " ")
            .replace(/&nbsp;/g, " ")
            .replace(/&amp;/g, "&")
            .replace(/&lt;/g, "<")
            .replace(/&gt;/g, ">")
            .replace(/&quot;/g, "\"")
            .replace(/&#39;/g, "'")
            .replace(/\s+/g, " ")
            .trim()
            .slice(0, 120000);
    }

    private extractHtmlTitle(html: string) {
        const match = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
        return match?.[1]?.replace(/\s+/g, " ").trim().slice(0, 120);
    }

    private buildUrlTitle(url: string) {
        try {
            const parsed = new URL(url);
            return parsed.hostname.replace(/^www\./, "");
        } catch {
            return "Documento URL";
        }
    }

    private getDocumentType(extension: string) {
        if (extension === ".pdf") return "pdf";
        if (extension === ".docx") return "docx";
        if (extension === ".xlsx") return "xlsx";
        if (extension === ".csv") return "csv";
        if (extension === ".txt") return "text";
        if ([".jpg", ".jpeg", ".png"].includes(extension)) return "image";
        if ([".mp4", ".mov"].includes(extension)) return "video";
        return "file";
    }
}

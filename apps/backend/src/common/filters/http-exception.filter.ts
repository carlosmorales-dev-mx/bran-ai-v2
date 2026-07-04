import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
} from "@nestjs/common";
import { Request, Response } from "express";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let error = "Internal server error";

        if (exception instanceof HttpException) {
            status = exception.getStatus();

            const exceptionResponse = exception.getResponse();

            if (typeof exceptionResponse === "string") {
                error = exceptionResponse;
            } else if (typeof exceptionResponse === "object") {
                const res: any = exceptionResponse;

                // 🔥 manejo inteligente
                if (Array.isArray(res.message)) {
                    error = res.message.join(", ");
                } else {
                    error = res.message || exception.message;
                }
            }
        }

        // 🔥 LOG PRO
        console.error("🚨 ERROR:", {
            path: request.url,
            method: request.method,
            status,
            error,
            stack: (exception as any)?.stack,
        });

        response.status(status).json({
            success: false,
            error,
            statusCode: status,
            timestamp: new Date().toISOString(),
            path: request.url,
        });
    }
}
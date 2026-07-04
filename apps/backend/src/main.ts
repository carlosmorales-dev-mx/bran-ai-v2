import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { ResponseInterceptor } from "./common/interceptors/response.interceptor";

async function bootstrap() {
    console.log("🔥 Bootstrapping...");

    const app = await NestFactory.create(AppModule);

    // 🔐 Validación global
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            forbidNonWhitelisted: true,
            transform: true,
            transformOptions: {
                enableImplicitConversion: true,
            },
        }),
    );

    // 🔥 Filters
    app.useGlobalFilters(new HttpExceptionFilter());

    // 🔥 Interceptors
    app.useGlobalInterceptors(new ResponseInterceptor());

    // ✅ FIX: CORS correcto — origin específico + credentials:true son incompatibles con origin:"*"
    const allowedOrigins = (process.env.FRONTEND_URL || "http://localhost:3000")
        .split(",")
        .map((o) => o.trim());

    app.enableCors({
        origin: allowedOrigins,
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    });

    // 🌐 Prefijo global
    app.setGlobalPrefix("api");

    const port = process.env.PORT || 4000;
    await app.listen(port);

    console.log(`✅ Backend running on http://localhost:${port}`);
}

bootstrap();
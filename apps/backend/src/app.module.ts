import {
    Module,
    MiddlewareConsumer,
    NestModule,
} from "@nestjs/common";

import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { KnowledgeModule } from "./knowledge/knowledge.module";
import { RagProxyModule } from "./rag-proxy/rag-proxy.module";
import { LoggerMiddleware } from "./common/middleware/logger.middleware";
import { ChatModule } from "./chat/chat.module";
import { MetricsModule } from "./metrics/metrics.module";

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: "../../.env",
        }),
        PrismaModule,
        AuthModule,
        KnowledgeModule,
        RagProxyModule,
        ChatModule,
        MetricsModule,
    ],
})
export class AppModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(LoggerMiddleware).forRoutes("{*path}");
    }
}
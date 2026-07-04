import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { RagProxyService } from "./rag-proxy.service";

@Module({
    // ✅ FIX: ConfigModule necesario porque RagProxyService inyecta ConfigService
    imports: [ConfigModule],
    providers: [RagProxyService],
    exports: [RagProxyService],
})
export class RagProxyModule { }
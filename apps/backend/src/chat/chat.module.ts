import { Module } from "@nestjs/common";
import { ChatController } from "./chat.controller";
import { ChatService } from "./chat.service";
import { PrismaModule } from "../prisma/prisma.module";
import { RagProxyModule } from "../rag-proxy/rag-proxy.module";

@Module({
    controllers: [ChatController],
    providers: [ChatService],
    imports: [PrismaModule, RagProxyModule],
})
export class ChatModule { }
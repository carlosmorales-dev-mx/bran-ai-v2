import {
    Controller,
    Post,
    Body,
    UseGuards,
    Res,
    Get,
    Param,
    UploadedFile,
    UseInterceptors,
    BadRequestException,
} from "@nestjs/common";
import { Response } from "express";
import { FileInterceptor } from "@nestjs/platform-express";

import { JwtGuard } from "../auth/jwt.guard";
import { ChatService } from "./chat.service";
import { User } from "../common/decorators/user.decorator";
import { JwtUser } from "../common/types/jwt-user.type";

const MAX_FILE_SIZE = 100 * 1024 * 1024;

@Controller("chat")
export class ChatController {
    constructor(private chatService: ChatService) { }

    @UseGuards(JwtGuard)
    @Post()
    async chat(
        @Body() body: { question: string; sessionId?: string },
        @User() user: JwtUser
    ) {
        return this.chatService.handleChat(
            user.id,
            body.question,
            body.sessionId
        );
    }

    @UseGuards(JwtGuard)
    @Post("upload")
    @UseInterceptors(
        FileInterceptor("file", {
            limits: {
                fileSize: MAX_FILE_SIZE,
            },
        })
    )
    async uploadFile(
        @Body() body: { sessionId?: string; instruction?: string },
        @UploadedFile() file: Express.Multer.File,
        @User() user: JwtUser
    ) {
        if (!file) {
            throw new BadRequestException("Archivo requerido");
        }

        return this.chatService.analyzeUploadedFile(
            user.id,
            file,
            body.sessionId,
            body.instruction
        );
    }

    @UseGuards(JwtGuard)
    @Post("stream")
    async stream(
        @Body() body: { question: string; sessionId?: string },
        @User() user: JwtUser,
        @Res() res: Response
    ) {
        const stream = await this.chatService.streamChat(
            user.id,
            body.question,
            body.sessionId
        );

        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");

        const reader = stream.getReader();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            res.write(Buffer.from(value).toString("utf-8"));
        }

        res.end();
    }

    @UseGuards(JwtGuard)
    @Get("sessions")
    getSessions(@User() user: JwtUser) {
        return this.chatService.getSessions(user.id);
    }

    @UseGuards(JwtGuard)
    @Get("usage")
    getUsage(@User() user: JwtUser) {
        return this.chatService.getUsage(user.id);
    }

    @UseGuards(JwtGuard)
    @Get(":id")
    getSession(
        @Param("id") id: string,
        @User() user: JwtUser
    ) {
        return this.chatService.getSessionMessages(user.id, id);
    }
}
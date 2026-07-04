import {
    Controller,
    Post,
    Body,
    UseGuards,
    Req,
    Get,
    UploadedFile,
    UseInterceptors,
    BadRequestException,
    Delete,
    Param,
} from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";

import { JwtGuard } from "../auth/jwt.guard";
import { RolesGuard } from "../common/guards/roles.guard";
import { Roles } from "../common/decorators/roles.decorator";

import { KnowledgeService } from "./knowledge.service";
import { IngestDto } from "./dto/ingest.dto";
import { IngestUrlDto } from "./dto/ingest-url.dto";

const MAX_FILE_SIZE = 100 * 1024 * 1024;

@Controller("knowledge")
@UseGuards(JwtGuard, RolesGuard)
@Roles("ADMIN")
export class KnowledgeController {
    constructor(private service: KnowledgeService) { }

    @Get()
    getDocuments() {
        return this.service.getDocuments();
    }

    @Post("ingest")
    ingest(@Req() req: any, @Body() dto: IngestDto) {
        return this.service.createDocument(req.user.id, dto);
    }

    @Post("url")
    ingestUrl(@Req() req: any, @Body() dto: IngestUrlDto) {
        return this.service.createUrlDocument(req.user.id, dto);
    }

    @Post("upload")
    @UseInterceptors(
        FileInterceptor("file", {
            limits: {
                fileSize: MAX_FILE_SIZE,
            },
        })
    )
    upload(
        @Req() req: any,
        @UploadedFile() file: Express.Multer.File
    ) {
        if (!file) {
            throw new BadRequestException("Archivo requerido");
        }

        return this.service.uploadDocument(req.user.id, file);
    }

    @Delete(":id")
    deleteDocument(@Param("id") id: string) {
        return this.service.deleteDocument(id);
    }

    @Get("metrics")
    getMetrics() {
        return this.service.getMetrics();
    }
}
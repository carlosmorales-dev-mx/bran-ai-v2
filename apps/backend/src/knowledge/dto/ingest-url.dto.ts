import { IsOptional, IsString, IsUrl, MinLength } from "class-validator";

export class IngestUrlDto {
    @IsUrl()
    url!: string;

    @IsOptional()
    @IsString()
    @MinLength(3)
    title?: string;
}
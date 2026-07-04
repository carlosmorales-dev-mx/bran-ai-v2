import { IsEmail, IsString, MinLength, Matches } from "class-validator";

export class RegisterDto {
    @IsEmail()
    email!: string;

    @IsString()
    @MinLength(6)
    password!: string;

    @IsString()
    @MinLength(2)
    @Matches(/^[a-zA-Z0-9\s]+$/, {
        message: "Name contains invalid characters",
    })
    name!: string;
}
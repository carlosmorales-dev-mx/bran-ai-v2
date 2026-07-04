import {
    Body,
    Controller,
    Post,
    Get,
    UseGuards,
    Req,
} from "@nestjs/common";

import { AuthService } from "./auth.service";
import { JwtGuard } from "./jwt.guard";
import { Roles } from "../common/decorators/roles.decorator";
import { RolesGuard } from "../common/guards/roles.guard";

import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";

@Controller("auth")
export class AuthController {
    constructor(private auth: AuthService) { }

    @Post("register")
    register(@Body() dto: RegisterDto) {
        return this.auth.register(dto);
    }

    @Post("login")
    login(@Body() dto: LoginDto) {
        return this.auth.login(dto);
    }

    @UseGuards(JwtGuard)
    @Get("me")
    me(@Req() req: any) {
        return req.user;
    }

    @UseGuards(JwtGuard, RolesGuard)
    @Roles("ADMIN")
    @Get("admin-test")
    adminOnly() {
        return { message: "Solo admins 🚀" };
    }
}
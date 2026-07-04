import {
    Injectable,
    UnauthorizedException,
    BadRequestException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import * as bcrypt from "bcrypt";
import { JwtService } from "@nestjs/jwt";

import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwt: JwtService
    ) { }

    // 🔐 REGISTER
    async register(data: RegisterDto) {
        // ✅ verificar si el email ya existe
        const existing = await this.prisma.user.findUnique({
            where: { email: data.email },
        });

        if (existing) {
            throw new BadRequestException("Email already registered");
        }

        // 🔒 hash de password
        const hash = await bcrypt.hash(data.password, 10);

        const user = await this.prisma.user.create({
            data: {
                email: data.email,
                passwordHash: hash,
                name: data.name,
            },
        });

        return this.signToken(user.id, user.email);
    }

    // 🔐 LOGIN
    async login(data: LoginDto) {
        const user = await this.prisma.user.findUnique({
            where: { email: data.email },
        });

        if (!user) {
            throw new UnauthorizedException("Invalid credentials");
        }

        const valid = await bcrypt.compare(
            data.password,
            user.passwordHash
        );

        if (!valid) {
            throw new UnauthorizedException("Invalid credentials");
        }

        return this.signToken(user.id, user.email);
    }

    // 🔑 TOKEN
    private signToken(userId: string, email: string) {
        return {
            access_token: this.jwt.sign({
                sub: userId,
                email,
            }),
        };
    }
}
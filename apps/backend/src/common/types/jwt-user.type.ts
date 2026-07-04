// ✅ FIX: tipo completo — faltaban role y name que se usan en metrics y middleware
export interface JwtUser {
    id: string;
    email: string;
    name: string;
    role: "ADMIN" | "CLIENT";
}
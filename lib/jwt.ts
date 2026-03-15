// lib/jwt.ts
import { SignJWT, jwtVerify, JWTPayload } from "jose";

export type UserRole = "super_admin" | "admin" | "agent";

export interface AppJwtPayload {
  id: string;
  role: UserRole;
  branchId?: string; // 👈 optional (super_admin may not have one)
  exp: number;
}

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

/* ================= TYPE GUARD ================= */

function isAppJwtPayload(
  payload: JWTPayload
): payload is JWTPayload & AppJwtPayload {
  return (
    typeof payload.id === "string" &&
    (payload.role === "super_admin" ||
      payload.role === "admin" ||
      payload.role === "agent") &&
    typeof payload.exp === "number" &&
    (payload.branchId === undefined || typeof payload.branchId === "string")
  );
}

/* ================= SIGN ================= */

export async function signToken(
  payload: Omit<AppJwtPayload, "exp">
) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret);
}
/* ================= VERIFY ================= */

export async function verifyToken(token: string): Promise<AppJwtPayload> {
  const { payload } = await jwtVerify(token, secret);

  if (!isAppJwtPayload(payload)) {
    throw new Error("Invalid token");
  }

  return payload;
}

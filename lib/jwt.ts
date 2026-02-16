import { SignJWT, jwtVerify, JWTPayload } from "jose";

/* ================= TYPES ================= */

export type UserRole = "super_admin" | "admin" | "agent";

export interface AppJwtPayload {
  id: string;
  role: UserRole;
  exp: number;
}

/* ================= SECRET ================= */

const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

/* ================= TYPE GUARD ================= */

function isAppJwtPayload(payload: JWTPayload): payload is JWTPayload & AppJwtPayload {
  return (
    typeof payload.id === "string" &&
    (payload.role === "super_admin" ||
      payload.role === "admin" ||
      payload.role === "agent") &&
    typeof payload.exp === "number"
  );
}

/* ================= SIGN TOKEN ================= */

export async function signToken(
  payload: Omit<AppJwtPayload, "exp">
) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(secret);
}

/* ================= VERIFY TOKEN ================= */

export async function verifyToken(token: string): Promise<AppJwtPayload> {
  const { payload } = await jwtVerify(token, secret);

  if (!isAppJwtPayload(payload)) {
    throw new Error("Invalid token payload");
  }

  return {
    id: payload.id,
    role: payload.role,
    exp: payload.exp,
  };
}

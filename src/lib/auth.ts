import * as jose from "jose";
import bcrypt from "bcryptjs";

const JWT_SECRET_STRING = process.env.JWT_SECRET || "jadeed_coconut_oil_secure_jwt_secret_token_2026_06_28";
const JWT_SECRET = new TextEncoder().encode(JWT_SECRET_STRING);

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 10);
}

export async function comparePasswords(password: string, hash: string): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

export async function signJWT(payload: { userId: string; email: string }) {
  return await new jose.SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifyJWT(token: string) {
  try {
    const { payload } = await jose.jwtVerify(token, JWT_SECRET);
    return payload as { userId: string; email: string };
  } catch (error) {
    return null;
  }
}

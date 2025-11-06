import type { NextRequest } from "next/server";
import { verifyToken } from "@/lib/jwt";

export interface AuthPayload {
  id: string;
  email?: string;
  role?: string;
  status?: number;
}

export const authenticate = async (
  req: Request | NextRequest
): Promise<AuthPayload | null> => {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return null;
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token) as AuthPayload | null;

    if (!decoded) {
      return null;
    }

    return decoded;
  } catch (err) {
    console.error("Auth middleware error:", err);
    return null;
  }
};

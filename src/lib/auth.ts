import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt";

export const authenticate = async (req: NextRequest) => {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    // token valid → return data user dari JWT
    return decoded;
  } catch (err) {
    console.error("Auth middleware error:", err);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
};

// import { NextRequest } from "next/server";
// import { verifyToken } from "@/lib/jwt";

// export const authenticate = async (req: NextRequest): Promise<{ id: string; email: string } | null> => {
//   try {
//     const authHeader = req.headers.get("authorization");
//     if (!authHeader || !authHeader.startsWith("Bearer ")) {
//       return null; 
//     }

//     const token = authHeader.split(" ")[1];
//     const decoded = verifyToken(token) as { id: string; email: string };

//     if (!decoded) {
//       return null;
//     }

//     return decoded;
//   } catch (err) {
//     console.error("Auth middleware error:", err);
//     return null; 
//   }
// };
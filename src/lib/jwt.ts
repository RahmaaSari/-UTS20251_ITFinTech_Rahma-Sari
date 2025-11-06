// import jwt from "jsonwebtoken";

// export const signToken = (payload: object) => {
//   if (!process.env.JWT_SECRET) {
//     throw new Error("JWT_SECRET is not defined in environment variables");
//   }

//   return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1d" });
// };

// export const verifyToken = (token: string) => {
//   if (!process.env.JWT_SECRET) {
//     throw new Error("JWT_SECRET is not defined in environment variables");
//   }

//   try {
//     return jwt.verify(token, process.env.JWT_SECRET);
//   } catch (err) {
//     return null;
//   }
// };

import jwt from "jsonwebtoken";

interface JwtPayload {
  id: string;
  email?: string;
  name?: string;
  [key: string]: unknown;
}

export const signToken = (payload: object): string => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  return jwt.sign(payload, jwtSecret, { expiresIn: "1d" });
};

export const verifyToken = (token: string): JwtPayload | null => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  try {
    const decoded = jwt.verify(token, jwtSecret);
    
    // Validasi bahwa decoded object memiliki struktur yang diharapkan
    if (typeof decoded === 'object' && decoded !== null && 'id' in decoded) {
      return decoded as JwtPayload;
    }
    
    return null;
  } catch {
    // Tidak perlu log error di sini karena ini adalah expected behavior
    // untuk token yang invalid/expired
    return null;
  }
};
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "./jwtSecret";

export async function getUserFromToken(token: string) {
  try {
    // Verify and decode the JWT
    const payload = jwt.verify(token, JWT_SECRET);
    // The payload should contain at least id and username
    if (typeof payload === 'object' && payload && 'id' in payload && 'username' in payload) {
      // Optionally, add email if present
      return payload;
    }
    return null;
  } catch (err) {
    return null;
  }
}

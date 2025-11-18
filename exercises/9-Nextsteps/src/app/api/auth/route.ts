import { NextResponse } from "next/server";
import { login, register } from "../../../actions/auth";

export async function POST(request: Request) {
  const { username, password, email, mode } = await request.json();
  try {
    let result;
    if (mode === "register") {
      result = await register({ username, email, password });
      // After registration, auto-login
      const loginResult = await login({ username, password });
      result = loginResult;
    } else {
      result = await login({ username, password });
    }
    // Set cookie for JWT
    const response = NextResponse.json({ 
      user: result.user,
      token: result.token // Return token to client for localStorage
    });
    
    response.cookies.set("authToken", result.token, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      secure: process.env.NODE_ENV === "production",
    });
    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 401 });
  }
}

export async function DELETE() {
  // Logout: clear cookie
  const response = NextResponse.json({ ok: true });
  response.cookies.set("authToken", "", { path: "/", maxAge: 0 });
  return response;
}

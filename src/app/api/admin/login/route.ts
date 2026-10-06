import { NextRequest, NextResponse } from "next/server";
import { checkCredentials, createSessionCookieValue, COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  if (!checkCredentials(username, password)) {
    return NextResponse.json({ error: "Неверный логин или пароль" }, { status: 401 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, createSessionCookieValue(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8, // 8 часов
  });
  return res;
}

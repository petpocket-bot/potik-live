import { createHmac, timingSafeEqual } from "crypto";

const COOKIE_NAME = "admin_session";

function sign(value: string): string {
  const secret = process.env.SESSION_SECRET || "insecure-dev-secret";
  const sig = createHmac("sha256", secret).update(value).digest("hex");
  return `${value}.${sig}`;
}

function verify(token: string): boolean {
  const secret = process.env.SESSION_SECRET || "insecure-dev-secret";
  const [value, sig] = token.split(".");
  if (!value || !sig) return false;
  const expected = createHmac("sha256", secret).update(value).digest("hex");
  try {
    return timingSafeEqual(Buffer.from(sig), Buffer.from(expected));
  } catch {
    return false;
  }
}

export function checkCredentials(username: string, password: string): boolean {
  return (
    username === process.env.ADMIN_USERNAME &&
    password === process.env.ADMIN_PASSWORD &&
    !!process.env.ADMIN_PASSWORD
  );
}

export function createSessionCookieValue(): string {
  return sign(`admin:${Date.now()}`);
}

export function isValidSession(cookieValue: string | undefined): boolean {
  if (!cookieValue) return false;
  return verify(cookieValue);
}

export { COOKIE_NAME };

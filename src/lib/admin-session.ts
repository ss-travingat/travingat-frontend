import crypto from "crypto";

const SESSION_COOKIE_NAME = "travingat_admin_session";
const SESSION_TTL_SECONDS = 12 * 60 * 60;

function getSessionSecret() {
  return process.env.ADMIN_SESSION_SECRET || "change-this-admin-session-secret";
}

function signPayload(payload: string) {
  return crypto
    .createHmac("sha256", getSessionSecret())
    .update(payload)
    .digest("hex");
}

export function getAdminSessionCookieName() {
  return SESSION_COOKIE_NAME;
}

export function getAdminSessionMaxAgeSeconds() {
  return SESSION_TTL_SECONDS;
}

export function createAdminSessionToken() {
  const exp = Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS;
  const nonce = crypto.randomBytes(12).toString("hex");
  const payload = `${exp}.${nonce}`;
  const sig = signPayload(payload);
  return `${payload}.${sig}`;
}

export function verifyAdminSessionToken(token: string) {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;

  const expRaw = parts[0];
  const nonce = parts[1];
  const providedSig = parts[2];

  const exp = Number(expRaw);
  if (!Number.isFinite(exp) || exp <= Math.floor(Date.now() / 1000)) {
    return false;
  }

  const payload = `${expRaw}.${nonce}`;
  const expectedSig = signPayload(payload);

  const providedBuf = Buffer.from(providedSig, "hex");
  const expectedBuf = Buffer.from(expectedSig, "hex");
  if (providedBuf.length !== expectedBuf.length) return false;

  return crypto.timingSafeEqual(providedBuf, expectedBuf);
}

export function isAdminPasswordValid(input: string) {
  const configured = process.env.ADMIN_DASHBOARD_PASSWORD || "";
  if (!configured || !input) return false;

  const a = Buffer.from(configured);
  const b = Buffer.from(input);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

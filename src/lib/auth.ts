import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { logEvent } from "@/utils/sentry";

const secret = new TextEncoder().encode(process.env.AUTH_SECRET);
const cookieName = "auth-token";

// encrypts and signs the payload, returning a JWT
export async function signAuthToken(payload: any) {
    try {
        const token = await new SignJWT(payload)
            .setProtectedHeader({ alg: "HS256" })
            .setIssuedAt()
            .setExpirationTime("1h")
            .sign(secret);
        return token;
    } catch (error) {
        logEvent("Token signing error", 'auth', {payload}, 'error', error);
        throw new Error("Failed to sign auth token");
    }
}

// decrypt and verifies the JWT, returning the payload
export async function verifyAuthToken<T>(token: string): Promise<T> {
    try {
        const { payload } = await jwtVerify(token, secret);
        return payload as T;
    } catch (error) {
        logEvent("Token decryption or verification error", 'auth', {token}, 'error', error);
        throw new Error("Token decryption or verification failed");
    }
}

// set the auth cookie
export async function setAuthCookie(token: string) {
    try {
        const cookieStore = await cookies();
        cookieStore.set(cookieName, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
            maxAge: 60 * 60 * 24 * 7 // 1 week
        });
        return true;
    }
    catch (error) {
        logEvent("Setting auth cookie error", 'auth', {token}, 'error', error);
        throw new Error("Failed to set auth cookie");
    }
}

// get auth token from cookie
export async function getAuthCookie() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get(cookieName)?.value || null;
        if (!token) {
            logEvent("Auth token not found in cookie", 'auth', {}, 'warning');
            return null;
        }
        return token || null;
    } catch (error) {
        logEvent("Getting auth cookie error", 'auth', {}, 'error', error);
        throw new Error("Failed to get auth cookie");
    }
}

// remove auth token cookie
export async function removeAuthCookie() {
    try {
        const cookieStore = await cookies();
        cookieStore.delete(cookieName);
        return true;
    }
    catch (error) { 
        logEvent("failed removing auth cookie error", 'auth', {}, 'error', error);
        throw new Error("Failed to remove auth cookie");
    }
}
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';

const SESSION_COOKIE_NAME = 'cart_session_id';
const SESSION_MAX_AGE = 7 * 24 * 60 * 60; // 7 days in seconds

/**
 * Get or create a session ID
 * Returns existing session ID from cookie, or creates a new one
 */
export async function getOrCreateSessionId(): Promise<string> {
    const cookieStore = await cookies();
    const existingSessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (existingSessionId) {
        return existingSessionId;
    }

    // Create new session ID
    const newSessionId = uuidv4();

    // Set cookie
    cookieStore.set(SESSION_COOKIE_NAME, newSessionId, {
        httpOnly: true,
        secure: process.env.APP_ENV === 'prod',
        sameSite: 'lax',
        maxAge: SESSION_MAX_AGE,
        path: '/',
    });

    return newSessionId;
}

/**
 * Get existing session ID without creating a new one
 * Returns null if no session exists
 */
export async function getSessionId(): Promise<string | null> {
    const cookieStore = await cookies();
    return cookieStore.get(SESSION_COOKIE_NAME)?.value || null;
}

/**
 * Clear the session cookie
 */
export async function clearSession(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Calculate TTL timestamp (7 days from now)
 * Returns Unix timestamp in seconds
 */
export function calculateTTL(): number {
    const now = Math.floor(Date.now() / 1000);
    return now + SESSION_MAX_AGE;
}

import * as admin from 'firebase-admin';
import { cookies } from 'next/headers';

// This configuration is now robust. If the environment variables are missing,
// the server will fail to start with a clear error message, preventing runtime issues.
if (!admin.apps.length) {
    try {
        admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                // Replace escaped newlines for the private key
                privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
            }),
        });
    } catch (error) {
        console.error('Firebase Admin SDK Initialization Error:', error);
        // We throw the error to prevent the app from running in a misconfigured state.
        throw new Error('Could not initialize Firebase Admin SDK. Please check server logs and .env.local file.');
    }
}

const authAdminInstance = admin.auth();

async function getDecodedIdToken() {
    const sessionCookie = cookies().get('firebase-session')?.value;
    if (!sessionCookie) return null;

    try {
        const decodedIdToken = await authAdminInstance.verifySessionCookie(sessionCookie, true);
        return decodedIdToken;
    } catch (error) {
        // Session cookie is invalid or expired.
        return null;
    }
}

// Export the initialized admin auth instance.
export const auth = authAdminInstance;

// Also export the helper function separately.
// This avoids potential issues with `this` context when spreading the auth object.
export const session = {
    getDecodedIdToken,
};

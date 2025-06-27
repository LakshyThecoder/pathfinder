import * as admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin';
import { cookies } from 'next/headers';

if (!admin.apps.length) {
    const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_JSON_BASE64;

    if (!serviceAccountBase64) {
        throw new Error('Firebase service account key is not set in .env.local. Please set FIREBASE_SERVICE_ACCOUNT_JSON_BASE64.');
    }

    try {
        const decodedServiceAccount = Buffer.from(serviceAccountBase64, 'base64').toString('utf-8');
        const serviceAccount = JSON.parse(decodedServiceAccount) as ServiceAccount;
        
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
    } catch (error: any) {
        console.error('Firebase Admin SDK Initialization Error:', error.message);
        throw new Error('Could not initialize Firebase Admin SDK. The service account JSON may be malformed or invalid. Please check your .env.local file.');
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

export const auth = authAdminInstance;

export const session = {
    getDecodedIdToken,
};

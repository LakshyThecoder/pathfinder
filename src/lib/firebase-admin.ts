import * as admin from 'firebase-admin';
import { cookies } from 'next/headers';

let app: admin.app.App;

// Check for required environment variables
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

const hasAdminConfig = projectId && clientEmail && privateKey;

if (!admin.apps.length) {
    if (hasAdminConfig) {
        try {
            app = admin.initializeApp({
                credential: admin.credential.cert({
                    projectId,
                    clientEmail,
                    privateKey,
                }),
            });
        } catch (error: any) {
            console.error('Firebase Admin SDK initialization failed:', error.message);
        }
    }
} else {
    app = admin.app();
}

async function getDecodedIdToken() {
    const session = cookies().get('firebase-session')?.value;
    if (!session || !admin.apps.length) return null;

    try {
        const decodedIdToken = await admin.auth().verifySessionCookie(session, true);
        return decodedIdToken;
    } catch (error) {
        return null;
    }
}

const auth = {
    ...(admin.apps.length ? admin.auth() : {}),
    getDecodedIdToken,
};

export { auth };

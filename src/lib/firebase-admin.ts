import * as admin from 'firebase-admin';
import { cookies } from 'next/headers';

let app: admin.app.App;

if (!admin.apps.length) {
    app = admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        }),
    });
} else {
    app = admin.app();
}


async function getDecodedIdToken() {
    const session = cookies().get('firebase-session')?.value;

    if (!session) return null;

    try {
        const decodedIdToken = await admin.auth().verifySessionCookie(session, true);
        return decodedIdToken;
    } catch (error) {
        console.error('Error verifying session cookie:', error);
        return null;
    }
}

const auth = {
    ...admin.auth(app),
    getDecodedIdToken,
};

export { auth };

import firestore from '@react-native-firebase/firestore';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

const FIREBASE_API_KEY = 'AIzaSyCjK2XwTK9QcNXolPNarmuTfU1C9QjQ0yY';

export const googleLogin = async () => {
    await GoogleSignin.configure({
        webClientId: '713389405869-i9nr2ubuu2k26lhr1go48hl9or0bfkbc.apps.googleusercontent.com',
        offlineAccess: true,
    });
    try {
        await GoogleSignin.hasPlayServices();
        const userInfo = await GoogleSignin.signIn();
        // Debug the userInfo to check idToken presence
        console.log('Google userInfo:', userInfo);

        // Make sure idToken exists
        let idToken = userInfo.idToken;
        if (!idToken) {
            const tokens = await GoogleSignin.getTokens();
            idToken = tokens.idToken;
        }
        if (!idToken)
            throw new Error('Failed to get idToken from Google Sign-In');

        const response = await fetch(
            `https://identitytoolkit.googleapis.com/v1/accounts:signInWithIdp?key=${FIREBASE_API_KEY}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    postBody: `id_token=${idToken}&providerId=google.com`,
                    requestUri: 'http://localhost',
                    returnIdpCredential: true,
                    returnSecureToken: true,
                }),
            }
        );

        const firebaseData = await response.json();
        if (firebaseData.error)
            throw new Error(firebaseData.error.message);

        const userId = firebaseData.localId;
        await firestore().collection('users').doc(userId).set(
            {
                ...firebaseData,
                name: firebaseData.displayName,
                lastLogin: firestore.FieldValue.serverTimestamp(),
            },
            { merge: true }
        );

        return { uid: userId, ...firebaseData };
    } catch (error) {
        console.error('Google Login Error:', error);
        throw error;
    }
};
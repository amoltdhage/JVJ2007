import { auth, firestore } from "./firebase";

export default function AuthenticationService() {

    const SignUpService = async (requestBody) => {
        try {
            const userCredential = await auth().createUserWithEmailAndPassword(requestBody.email, requestBody.password);
            const uid = userCredential.user.uid;

            await firestore().collection('users').doc(uid).set({
                id: uid,
                uid,
                ...requestBody,
                createdAt: firestore.FieldValue.serverTimestamp()
            });

            console.log('Signup successful', userCredential);
            return { success: true, uid };
        } catch (error) {
            console.error('Signup error:', error);
            return { success: false, error: error.message };
        }
    };

    const LoginService = async (email, password) => {
        try {
            const userCredential = await auth().signInWithEmailAndPassword(email, password);
            const uid = userCredential.user.uid;

            // Fetch user profile from Firestore
            const userDoc = await firestore().collection('users').doc(uid).get();
            if (userDoc.exists) {
                console.log('User data:', userDoc.data());
                return { success: true, data: userDoc.data() };
            } else {
                console.log('No user profile found');
                return { success: false, error: 'No profile found' };
            }
        } catch (error) {
            console.error('Login error:', error);
            return { success: false, error: error.message };
        }
    };

    return { SignUpService, LoginService };
}
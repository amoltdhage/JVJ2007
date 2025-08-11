import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

export const configureGoogleSignIn = (webClientId) => {
  GoogleSignin.configure({
    webClientId,
    offlineAccess: true
  });
};

export const googleLogin = async () => {
  try {
    // 1. Prompt user to sign in
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
    const { idToken } = await GoogleSignin.signIn();

    // 2. Create a Google credential
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);

    // 3. Sign in with credential
    const userCredential = await auth().signInWithCredential(googleCredential);

    const user = userCredential.user;

    await firestore().collection('users').doc(user.uid).set(
      {
        name: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        lastLogin: firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    return user;
  } catch (error) {
    console.error('Google Login Error:', error);
    throw error;
  }
};
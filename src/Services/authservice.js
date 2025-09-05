import { useDispatch } from 'react-redux';
import { auth } from './firebase';
import {
  loginAction,
  logoutAction,
} from '../Redux/Actions/AuthAction/LoginAction';
import { addCollection, fetchCollection } from './firestoreServices';
import { useLoading } from '../../LoadingContext';
import { Alert } from 'react-native';
import toast from './ToasterService';

export default function AuthenticationService() {
  const dispatch = useDispatch();
  const { startLoading, stopLoading } = useLoading();

  const SignUpService = async (requestBody, password) => {
    try {
      startLoading();
      const signInMethods = await auth().fetchSignInMethodsForEmail(requestBody.email);
      if(signInMethods.length > 0) {
        toast.error("Email already exist", 3000);
        return;
      }
      const userCredential = await auth().createUserWithEmailAndPassword(
        requestBody.email,
        password,
      );
      const uid = userCredential.user.uid;
      const responseData = {
        id: uid,
        uid,
        ...requestBody,
        createdAt: new Date().toISOString(),
        isPaid: false,
        isAllowAnother: false,
        attending: true,
      };
      await addCollection('users', uid, responseData);
      await userCredential.user.sendEmailVerification();
      Alert.alert(
        'Signup Successful',
        'A verification email has been sent to your email address. Please verify your email before logging in.',
      );
      // dispatch(loginAction(uid));
      return { success: true, uid };
    } catch (error) {
      console.log('error', error);
    } finally {
      stopLoading();
    }
  };

  const LoginService = async (email, password) => {
    try {
      startLoading();
      const userCredential = await auth().signInWithEmailAndPassword(
        email,
        password,
      );

      if (!userCredential?.user?.emailVerified) {
        await auth().signOut();
        Alert.alert(
          'Email Not Verified',
          'Please verify your email address before logging in. Would you like us to resend the verification email?',
          [
            { text: 'Cancel', style: 'cancel' },
            {
              text: 'Resend',
              onPress: () => sendVerificationEmail(userCredential.user),
            },
          ],
        );
        stopLoading();
        return;
      }

      const uid = userCredential.user.uid;

      const userDoc = await fetchCollection('users', uid);
      if (userDoc) {
        dispatch(loginAction(userDoc.uid));
        return { success: true, data: userDoc };
      } else return { success: false, error: 'No profile found' };
    } catch (error) {
      let errorMessage = error.message;

      if (error.code === 'auth/user-not-found') {
        errorMessage = 'No account found with this email address.';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address format.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage =
          'Too many failed login attempts. Please try again later.';
      }

      if (
        error.code === 'auth/user-not-found' ||
        error.code === 'auth/wrong-password'
      ) {
        toast.error(errorMessage, 3000);
      }
      return { success: false, error: errorMessage };
    } finally {
      stopLoading();
    }
  };

  const sendVerificationEmail = async user => {
    try {
      await user?.sendEmailVerification();
      Alert.alert(
        'Verification email sent',
        'Please check your inbox and verify your email address.',
      );
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const logout = async (message = null) => {
    try {
      await auth().signOut();
      dispatch(logoutAction());
      console.log(message || 'User signed out!');
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      stopLoading();
    }
  };

  return { SignUpService, LoginService, logout };
}

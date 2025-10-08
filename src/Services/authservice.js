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
import { useNavigation } from '@react-navigation/native';

export default function AuthenticationService() {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const { startLoading, stopLoading } = useLoading();

  const SignUpService = async (requestBody, password) => {
    try {
      startLoading();
      const signInMethods = await auth().fetchSignInMethodsForEmail(
        requestBody.email,
      );
      if (signInMethods.length > 0) {
        toast.error('Email already exist', 3000);
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
        attending: '',
      };
      await addCollection('users', uid, responseData);
      await userCredential.user.sendEmailVerification();
      Alert.alert(
        'Signup Successful-साइनअप यशस्वी झाला आहे',
        `A verification email has been sent to your email address. Please verify your email before logging in.
        
        तुमच्या ईमेल पत्त्यावर एक पडताळणी (Verification) ईमेल पाठवण्यात आला आहे.
        कृपया त्या ईमेलमधील लिंकवर क्लिक करून तुमचं खाते (Account) सत्यापित करा.

        जर ईमेल इनबॉक्समध्ये दिसत नसेल, तर Gmail मधील Spam फोल्डर तपासा.
        तिथे तुम्हाला “noreply - Verify email for JVJ-Reconnect” अशा शीर्षकाचा ईमेल दिसेल.
        त्या ईमेलमधील निळ्या रंगाच्या लिंकवर क्लिक करा आणि तुमचं Gmail खाते पडताळा (Verify).

        एकदा पडताळणी पूर्ण झाल्यावर,
        तुमच्या ॲपमध्ये परत जा, लॉगिन करा, आणि ॲप वापरण्यास सुरुवात करा.`,
        [
          {
            text: 'OK',
            onPress: () => {
              navigation.navigate('login');
            },
          },
        ]
      );

      // dispatch(loginAction(uid));
      return { success: true, uid };
    } catch (error) {
      console.log('error', error);

      let errorMessage = 'An unexpected error occurred. Please try again.';

      // Handle specific Firebase error codes
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Email already exists';
          break;
        case 'auth/invalid-email':
          errorMessage = 'The email address is not valid.';
          break;
        case 'auth/operation-not-allowed':
          errorMessage = 'Email/password accounts are not enabled.';
          break;
        case 'auth/weak-password':
          errorMessage = 'The password is too weak.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'A network error occurred.';
          break;
        default:
          errorMessage = error.message || 'An unexpected error occurred.';
      }
      toast.error(errorMessage, 3000);
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
          'Email Not Verified - ईमेल पडताळणी झाली नाही',
          'Please verify your email address before logging in'
          `कृपया लॉगिन करण्यापूर्वी तुमचा ईमेल पत्ता पडताळा.
        
          तुमच्या ईमेल पत्त्यावर एक पडताळणी (Verification) ईमेल पाठवण्यात आला आहे.
          कृपया त्या ईमेलमधील लिंकवर क्लिक करून तुमचं खाते (Account) सत्यापित करा.

          जर ईमेल इनबॉक्समध्ये दिसत नसेल, तर Gmail मधील Spam फोल्डर तपासा.
          तिथे तुम्हाला “noreply - Verify email for JVJ-Reconnect” अशा शीर्षकाचा ईमेल दिसेल.
          त्या ईमेलमधील निळ्या रंगाच्या लिंकवर क्लिक करा आणि तुमचं Gmail खाते पडताळा (Verify).

          एकदा पडताळणी पूर्ण झाल्यावर,
          तुमच्या ॲपमध्ये परत जा, लॉगिन करा, आणि ॲप वापरण्यास सुरुवात करा.`,
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
      if (error?.code === 'auth/user-not-found') {
        toast.error('No account found with this email address.', 3000);
      } else if (error?.code === 'auth/invalid-credential') {
        toast.error('Invalid email or password.', 3000);
      } else if (error?.code === 'auth/wrong-password') {
        toast.error('Incorrect password. Please try again.', 3000);
      } else if (error?.code === 'auth/invalid-email') {
        toast.error('Invalid email address format.', 3000);
      } else if (error?.code === 'auth/too-many-requests') {
        toast.error(
          'Too many failed login attempts. Please try again later.',
          3000,
        );
      } else {
        toast.error(error.message, 3000);
      }
      console.log('error: ', error, error.code);
      return { success: false, error: error.message };
    } finally {
      stopLoading();
    }
  };

  const sendPasswordResetEmail = async email => {
    try {
      startLoading();

      await auth().sendPasswordResetEmail(email);
      toast.success(`Password reset link sent to ${email}`, 3000);
      return { success: true, message: 'Password reset email sent' };
    } catch (error) {
      let errorMessage = error.message;

      if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address format.';
      } else if (
        ['auth/user-not-found', 'auth/invalid-credential'].includes(error?.code)
      ) {
        errorMessage = 'No account found with this email address.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many attempts. Please try again later.';
      }
      toast.error(errorMessage, 3000);
      return { success: false, error: errorMessage };
    } finally {
      stopLoading();
    }
  };

  const confirmPasswordReset = async (code, newPassword) => {
    try {
      startLoading();
      await auth().confirmPasswordReset(code, newPassword);
      return { success: true, message: 'Password reset successful' };
    } catch (error) {
      let errorMessage = error.message;
      if (error.code === 'auth/expired-action-code') {
        errorMessage =
          'The reset code has expired. Please request a new password reset.';
      } else if (error.code === 'auth/invalid-action-code') {
        errorMessage =
          'Invalid reset code. Please check the code and try again.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage =
          'Password is too weak. Please choose a stronger password.';
      }
      toast.error(errorMessage, 3000);
      return { success: false, error: errorMessage };
    } finally {
      stopLoading();
    }
  };

  const logout = async (message = null) => {
    try {
      await auth().signOut();
      dispatch(logoutAction());
      if (message) toast.success(message, 3000);
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      stopLoading();
    }
  };

  return {
    SignUpService,
    LoginService,
    logout,
    sendPasswordResetEmail,
    confirmPasswordReset,
  };
}

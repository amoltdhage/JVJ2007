import { useDispatch } from 'react-redux';
import { auth } from './firebase';
import {
  loginAction,
  logoutAction,
} from '../Redux/Actions/AuthAction/LoginAction';
import { addCollection, fetchCollection } from './firestoreServices';

export default function AuthenticationService() {
  const dispatch = useDispatch();

  const SignUpService = async (requestBody, password) => {
    try {
      const userCredential = await auth().createUserWithEmailAndPassword(
        requestBody.email,
        password,
      );
      const uid = userCredential.user.uid;
      const responseData = {
        id: uid,
        uid,
        ...requestBody,
        createdAt: new Date(),
      };
      await addCollection('users', uid, responseData);
      dispatch(loginAction(uid));
      return { success: true, uid };
    } catch (error) {
      logout();
    }
  };

  const LoginService = async (email, password) => {
    try {
      const userCredential = await auth().signInWithEmailAndPassword(
        email,
        password,
      );
      const uid = userCredential.user.uid;

      const userDoc = await fetchCollection('users', uid);
      if (userDoc) {
        dispatch(loginAction(userDoc.uid));
        return { success: true, data: userDoc };
      } else {
        console.log('No user profile found');
        logout();
        return { success: false, error: 'No profile found' };
      }
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  const logout = async (message = null) => {
    try {
      await auth().signOut();
      dispatch(logoutAction());
      console.log(message || 'User signed out!');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return { SignUpService, LoginService, logout };
}
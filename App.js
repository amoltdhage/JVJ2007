import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import BottomTabs from './src/navigation/BottomTabs';
import { useLoading } from './LoadingContext';
import { useSelector } from "react-redux";
import { GoogleSignin } from '@react-native-google-signin/google-signin';


const Stack = createNativeStackNavigator();

const GOOGLE_WEB_CLIENT_ID = '713389405869-i9nr2ubuu2k26lhr1go48hl9or0bfkbc.apps.googleusercontent.com';

export default function App() {
  useEffect(() => {
    GoogleSignin.configure({ webClientId: GOOGLE_WEB_CLIENT_ID });
  }, [])
  const { isLoading } = useLoading();
  const auth = useSelector((state) => state.auth);

  if (isLoading) {
    return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Splash" component={SplashScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {auth?.isAuthenticated ? (
          <Stack.Screen name="Home" component={BottomTabs} />
        ) : (
          <>
            {/* <Stack.Screen name="Home" component={BottomTabs} /> */}
            <Stack.Screen name="Auth" component={LoginScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
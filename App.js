import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SplashScreen from './src/screens/SplashScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import BottomTabs from './src/navigation/BottomTabs';
import { useLoading } from './LoadingContext';
import { useSelector } from 'react-redux';
import AuthenticationService from './src/Services/authservice';

const Stack = createNativeStackNavigator();

export default function App() {
  const { isLoading } = useLoading();
  const { logout } = AuthenticationService();
  const auth = useSelector(state => state.auth);

  useEffect(() => {
    if (!auth?.isAuthenticated) {
      logout();
    }
  }, []);

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
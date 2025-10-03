import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from './src/screens/Unauthenticated/LoginScreen';
import SignUpScreen from './src/screens/Unauthenticated/SignUpScreen';
import BottomTabs from './src/navigation/BottomTabs';
import { useSelector } from 'react-redux';
import Toast from 'react-native-toast-message';
import ResetPassword from './src/screens/Unauthenticated/ResetPassword';
import DrawerNav from './src/navigation/DrawerNavigation';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const Stack = createNativeStackNavigator();

export default function App() {
  const auth = useSelector(state => state.auth);

  return (
    <GestureHandlerRootView style={{flex: 1}}>
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {auth?.isAuthenticated ? (
          <Stack.Screen name="Drawer" component={DrawerNav} />
        ) : (
          <>
            <Stack.Screen name="Auth" component={LoginScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
            <Stack.Screen name="ResetPassword" component={ResetPassword} />
          </>
        )}
      </Stack.Navigator>
      <Toast />
    </NavigationContainer>
    </GestureHandlerRootView>
  );
}
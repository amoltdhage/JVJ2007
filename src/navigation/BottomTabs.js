import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ProfileScreen from '../screens/ProfileScreen';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import HomeStackScreen from './HomeStack';
import ChatScreen from '../screens/ChatScreen';
const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, size }) => {
          let iconName;

          if (route.name === 'Home') iconName = 'home';
          else if (route.name === 'Chat') iconName = 'chat';
          else if (route.name === 'Profile') iconName = 'person';

          const color = focused ? 'yellow' : 'white';

          return <MaterialIcon name={iconName} size={size} color={color} />;
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        tabBarActiveTintColor: 'yellow', // Selected label color
        tabBarInactiveTintColor: 'white', // Unselected label color
        tabBarStyle: {
          // position: 'absolute',
          borderTopLeftRadius: 20,
          borderTopRightRadius: 20,
          backgroundColor: '#002b5c',
          overflow: 'hidden',
          elevation: 10,
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowOffset: { width: 0, height: -2 },
          shadowRadius: 10,
        },
        headerShown: false,
      })}
    >
      {/* <Tab.Screen name="Home" component={HomeScreen} /> */}
      <Tab.Screen name="Home" component={HomeStackScreen} />
      <Tab.Screen name="Chat" component={ChatScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
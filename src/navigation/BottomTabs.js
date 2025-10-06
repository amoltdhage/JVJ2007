import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import ProfileScreen from '../screens/Authenticated/ProfileScreen';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import HomeStackScreen from './HomeStack';
import GroupChatScreen from '../screens/Authenticated/GroupChatScreen';
import UsersListScreen from '../screens/Authenticated/UsersListScreen';
import { useSelector } from 'react-redux';
import { fetchCollection } from '../Services/firestoreServices';

const Tab = createBottomTabNavigator();

export default function BottomTabs() {
  const userId = useSelector(state => state.auth?.user);
  const [userDetail, setUserDetail] = useState(null);

  useEffect(() => {
    if (userId && !userDetail) getUserDetail(userId);
  }, [userId]);

  const getUserDetail = async id => {
    const userData = await fetchCollection('users', id);
    setUserDetail(userData);
  };

  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, size }) => {
          let iconName;

          if (route.name === 'Home') iconName = 'home';
          else if (route.name === 'Attendees') iconName = 'people';
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
      <Tab.Screen name="Home" component={HomeStackScreen} />
      <Tab.Screen name="Chat" component={GroupChatScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
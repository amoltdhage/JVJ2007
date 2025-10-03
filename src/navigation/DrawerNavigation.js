import React, { useEffect, useState } from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import BottomTabs from './BottomTabs';
import { useSelector } from 'react-redux';
import { fetchCollection } from '../Services/firestoreServices';
import UsersListScreen from '../screens/Authenticated/UsersListScreen';
import ApprovalCertificate from '../screens/Authenticated/ApprovalCertificate';

const Drawer = createDrawerNavigator();

export default function DrawerNav() {
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
    <Drawer.Navigator
      screenOptions={{
        headerShown: false, // Disable default header
        drawerStyle: {
          backgroundColor: '#002b5c',
          width: 250,
        },
        drawerLabelStyle: {
          color: 'white',
          fontSize: 16,
          fontWeight: '600',
        },
      }}
    >
      <Drawer.Screen
        name="MainTabs"
        component={BottomTabs}
        options={{ title: 'Home' }}
      />
      {userDetail?.email?.toLowerCase() === 'nishantjain951@gmail.com' ||
      userDetail?.email?.toLowerCase() === 'amoltd11@gmail.com' ? (
        <Drawer.Screen name="Attendees" component={UsersListScreen} />
      ) : null}
      <Drawer.Screen name="Approval Certificate" component={ApprovalCertificate} />
    </Drawer.Navigator>
  );
}

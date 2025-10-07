import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, Dimensions } from 'react-native';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItem,
} from '@react-navigation/drawer';
import AntDesign from 'react-native-vector-icons/AntDesign';
import { useSelector } from 'react-redux';
import { showMessage } from 'react-native-flash-message';
import BottomTabs from './BottomTabs';
import { fetchCollection } from '../Services/firestoreServices';
import AuthenticationService from '../Services/authservice';
import UsersListScreen from '../screens/Authenticated/UsersListScreen';
import ApprovalCertificate from '../screens/Authenticated/ApprovalCertificate';
import About from '../screens/Authenticated/About';
import ContactUs from '../screens/Authenticated/ContactUs';
import PaymentsScreen from '../screens/Authenticated/PaymentsScreen';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import ExpenseScreen from '../screens/Authenticated/ExpenseScreen';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';


const Drawer = createDrawerNavigator();
const { width } = Dimensions.get('window');

export default function DrawerNav() {
  const userId = useSelector(state => state.auth?.user);
  const [userDetail, setUserDetail] = useState(null);
  const { logout } = AuthenticationService();

  useEffect(() => {
    if (userId && !userDetail) getUserDetail(userId);
  }, [userId]);

  const getUserDetail = async id => {
    const userData = await fetchCollection('users', id);
    setUserDetail(userData);
  };

  const handleLogout = async navigation => {
    try {
      await logout();
      showMessage({
        message: 'Logged out successfully!',
        type: 'success',
        duration: 2000,
      });
      navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
    } catch (err) {
      console.log('Logout Error:', err);
    }
  };

  const CustomDrawerContent = props => {
    const { navigation } = props;

    return (
      <View style={{ flex: 1, backgroundColor: '#002b5c' }}>
        <DrawerContentScrollView
          {...props}
          contentContainerStyle={{ flexGrow: 1 }}
        >
          {/* Profile Header */}
          <View style={styles.profileHeader}>
            {userDetail?.profileImage ? (
              <Image
                source={{ uri: userDetail.profileImage }}
                style={styles.profileImage}
              />
            ) : (
              <View style={[styles.profileImage, styles.iconPlaceholder]}>
                <AntDesign name="user" size={40} color="#FF4081" />
              </View>
            )}
            <View style={styles.profileTextContainer}>
              <Text
                style={styles.profileName}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {userDetail?.firstName || 'User'} {userDetail?.lastName || ''}
              </Text>
              <Text
                style={styles.profileEmail}
                numberOfLines={2}
                ellipsizeMode="tail"
              >
                {userDetail?.email || 'user@example.com'}
              </Text>
            </View>
          </View>

          <View style={styles.separatorLine} />

          {/* Drawer Items */}
          <DrawerItem
            label={() => <DrawerLabel label="Home" />}
            icon={({ size }) => (
              <AntDesign name="home" size={size} color="white" />
            )}
            onPress={() => navigation.navigate('MainTabs')}
          />
          <DrawerItem
            label={() => <DrawerLabel label="Attendees" />}
            icon={({ size }) => (
              <AntDesign name="team" size={size} color="white" />
            )}
            onPress={() => navigation.navigate('Attendees')}
          />
          <DrawerItem
            label={() => <DrawerLabel label="Payment Collection" />}
            icon={({ size }) => (
              <MaterialIcons name="payments" size={size} color="white" />
            )}
            onPress={() => navigation.navigate('PaymentsScreen')}
          />
          <DrawerItem
            label={() => <DrawerLabel label="Expenses" />}
            icon={({ size }) => (
              <FontAwesome name="money" size={size} color="white" />
            )}
            onPress={() => navigation.navigate('ExpenseScreen')}
          />
          <DrawerItem
            label={() => <DrawerLabel label="Approval Certificate" />}
            icon={({ size }) => (
              <AntDesign name="filetext1" size={size} color="white" />
            )}
            onPress={() => navigation.navigate('Approval Certificate')}
          />
          <DrawerItem
            label={() => <DrawerLabel label="About Us" />}
            icon={({ size }) => (
              <AntDesign name="infocirlceo" size={size} color="white" />
            )}
            onPress={() => navigation.navigate('About')}
          />
          <DrawerItem
            label={() => <DrawerLabel label="Contact Us" />}
            icon={({ size }) => (
              <MaterialCommunityIcons name="card-account-phone" size={size} color="white" />
            )}
            onPress={() => navigation.navigate('ContactUs')}
          />

          <DrawerItem
            label={() => <DrawerLabel label="Logout" />}
            icon={({ size }) => (
              <MaterialIcons name="logout" size={size} color="white" />
              // <AntDesign name="poweroff" size={size} color="white" />
            )}
            onPress={() => handleLogout(navigation)}
          />
        </DrawerContentScrollView>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.appName} numberOfLines={1} ellipsizeMode="tail">
            JVJ Reconnect 2007
          </Text>
          <Text
            style={styles.appVersion}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            App Version: 1.0.0
          </Text>
          <Text
            style={styles.developedBy}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            Developed by: Amol Dhage & Nishant J
          </Text>
        </View>
      </View>
    );
  };

  const DrawerLabel = ({ label }) => (
    <Text style={styles.labelText} numberOfLines={1} ellipsizeMode="tail">
      {label}
    </Text>
  );

  return (
    <Drawer.Navigator
      drawerContent={props => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerStyle: {
          backgroundColor: '#002b5c',
          width: width * 0.95, // ✅ 95% width
        },
      }}
    >
      <Drawer.Screen
        name="MainTabs"
        component={BottomTabs}
        options={{ title: 'Home' }}
      />
      <Drawer.Screen name="Attendees" component={UsersListScreen} />
      <Drawer.Screen
        name="Approval Certificate"
        component={ApprovalCertificate}
      />
      <Drawer.Screen name="PaymentsScreen" component={PaymentsScreen} />
      <Drawer.Screen name="About" component={About} />
      <Drawer.Screen name="ContactUs" component={ContactUs} />
      <Drawer.Screen name="ExpenseScreen" component={ExpenseScreen} />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#003c80',
    paddingVertical: 20,
    paddingHorizontal: 16,
    width: '100%',
    borderRadius: 15,
    marginTop: 8,
  },
  profileImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 16,
    borderWidth: 2,
    borderColor: '#f3f0f1ff',
    backgroundColor: '#FFF0F5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconPlaceholder: {
    backgroundColor: '#FFE4EC',
  },
  profileTextContainer: {
    flex: 1, // ✅ allows text to wrap within available space
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#c1e7f9ff',
    flexShrink: 1,
    numberOfLines: 2,
  },
  profileEmail: {
    fontSize: 14,
    color: '#fff',
    marginTop: 4,
    flexShrink: 1,
    numberOfLines: 2,
  },
  separatorLine: {
    height: 1,
    backgroundColor: '#c1e7f9ff',
    marginHorizontal: 16,
    marginVertical: 10,
  },
  labelText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
    flexShrink: 1,
    numberOfLines: 2,
  },
  footer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderColor: '#c1e7f9ff',
    backgroundColor: '#003c80',
    alignItems: 'flex-start',
    marginBottom: 50,
  },
  appName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#c1e7f9ff',
    flexShrink: 1,
    width: '100%',
    numberOfLines: 2,
  },
  appVersion: {
    fontSize: 14,
    color: '#fff',
    marginTop: 2,
    flexShrink: 1,
    width: '100%',
    numberOfLines: 2,
  },
  developedBy: {
    fontSize: 12,
    color: '#ddd',
    marginTop: 2,
    flexShrink: 1,
    numberOfLines: 2,
    width: '100%',
  },
});

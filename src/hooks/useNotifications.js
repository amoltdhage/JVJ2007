// hooks/useNotifications.js
import { useEffect } from 'react';
import messaging from '@react-native-firebase/messaging';
import { Alert } from 'react-native';

const useNotifications = (userId) => {
  useEffect(() => {
    if (!userId) return;

    // Request permission for notifications
    const requestUserPermission = async () => {
      const authStatus = await messaging().requestPermission();
      const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;

      if (enabled) {
        console.log('Authorization status:', authStatus);
        await getFCMToken(userId);
      }
    };

    // Get FCM token and save it to user's document
    const getFCMToken = async (uid) => {
      try {
        const token = await messaging().getToken();
        console.log('FCM Token:', token);
        
        // Save token to user's document in Firestore
        await updateUserFCMToken(uid, token);
      } catch (error) {
        console.error('Error getting FCM token:', error);
      }
    };

    // Handle background/quit state messages
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('Message handled in the background!', remoteMessage);
    });

    // Handle foreground messages
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      Alert.alert(remoteMessage.notification.title, remoteMessage.notification.body);
    });

    // Handle notification when app is opened from quit state
    messaging().getInitialNotification().then(remoteMessage => {
      if (remoteMessage) {
        console.log('Notification caused app to open from quit state:', remoteMessage);
      }
    });

    requestUserPermission();

    return () => unsubscribe();
  }, [userId]);
};

export default useNotifications;
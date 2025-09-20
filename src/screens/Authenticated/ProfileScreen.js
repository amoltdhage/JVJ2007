import React, { useEffect, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  LayoutAnimation,
  UIManager,
  Platform,
  Image,
  Modal,
  Alert,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {
  fetchCollection,
  updateCollection,
} from '../../Services/firestoreServices';
import { useSelector } from 'react-redux';
import { useLoading } from '../../../LoadingContext';
import SplashScreen from '../SplashScreen';
import Header from '../../components/Header';
import { ProfileStyles } from '../../styles/ProfileStyles';
import { launchImageLibrary } from 'react-native-image-picker';
import AuthenticationService from '../../Services/authservice';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental &&
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const ProfileSection = ({
  title,
  iconName,
  children,
  initiallyExpanded = false,
}) => {
  const [expanded, setExpanded] = useState(initiallyExpanded);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <View style={styles.sectionContainer}>
      <TouchableOpacity style={styles.sectionHeader} onPress={toggleExpand}>
        <View style={styles.titleRow}>
          <MaterialIcons
            name={iconName}
            size={20}
            color="#0077b6"
            style={{ marginRight: 8 }}
          />
          <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        <MaterialIcons
          name={expanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
          size={24}
          color="#333"
        />
      </TouchableOpacity>
      {expanded && <View style={styles.sectionContent}>{children}</View>}
    </View>
  );
};

const renderKeyValue = data =>
  Object.entries(data).map(([key, value]) => {
    if (!value) return null; // skip empty
    return (
      <View style={styles.dataRow} key={key}>
        <Text style={styles.dataLabel}>{key}</Text>
        <Text style={styles.dataValue}>{value}</Text>
      </View>
    );
  });

const ProfileScreen = ({ navigation }) => {
  const { logout } = AuthenticationService();
  const auth = useSelector(state => state.auth);
  const { isLoading, startLoading, stopLoading } = useLoading();
  const [userDetail, setUserDetail] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [userInitial, setUserInitial] = useState('A');
  const [isImageExpanded, setIsImageExpanded] = useState(false);

  const sectionIcons = {
    'My Profile': 'person',
    'Contact Details': 'contact-phone',
  };

  const [profileData, setProfileData] = useState({
    myProfile: {
      Name: 'Amol Dhage',
      DOB: '06/05/1991',
    },
    contactDetails: {
      Email: 'amol@gmail.com',
      Contact: '9890909890',
      'Emergency Contact': '9898989898',
      Country: 'India',
      Gender: 'Male',
    },
  });

  useEffect(() => {
    if (auth?.user) getUserData(auth.user);
    else logout('Session expired');
  }, []);

  useEffect(() => {
    const username = userDetail?.fullName || userDetail?.firstName;
    const newProfileData = {
      myProfile: {
        Name: userDetail?.fullName
          ? userDetail?.fullName
          : `${userDetail?.firstName?.trim()} ${userDetail?.lastName?.trim()}`,
        DOB: new Date(userDetail?.dob).toLocaleDateString('en-GB'),
      },
      contactDetails: {
        Email: userDetail?.email || '-',
        Contact: userDetail?.mobile || '-',
        Village: userDetail?.village || '-',
        Country: 'India',
        Gender: userDetail?.gender
          ? userDetail.gender.charAt(0).toUpperCase() +
            userDetail.gender.slice(1)
          : '-',
      },
    };
    setProfileData(newProfileData);
    setProfileImage(userDetail?.profileImage);
    setUserInitial(
      username && username?.length > 0 ? username.charAt(0).toUpperCase() : '?',
    );
  }, [userDetail]);

  const getUserData = async id => {
    try {
      startLoading();
      const userData = await fetchCollection('users', id);
      setUserDetail(userData);
    } catch (error) {
      logout('Not able to get your data. Please login again.');
      console.error('Error fetching user data:', error);
    } finally {
      stopLoading();
    }
  };

  const pickImage = async () => {
    const options = {
      mediaType: 'photo',
      quality: 0.8,
      selectionLimit: 1,
      // maxWidth: 512,
      // maxHeight: 512,
    };
    const result = await launchImageLibrary(options);
    if (result.assets && result.assets.length > 0) {
      const selectedImage = result.assets[0].uri;
      setProfileImage(selectedImage);

      // Save to Firestore
      try {
        await updateCollection('users', auth.user, {
          profileImage: selectedImage,
        });
      } catch (err) {
        console.error('Error updating profile image:', err);
      }
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Logout',
          onPress: () => logout(),
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  if (isLoading) return <SplashScreen />;

  return (
    <>
      <Modal visible={isImageExpanded} transparent={true}>
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setIsImageExpanded(false)}
          >
            <MaterialIcons name="close" size={30} color="#fff" />
          </TouchableOpacity>

          <Image
            source={{ uri: profileImage }}
            style={styles.expandedImage}
            resizeMode="contain"
          />
        </View>
      </Modal>

      <Header title="Profile" navigation={navigation} />
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingTop: 20, paddingBottom: 30 }}
      >
        <View style={styles.profileImageContainer}>
          {profileImage ? (
            <TouchableOpacity onPress={() => setIsImageExpanded(true)}>
              <Image
                source={{ uri: profileImage }}
                style={styles.profileImage}
              />
            </TouchableOpacity>
          ) : (
            <View style={styles.profilePlaceholder}>
              <Text style={styles.profileInitial}>{userInitial}</Text>
            </View>
          )}
          <TouchableOpacity style={styles.editIcon} onPress={pickImage}>
            <MaterialIcons name="edit" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
        <ProfileSection
          title="My Profile"
          iconName={sectionIcons['My Profile']}
          initiallyExpanded
        >
          {renderKeyValue(profileData.myProfile)}
        </ProfileSection>

        <ProfileSection
          title="Contact Details"
          iconName={sectionIcons['Contact Details']}
        >
          {renderKeyValue(profileData.contactDetails)}
        </ProfileSection>
        
        {/* Logout Button */}
        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={handleLogout}
        >
          <MaterialIcons name="logout" size={20} color="#fff" style={{ marginRight: 10 }} />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </>
  );
};

// Add logout button styles to your ProfileStyles
const styles = {
  ...ProfileStyles,
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#696868ff',
    padding: 15,
    borderRadius: 8,
    marginHorizontal: 20,
    marginTop: 30,
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
};

export default ProfileScreen;
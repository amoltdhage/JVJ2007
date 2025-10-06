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
  ActivityIndicator,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import {
  fetchCollection,
  updateCollection,
} from '../../Services/firestoreServices';
import { useSelector } from 'react-redux';
import { useLoading } from '../../../LoadingContext';
import Header from '../../components/Header';
import { ProfileStyles } from '../../styles/ProfileStyles';
import ImagePicker from 'react-native-image-crop-picker';
import AuthenticationService from '../../Services/authservice';
import FontAwesome from "react-native-vector-icons/FontAwesome"

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
    if (!value) return null;
    return (
      <View style={styles.dataRow} key={key}>
        <Text style={styles.dataLabel}>{key}</Text>
        <Text style={styles.dataValue}>{value}</Text>
      </View>
    );
  });

const ProfileScreen = () => {
  const { logout } = AuthenticationService();
  const auth = useSelector(state => state.auth);
  const { isLoading, startLoading, stopLoading } = useLoading();
  const [userDetail, setUserDetail] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [userInitial, setUserInitial] = useState('A');
  const [isImageExpanded, setIsImageExpanded] = useState(false);
  const [imageLoader, setImageLoader] = useState(false);

  const sectionIcons = {
    'My Profile': 'person',
    'Contact Details': 'contact-phone',
  };

  const [profileData, setProfileData] = useState({
    myProfile: {
      Name: 'Amol Dhage',
      DOB: '06/05/1991',
      Gender: 'Male',
    },
    contactDetails: {
      Email: 'amol@gmail.com',
      Contact: '9890909890',
      'Emergency Contact': '9898989898',
      Country: 'India',
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
        Gender: userDetail?.gender
          ? userDetail.gender.charAt(0).toUpperCase() +
            userDetail.gender.slice(1)
          : '-',
        Payment:
          userDetail?.isPaid && Number(userDetail?.amount) ? (
            <Text>
              <FontAwesome name="rupee" size={14} color="#666" />{Number(userDetail?.amount)}
            </Text>
          ) : userDetail?.isPaid ? (
            <Text style={{ color: 'green', fontWeight: 'bold' }}>Paid</Text>
          ) : (
            <Text style={{ color: 'red', fontWeight: 'bold' }}>Pending</Text>
          ),
      },
      contactDetails: {
        Email: userDetail?.email || '-',
        Contact: userDetail?.mobile || '-',
        Village: userDetail?.village || '-',
        Country: 'India',
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

  // Updated pickImage with circular cropping
  const pickImage = async () => {
    try {
      const image = await ImagePicker.openPicker({
        width: 400,
        height: 400,
        cropping: true,
        cropperCircleOverlay: true, // Circular crop overlay
        includeBase64: true,
        compressImageQuality: 0.7,
        mediaType: 'photo',
        cropperToolbarTitle: 'Crop Profile Photo',
        cropperChooseText: 'Done',
        cropperCancelText: 'Cancel',
        freeStyleCropEnabled: false, // Lock to square/circle
        showCropGuidelines: true,
        hideBottomControls: false,
        enableRotationGesture: true,
      });

      if (image && image.data) {
        const base64Image = `data:${image.mime};base64,${image.data}`;

        // Show the selected image immediately
        setProfileImage(base64Image);
        setImageLoader(true);

        try {
          // Save to Firestore as base64
          await updateCollection('users', auth.user, {
            profileImage: base64Image,
          });

          // Update local state
          setUserDetail(prev => ({ ...prev, profileImage: base64Image }));
          Alert.alert('Success', 'Profile photo updated successfully');
        } catch (err) {
          console.error('Error updating profile image:', err);
          Alert.alert('Error', 'Failed to update profile image');
          // Revert to previous image
          setProfileImage(userDetail?.profileImage);
        } finally {
          setImageLoader(false);
        }
      }
    } catch (error) {
      if (error.code !== 'E_PICKER_CANCELLED') {
        console.error('Error picking image:', error);
        Alert.alert('Error', 'Failed to select image');
      }
      setImageLoader(false);
    }
  };

  // Option to show camera or gallery selection
  // const showImagePickerOptions = () => {
  //   Alert.alert(
  //     'Update Profile Photo',
  //     'Choose an option',
  //     [
  //       {
  //         text: 'Take Photo',
  //         onPress: openCamera,
  //       },
  //       {
  //         text: 'Choose from Gallery',
  //         onPress: pickImage,
  //       },
  //       {
  //         text: 'Cancel',
  //         style: 'cancel',
  //       },
  //     ],
  //     { cancelable: true },
  //   );
  // };

  // Camera option with cropping
  const openCamera = async () => {
    try {
      const image = await ImagePicker.openCamera({
        width: 400,
        height: 400,
        cropping: true,
        cropperCircleOverlay: true,
        includeBase64: true,
        compressImageQuality: 0.7,
        mediaType: 'photo',
        cropperToolbarTitle: 'Crop Profile Photo',
        cropperChooseText: 'Done',
        cropperCancelText: 'Cancel',
        freeStyleCropEnabled: false,
        showCropGuidelines: true,
        enableRotationGesture: true,
      });

      if (image && image.data) {
        const base64Image = `data:${image.mime};base64,${image.data}`;

        setProfileImage(base64Image);
        setImageLoader(true);

        try {
          await updateCollection('users', auth.user, {
            profileImage: base64Image,
          });

          setUserDetail(prev => ({ ...prev, profileImage: base64Image }));
          Alert.alert('Success', 'Profile photo updated successfully');
        } catch (err) {
          console.error('Error updating profile image:', err);
          Alert.alert('Error', 'Failed to update profile image');
          setProfileImage(userDetail?.profileImage);
        } finally {
          setImageLoader(false);
        }
      }
    } catch (error) {
      if (error.code !== 'E_PICKER_CANCELLED') {
        console.error('Error opening camera:', error);
        Alert.alert('Error', 'Failed to open camera');
      }
      setImageLoader(false);
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
      { cancelable: true },
    );
  };

  if (isLoading)
    return (
      <View style={styles.loadingContainer}>
        <Header title="Profile" />
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#002b5c" />
          <Text style={styles.loadingText}>Loading Profile Data...</Text>
        </View>
      </View>
    );

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

          {profileImage ? (
            <Image
              source={{ uri: profileImage }}
              style={styles.expandedImage}
              resizeMode="contain"
            />
          ) : (
            <View
              style={[styles.profilePlaceholder, { width: 300, height: 300 }]}
            >
              <Text style={[styles.profileInitial, { fontSize: 120 }]}>
                {userInitial}
              </Text>
            </View>
          )}
        </View>
      </Modal>

      <Header title="Profile" />
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingTop: 20, paddingBottom: 30 }}
      >
        <View style={styles.profileImageContainer}>
          {imageLoader ? (
            <View style={styles.profileImageLoader}>
              <ActivityIndicator size="large" color="#002b5c" />
            </View>
          ) : profileImage ? (
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

        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <MaterialIcons
            name="logout"
            size={20}
            color="#fff"
            style={{ marginRight: 10 }}
          />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </>
  );
};

const styles = {
  ...ProfileStyles,
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#870404ff',
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
  loadingContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
    fontFamily: 'System',
  },
};

export default ProfileScreen;

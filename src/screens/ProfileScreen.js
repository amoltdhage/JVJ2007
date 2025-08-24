import React, { useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  LayoutAnimation,
  StyleSheet,
  UIManager,
  Platform,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental &&
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const sectionIcons = {
  'My Profile': 'person',
  'Contact Details': 'contact-phone',
  'Family Details': 'family-restroom',
  'Bank Details': 'account-balance',
  'Document Details': 'description',
  'Employee Work Experience': 'work-history',
  'Employee Qualifications': 'school',
};

const profileData = {
  myProfile: {
    Name: 'Amol Dhage',
    'Employee Number': '2165',
    DOB: '06/05/1991',
    'Blood Group': 'B+',
    Username: 'amol.Dhage',
  },
  contactDetails: {
    'Office Email': 'amol@svaapta.com',
    'Personal Email': 'amol@gmail.com',
    Contact: '9890909890',
    'Emergency Contact': '9898989898',
    Country: 'India',
    'LinkedIn Profile': '',
    Gender: 'Male',
    'Languages Known': 'English,Hindi,Marathi, Gujarati',
  },
  familyDetails: {
    'Marital Status': 'Married',
    'Spouse Details': 'Pooja',
    'Parents Details': 'Vadodara',
  },
  bankDetails: {
    'Bank Name': '',
    'Account Number': '',
    'IFSC Code': '',
  },
  documentDetails: {
    'Aadhaar Card No': '1111222233334444',
    'Pan Card No': 'ABCDB81122D',
    'Passport No': '',
  },
  workExperience: [
    {
      'Name of Organization': 'testing.com',
      'Designation': 'developer',
      'Joining Date': '01/05/2024',
      'Address': 'test baroda',
      'Relieving Date': '31/07/2025',
      'Reason for Leaving': 'Testing',
    },
    {
      'Name of Organization': 'A.com',
      'Designation': 'tester',
      'Joining Date': '01/08/2025',
      'Address': 'test baroda',
      'Relieving Date': '31/12/2025',
      'Reason for Leaving': 'Testing',
    },
  ],
  qualifications: [
    {
      'Course Name': 'B.sc(Computer science)',
      'Educational Firm': '9E7528C3-9A1B-4B44-84DD-7A21734E6FD1',
      'Start Month-Year': '',
      'End Month-Year': '',
      'Percentage': '',
    },
    {
      'Course Name': 'MCA',
      'Educational Firm': 'A4DB1038-B4B0-4D4B-B26D-32C28823C139',
      'Start Month-Year': '',
      'End Month-Year': '',
      'Percentage': '',
    },
  ],
};

const ProfileSection = ({ title, iconName, children, initiallyExpanded = false }) => {
  const [expanded, setExpanded] = useState(initiallyExpanded);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <View style={styles.sectionContainer}>
      <TouchableOpacity style={styles.sectionHeader} onPress={toggleExpand}>
        <View style={styles.titleRow}>
          <MaterialIcons name={iconName} size={20} color="#0077b6" style={{ marginRight: 8 }} />
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

const renderKeyValue = (data) =>
  Object.entries(data).map(([key, value]) => {
    if (!value) return null; // skip empty
    return (
      <View style={styles.dataRow} key={key}>
        <Text style={styles.dataLabel}>{key}</Text>
        <Text style={styles.dataValue}>{value}</Text>
      </View>
    );
  });

const ProfileScreen = () => {
  const handleEdit = () => {
    alert('Edit Profile Clicked');
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 80 }}>
      <View style={styles.editButtonContainer}>
        <TouchableOpacity style={styles.editButton} onPress={handleEdit}>
          <MaterialIcons name="edit" size={18} color="#fff" />
          <Text style={styles.editButtonText}>Edit My Profile</Text>
        </TouchableOpacity>
      </View>

      <ProfileSection title="My Profile" iconName={sectionIcons['My Profile']} initiallyExpanded>
        {renderKeyValue(profileData.myProfile)}
      </ProfileSection>

      <ProfileSection title="Contact Details" iconName={sectionIcons['Contact Details']}>
        {renderKeyValue(profileData.contactDetails)}
      </ProfileSection>

      <ProfileSection title="Family Details" iconName={sectionIcons['Family Details']}>
        {renderKeyValue(profileData.familyDetails)}
      </ProfileSection>

      <ProfileSection title="Bank Details" iconName={sectionIcons['Bank Details']}>
        {renderKeyValue(profileData.bankDetails)}
      </ProfileSection>

      <ProfileSection title="Document Details" iconName={sectionIcons['Document Details']}>
        {renderKeyValue(profileData.documentDetails)}
      </ProfileSection>

      <ProfileSection title="Employee Work Experience" iconName={sectionIcons['Employee Work Experience']}>
        {profileData.workExperience.map((item, index) => (
          <View key={index} style={styles.experienceBox}>
            <Text style={styles.experienceTitle}>Experience {index + 1}</Text>
            {renderKeyValue(item)}
          </View>
        ))}
      </ProfileSection>

      <ProfileSection title="Employee Qualifications" iconName={sectionIcons['Employee Qualifications']}>
        {profileData.qualifications.map((item, index) => (
          <View key={index} style={styles.qualificationBox}>
            <Text style={styles.qualificationTitle}>Qualification {index + 1}</Text>
            {renderKeyValue(item)}
          </View>
        ))}
      </ProfileSection>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef7ff',
    padding: 10,
  },
  editButtonContainer: {
    alignItems: 'flex-end',
    marginBottom: 10,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0077b6',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontFamily: 'Poppins-Regular',
    marginLeft: 6,
  },
  sectionContainer: {
    marginBottom: 12,
    borderRadius: 10,
    backgroundColor: '#f0f8ff',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#cce5ff',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#cceeff',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    fontWeight: 'bold',
    color: '#0077b6',
  },
  sectionContent: {
    padding: 15,
    backgroundColor: '#ffffff',
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 0.5,
    borderBottomColor: '#ddd',
  },
  dataLabel: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    fontWeight: '600',
    color: '#333',
    width: '45%',
  },
  dataValue: {
    fontSize: 16,
    fontFamily: 'Poppins-Regular',
    color: '#555',
    width: '50%',
    textAlign: 'right',
  },
  experienceBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#cce5ff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  experienceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0077b6',
    marginBottom: 10,
  },
  qualificationBox: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#cce5ff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  qualificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0077b6',
    marginBottom: 10,
  },
});

export default ProfileScreen;
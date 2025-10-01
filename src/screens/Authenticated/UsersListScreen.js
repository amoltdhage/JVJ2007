// UsersListScreen.js - WITH PROPER REDUX HANDLING
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  TextInput,
  Alert,
  Image,
  Modal,
  Dimensions,
  StatusBar,
  Platform,
  PermissionsAndroid,
} from 'react-native';
import { firestore } from '../../Services/firebase';
import RNFS from 'react-native-fs';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import Header from '../../components/Header';
import Icon from 'react-native-vector-icons/MaterialIcons';
import ExcelJS from 'exceljs';

const { width, height } = Dimensions.get('window');

const UsersListScreen = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedUserName, setSelectedUserName] = useState('');

  const fetchUsers = async () => {
    try {
      setRefreshing(true);
      console.log('🟡 Fetching users with attending: true...');

      const querySnapshot = await firestore()
        .collection('users')
        .where('attending', '==', true)
        .get();

      console.log('🟡 Attending users found:', querySnapshot.size);

      const data = [];
      querySnapshot.forEach(doc => {
        const userData = doc.data();
        data.push({ id: doc.id, ...userData });
      });

      setUsers(data);
      setFilteredUsers(data);
    } catch (err) {
      console.error('🔴 Error fetching users:', err);
      Alert.alert('Error', `Failed to load users: ${err.message}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Function to open full screen image modal
  const openImageModal = (profileImage, fullName) => {
    if (profileImage) {
      setSelectedImage(profileImage);
      setSelectedUserName(fullName || 'User');
      setModalVisible(true);
    }
  };

  // Function to close image modal
  const closeImageModal = () => {
    setModalVisible(false);
    setSelectedImage(null);
    setSelectedUserName('');
  };

  const handleSearch = text => {
    setSearchText(text);
    if (!text) {
      setFilteredUsers(users);
      return;
    }

    const filtered = users.filter(
      u =>
        (u.fullName || '').toLowerCase().includes(text.toLowerCase()) ||
        (u.email || '').toLowerCase().includes(text.toLowerCase()) ||
        (u.mobile || '').includes(text) ||
        (u.village || '').toLowerCase().includes(text.toLowerCase()),
    );
    setFilteredUsers(filtered);
  };

  const requestStoragePermission = async () => {
    if (Platform.OS === 'android' && Platform.Version < 33) {
      // Android < 13
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
        {
          title: 'Storage Permission Required',
          message:
            'This app needs access to your storage to download Excel files',
          buttonPositive: 'OK',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true; // Android 13+ handles via MediaStore
  };

  const exportExcel = async () => {
    try {
      const hasPermission = await requestStoragePermission();
      if (!hasPermission) {
        Alert.alert(
          'Permission Denied',
          'Cannot export file without storage permission',
        );
        return;
      }
      if (filteredUsers.length === 0) {
        Alert.alert('No Data', 'There are no attendees to export');
        return null;
      }

      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Attendees');

      // Add header row
      worksheet.columns = [
        { header: 'SrNo', key: 'SrNo', width: 6 },
        { header: 'Type', key: 'Type', width: 12 },
        { header: 'Full Name', key: 'FullName', width: 25 },
        { header: 'Email', key: 'Email', width: 25 },
        { header: 'Mobile', key: 'Mobile', width: 15 },
        { header: 'Gender', key: 'Gender', width: 10 },
        { header: 'Village', key: 'Village', width: 15 },
        { header: 'Total Persons', key: 'TotalPersons', width: 15 },
        { header: 'Children', key: 'Children', width: 35 },
        { header: 'Comments', key: 'Comments', width: 30 },
      ];

      let srNo = 1;

      filteredUsers.forEach(parent => {
        worksheet.addRow({
          SrNo: srNo++,
          Type: 'Parent',
          FullName: parent.fullName || '',
          Email: parent.email || '',
          Mobile: parent.mobile || '',
          Gender: parent.gender || '',
          Village: parent.village || '',
          TotalPersons: parent.totalPersons || 0,
          Children: (parent.children || [])
            .map(c => `${c.name} (${c.age})`)
            .join(', '),
          Comments: parent.comments || '',
        });

        if (parent.users && parent.users.attending === true) {
          const sub = parent.users;
          worksheet.addRow({
            SrNo: srNo++,
            Type: 'Sub User',
            FullName: sub.fullName || '',
            Email: sub.email || '',
            Mobile: sub.mobile || '',
            Gender: sub.gender || '',
            Village: sub.village || '',
            TotalPersons: sub.totalPersons || 0,
            Children: (sub.children || [])
              .map(c => `${c.name} (${c.age})`)
              .join(', '),
            Comments: sub.comments || '',
          });
        }
      });

      const randomInt = Math.floor(Math.random() * 10000) + 1;
      const path = `${RNFS.DownloadDirectoryPath}/attendees-${randomInt}.xlsx`;

      // Write Excel to file
      const buffer = await workbook.xlsx.writeBuffer();
      await RNFS.writeFile(path, buffer.toString('base64'), 'base64');

      Alert.alert('✅ Success', `Excel file exported successfully!`);
      return path;
    } catch (e) {
      console.error(e);
      Alert.alert('❌ Error', 'Failed to export Excel file');
    }
  };

  const renderChildren = children => {
    if (!children || children.length === 0) return null;
    return (
      <View style={styles.childrenContainer}>
        <Text style={styles.sectionLabel}>👶 Children</Text>
        {children.map((child, index) => (
          <View key={index} style={styles.childItem}>
            <Text style={styles.childName}>{child.name}</Text>
            <Text style={styles.childAge}>Age: {child.age}</Text>
          </View>
        ))}
      </View>
    );
  };

  const renderNestedUser = nested => {
    if (!nested || nested.attending !== true) return null;

    return (
      <View style={styles.nestedCard}>
        <View style={styles.nestedHeader}>
          <Icon name="person" size={16} color="#007bff" />
          <Text style={styles.nestedTitle}>Additional Attendee</Text>
        </View>
        <View style={styles.nestedContent}>
          <Text style={styles.nestedText}>📛 {nested.fullName}</Text>
          <Text style={styles.nestedText}>📞 {nested.mobile}</Text>
          <Text style={styles.nestedText}>👤 {nested.gender}</Text>
          <Text style={styles.nestedText}>
            🏠 {nested.village || 'Not specified'}
          </Text>
          <Text style={styles.nestedText}>
            👥 Total: {nested.totalPersons || 1} person(s)
          </Text>
        </View>
        {renderChildren(nested.children)}
      </View>
    );
  };

  // Function to render profile image or avatar
  const renderProfileImage = user => {
    if (user.profileImage) {
      const imageSource = user.profileImage.startsWith('data:image/')
        ? { uri: user.profileImage }
        : { uri: user.profileImage };

      return (
        <TouchableOpacity
          onPress={() => openImageModal(user.profileImage, user.fullName)}
        >
          <Image
            source={imageSource}
            style={styles.profileImage}
            onError={() => console.log('Error loading profile image')}
          />
        </TouchableOpacity>
      );
    } else {
      return (
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
          </Text>
        </View>
      );
    }
  };

  const renderItem = ({ item, index }) => (
    <View
      style={[styles.card, index % 2 === 0 ? styles.cardEven : styles.cardOdd]}
    >
      <View style={styles.cardHeader}>
        {renderProfileImage(item)}
        <View style={styles.headerContent}>
          <Text style={styles.name}>{item.fullName || 'No Name'}</Text>
          <Text style={styles.email}>{item.email || 'No email'}</Text>
          <Text style={styles.mobile}>{item.mobile || 'No mobile'}</Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>👤 Main</Text>
        </View>
      </View>

      <View style={styles.detailsGrid}>
        <View style={styles.detailItem}>
          <Icon name="wc" size={16} color="#666" />
          <Text style={styles.detailText}>
            {item.gender || 'Not specified'}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Icon name="location-on" size={16} color="#666" />
          <Text style={styles.detailText}>
            {item.village || 'Not specified'}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Icon name="group" size={16} color="#666" />
          <Text style={styles.detailText}>
            {item.totalPersons || 1} person(s)
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Icon name="cake" size={16} color="#666" />
          <Text style={styles.detailText}>
            {item.dob ? new Date(item.dob).toLocaleDateString() : 'DOB not set'}
          </Text>
        </View>
      </View>

      {item.comments && (
        <View style={styles.commentsSection}>
          <Text style={styles.commentsLabel}>💬 Comments</Text>
          <Text style={styles.commentsText}>{item.comments}</Text>
        </View>
      )}

      {renderChildren(item.children)}
      {renderNestedUser(item.users)}
    </View>
  );

  const renderEmptyComponent = () => (
    <View style={styles.emptyContainer}>
      <Icon name="people-outline" size={80} color="#ccc" />
      <Text style={styles.emptyTitle}>
        {users.length === 0 ? 'No Attendees Yet' : 'No Matching Results'}
      </Text>
      <Text style={styles.emptySubtitle}>
        {users.length === 0
          ? 'When users register as attending, they will appear here.'
          : 'Try adjusting your search terms.'}
      </Text>
      <TouchableOpacity style={styles.refreshButton} onPress={fetchUsers}>
        <Icon name="refresh" size={20} color="#fff" />
        <Text style={styles.refreshButtonText}>Refresh</Text>
      </TouchableOpacity>
    </View>
  );

  // Full Screen Image Modal
  const renderImageModal = () => (
    <Modal
      visible={modalVisible}
      transparent={true}
      animationType="fade"
      statusBarTranslucent={true}
      onRequestClose={closeImageModal}
    >
      <StatusBar
        backgroundColor="rgba(0, 0, 0, 0.95)"
        barStyle="light-content"
      />
      <View style={styles.fullScreenModal}>
        <TouchableOpacity
          style={styles.fullScreenCloseButton}
          onPress={closeImageModal}
        >
          <Icon name="close" size={30} color="#fff" />
        </TouchableOpacity>

        <View style={styles.fullScreenUserName}>
          <Text style={styles.fullScreenUserNameText}>
            {selectedUserName}'s Profile Picture
          </Text>
        </View>

        <View style={styles.fullScreenImageContainer}>
          {selectedImage ? (
            <Image
              source={{
                uri: selectedImage.startsWith('data:image/')
                  ? selectedImage
                  : selectedImage,
              }}
              style={styles.fullScreenImage}
              resizeMode="contain"
              onError={() => {
                Alert.alert('Error', 'Failed to load image');
                closeImageModal();
              }}
            />
          ) : (
            <View style={styles.fullScreenNoImage}>
              <Icon name="image-not-supported" size={80} color="#ccc" />
              <Text style={styles.fullScreenNoImageText}>
                No image available
              </Text>
            </View>
          )}
        </View>

        <View style={styles.fullScreenControls}>
          <TouchableOpacity
            style={styles.fullScreenControlButton}
            onPress={closeImageModal}
          >
            <Icon name="close" size={20} color="#fff" />
            <Text style={styles.fullScreenControlText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Header title="Attendees" navigation={navigation} />
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#002b5c" />
          <Text style={styles.loadingText}>Loading attendees...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header title="Attendees" navigation={navigation} />

      {/* TEMPORARY: Always show buttons for testing */}
      <View style={styles.adminContainer}>
        <Text style={styles.adminTitle}>👑 Admin Tools</Text>
        <View style={styles.adminButtons}>
          <TouchableOpacity style={styles.exportButton} onPress={exportExcel}>
            <Icon name="description" size={22} color="#fff" />
            <Text style={styles.exportButtonText}>Export Excel</Text>
          </TouchableOpacity>

          {/* <TouchableOpacity style={styles.exportButton} onPress={exportPDF}>
            <Icon name="picture-as-pdf" size={22} color="#fff" />
            <Text style={styles.exportButtonText}>Export PDF</Text>
          </TouchableOpacity> */}

          <TouchableOpacity style={styles.exportButton} onPress={fetchUsers}>
            <Icon name="refresh" size={22} color="#fff" />
            <Text style={styles.exportButtonText}>Refresh List</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Stats Header */}
      <View style={styles.statsContainer}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{users.length}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{filteredUsers.length}</Text>
          <Text style={styles.statLabel}>Showing</Text>
        </View>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>
            {users.reduce((acc, user) => acc + (user.totalPersons || 1), 0)}
          </Text>
          <Text style={styles.statLabel}>People</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, email, mobile or village..."
          value={searchText}
          onChangeText={handleSearch}
          placeholderTextColor="#999"
        />
        {searchText ? (
          <TouchableOpacity onPress={() => handleSearch('')}>
            <Icon name="close" size={20} color="#666" />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Attendees List */}
      <FlatList
        data={filteredUsers}
        keyExtractor={item => item.id || Math.random().toString()}
        renderItem={renderItem}
        ListEmptyComponent={renderEmptyComponent}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshing={refreshing}
        onRefresh={fetchUsers}
      />

      {/* Full Screen Profile Image Modal */}
      {renderImageModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
  // Admin Container
  adminContainer: {
    backgroundColor: '#002b5c',
    padding: 15,
    borderBottomWidth: 3,
    borderBottomColor: '#007bff',
  },
  adminTitle: {
    color: '#ffd700',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    fontFamily: 'System',
  },
  adminButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007bff',
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 20,
    width: 'auto',
    justifyContent: 'center',
  },
  exportButtonText: {
    color: '#fff',
    marginLeft: 6,
    fontWeight: '600',
    fontSize: 12,
    fontFamily: 'System',
  },
  debugContainer: {
    backgroundColor: '#ffeb3b',
    padding: 8,
    margin: 10,
    borderRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: '#ff9800',
  },
  debugText: {
    color: '#333',
    fontSize: 11,
    fontWeight: 'bold',
    fontFamily: 'System',
  },
  // Stats Container
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 15,
    backgroundColor: '#fff',
    margin: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#002b5c',
    fontFamily: 'System',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
    fontFamily: 'System',
  },
  // Search Container
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    margin: 10,
    paddingHorizontal: 15,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: '#333',
    fontFamily: 'System',
  },
  // List Content
  listContent: {
    padding: 10,
    paddingBottom: 30,
  },
  // Card Styles
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginVertical: 6,
    marginHorizontal: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardEven: {
    backgroundColor: '#fff',
  },
  cardOdd: {
    backgroundColor: '#f8f9fa',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  profileImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  avatarText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    fontFamily: 'System',
  },
  headerContent: {
    flex: 1,
  },
  name: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#002b5c',
    marginBottom: 2,
    fontFamily: 'System',
  },
  email: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
    fontFamily: 'System',
  },
  mobile: {
    fontSize: 14,
    color: '#007bff',
    fontWeight: '600',
    fontFamily: 'System',
  },
  badge: {
    backgroundColor: '#28a745',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
    fontFamily: 'System',
  },
  // Details Grid
  detailsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: 8,
  },
  detailText: {
    marginLeft: 6,
    fontSize: 14,
    color: '#555',
    fontFamily: 'System',
  },
  // Comments Section
  commentsSection: {
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  commentsLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
    fontFamily: 'System',
  },
  commentsText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
    fontFamily: 'System',
  },
  // Children Container
  childrenContainer: {
    backgroundColor: '#fff9e6',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  sectionLabel: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 6,
    fontFamily: 'System',
  },
  childItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 6,
    marginBottom: 4,
  },
  childName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'System',
  },
  childAge: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'System',
  },
  // Nested User Card
  nestedCard: {
    backgroundColor: '#e7f3ff',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007bff',
    marginTop: 8,
  },
  nestedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  nestedTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007bff',
    marginLeft: 6,
    fontFamily: 'System',
  },
  nestedContent: {
    marginLeft: 22,
  },
  nestedText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
    fontFamily: 'System',
  },
  // Empty State
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
    marginBottom: 8,
    fontFamily: 'System',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 20,
    fontFamily: 'System',
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007bff',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
  },
  refreshButtonText: {
    color: '#fff',
    marginLeft: 8,
    fontWeight: '600',
    fontSize: 16,
    fontFamily: 'System',
  },
  // Full Screen Image Modal
  fullScreenModal: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenCloseButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1000,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 20,
    padding: 8,
  },
  fullScreenUserName: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 1000,
  },
  fullScreenUserNameText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'System',
  },
  fullScreenImageContainer: {
    width: width * 0.9,
    height: height * 0.7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
    borderRadius: 10,
  },
  fullScreenNoImage: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  fullScreenNoImageText: {
    color: '#ccc',
    fontSize: 16,
    marginTop: 10,
    fontFamily: 'System',
  },
  fullScreenControls: {
    position: 'absolute',
    bottom: 40,
    flexDirection: 'row',
  },
  fullScreenControlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    marginHorizontal: 10,
  },
  fullScreenControlText: {
    color: '#fff',
    marginLeft: 8,
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'System',
  },
});

export default UsersListScreen;

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
  Share,
  ScrollView,
  Image,
  Modal,
  Dimensions,
  StatusBar,
} from 'react-native';
import { useSelector } from 'react-redux';
import { firestore } from '../../Services/firebase';
import XLSX from 'xlsx';
import RNFS from 'react-native-fs';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import Header from '../../components/Header';
import Icon from 'react-native-vector-icons/MaterialIcons';

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

  const exportExcel = async () => {
    try {
      if (filteredUsers.length === 0) {
        Alert.alert('No Data', 'There are no attendees to export');
        return null;
      }

      const dataForExcel = [];
      let srNo = 1;

      filteredUsers.forEach(parent => {
        dataForExcel.push({
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
          dataForExcel.push({
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

      const ws = XLSX.utils.json_to_sheet(dataForExcel);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Attendees');
      const wbout = XLSX.write(wb, { type: 'binary', bookType: 'xlsx' });
      const path = RNFS.DownloadDirectoryPath + '/attendees.xlsx';
      await RNFS.writeFile(path, wbout, 'ascii');
      Alert.alert('✅ Success', `Excel file exported successfully!`);
      return path;
    } catch (e) {
      console.error(e);
      Alert.alert('❌ Error', 'Failed to export Excel file');
    }
  };

  const exportPDF = async () => {
    try {
      if (filteredUsers.length === 0) {
        Alert.alert('No Data', 'There are no attendees to export');
        return null;
      }

      let htmlContent = `
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #002b5c; color: white; }
            h1 { text-align: center; color: #002b5c; margin-bottom: 30px; }
            .header { background-color: #f8f9fa; padding: 20px; text-align: center; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🎉 Event Attendees List</h1>
            <p>Generated on ${new Date().toLocaleDateString()}</p>
          </div>
          <table>
            <tr>
              <th>SrNo</th>
              <th>Type</th>
              <th>Name</th>
              <th>Email</th>
              <th>Mobile</th>
              <th>Gender</th>
              <th>Village</th>
              <th>Total Persons</th>
              <th>Children</th>
            </tr>
      `;

      let srNo = 1;
      filteredUsers.forEach(parent => {
        htmlContent += `
          <tr>
            <td>${srNo++}</td>
            <td>👤 Parent</td>
            <td>${parent.fullName || ''}</td>
            <td>${parent.email || ''}</td>
            <td>${parent.mobile || ''}</td>
            <td>${parent.gender || ''}</td>
            <td>${parent.village || ''}</td>
            <td>${parent.totalPersons || 0}</td>
            <td>${(parent.children || [])
              .map(c => `${c.name} (${c.age})`)
              .join(', ')}</td>
          </tr>
        `;

        if (parent.users && parent.users.attending === true) {
          const sub = parent.users;
          htmlContent += `
            <tr>
              <td>${srNo++}</td>
              <td>👥 Sub User</td>
              <td>${sub.fullName || ''}</td>
              <td>${sub.email || ''}</td>
              <td>${sub.mobile || ''}</td>
              <td>${sub.gender || ''}</td>
              <td>${sub.village || ''}</td>
              <td>${sub.totalPersons || 0}</td>
              <td>${(sub.children || [])
                .map(c => `${c.name} (${c.age})`)
                .join(', ')}</td>
            </tr>
          `;
        }
      });

      htmlContent += `</table></body></html>`;

      const file = await RNHTMLtoPDF.convert({
        html: htmlContent,
        fileName: 'attendees_list',
        directory: 'Downloads',
      });

      Alert.alert('✅ Success', 'PDF exported successfully!');
      return file.filePath;
    } catch (e) {
      console.error(e);
      Alert.alert('❌ Error', 'Failed to export PDF');
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

          <TouchableOpacity style={styles.exportButton} onPress={exportPDF}>
            <Icon name="picture-as-pdf" size={22} color="#fff" />
            <Text style={styles.exportButtonText}>Export PDF</Text>
          </TouchableOpacity>

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
    // flexDirection: 'row',
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

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  ActivityIndicator,
  Image,
  Modal,
} from 'react-native';
import { useSelector } from 'react-redux';
import { firestore } from '../../Services/firebase';
import {
  sendMessage,
  editMessage,
  deleteMessage,
  ensureUserInGroup,
  fetchCollection,
} from '../../Services/firestoreServices';
import { useGroupMessages } from '../../hooks/useGroupMessages';
import Header from '../../components/Header';
import { MaterialIcons } from '@react-native-vector-icons/material-icons';

// Icons
const EditIcon = () => <Text style={styles.editIcon}>✏️</Text>;
const DeleteIcon = () => <Text style={styles.deleteIcon}>🗑️</Text>;

// Helper to format section label
const getSectionLabel = timestamp => {
  const msgDate =
    typeof timestamp === 'number'
      ? new Date(timestamp * 1000)
      : timestamp.seconds
      ? new Date(timestamp.seconds * 1000)
      : new Date(timestamp);
  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  if (
    msgDate.getDate() === today.getDate() &&
    msgDate.getMonth() === today.getMonth() &&
    msgDate.getFullYear() === today.getFullYear()
  )
    return 'Today';

  if (
    msgDate.getDate() === yesterday.getDate() &&
    msgDate.getMonth() === yesterday.getMonth() &&
    msgDate.getFullYear() === yesterday.getFullYear()
  )
    return 'Yesterday';

  return msgDate.toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

// Group messages by section - REVERSED for inverted list
const prepareMessagesWithSections = messages => {
  if (!messages.length) return [];

  // First sort in ascending order (oldest to newest)
  const sortedMessages = [...messages].sort((a, b) => {
    const aTime = a.createdAt.seconds
      ? a.createdAt.seconds * 1000
      : a.createdAt;
    const bTime = b.createdAt.seconds
      ? b.createdAt.seconds * 1000
      : b.createdAt;
    return aTime - bTime; // Ascending order
  });

  // Group messages with sections
  const grouped = [];
  let currentSection = null;

  sortedMessages.forEach(msg => {
    const section = getSectionLabel(msg.createdAt);
    if (section !== currentSection) {
      grouped.push({
        id: `section-${section}`,
        type: 'section',
        title: section,
        timestamp: msg.createdAt,
      });
      currentSection = section;
    }
    grouped.push({
      ...msg,
      type: 'message',
    });
  });

  // Now reverse the entire array for inverted list
  return grouped.reverse();
};

export default function GroupChatScreen() {
  const [groupId, setGroupId] = useState(null);
  const [text, setText] = useState('');
  const [editingMessage, setEditingMessage] = useState(null);
  const [editText, setEditText] = useState('');
  const [showOptions, setShowOptions] = useState(null);
  const userId = useSelector(state => state.auth?.user);
  const messages = useGroupMessages(groupId) || [];
  const flatListRef = useRef(null);
  const editInputRef = useRef(null);
  const inputRef = useRef(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [itemData, setItemData] = useState(null);
  const [messagesWithSections, setMessagesWithSections] = useState([]);

  const [inputHeight, setInputHeight] = useState(40);
  const [editInputHeight, setEditInputHeight] = useState(40);

  // Store all users for profile images
  const [allUsers, setAllUsers] = useState({});

  // Modal state for profile image
  const [modalVisible, setModalVisible] = useState(false);
  const [modalImage, setModalImage] = useState(null);

  // Timer ref for auto-hiding options
  const hideOptionsTimeout = useRef(null);

  // Fetch current user data
  const getUserData = async () => {
    const user = await fetchCollection('users', userId);
    if (user) setUserData(user);
  };

  // Fetch all users for profile images
  const fetchAllUsers = async () => {
    try {
      const usersSnapshot = await firestore().collection('users').get();
      const usersData = {};
      usersSnapshot.forEach(doc => {
        usersData[doc.id] = doc.data();
      });
      setAllUsers(usersData);
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  useEffect(() => {
    fetchAllData();
    fetchAllUsers();
  }, [userId]);

  const fetchAllData = async () => {
    try {
      if (!userId) return;
      const gId = await ensureUserInGroup(userId);
      setGroupId(gId);
      getUserData();
    } catch (error) {
      setLoading(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMessagesWithSections(prepareMessagesWithSections(messages));
  }, [messages]);

  // Clear timer on unmount
  useEffect(() => {
    return () => {
      if (hideOptionsTimeout.current) clearTimeout(hideOptionsTimeout.current);
    };
  }, []);

  const handleSend = async () => {
    if (!text.trim() || !groupId) return;
    await sendMessage(groupId, userData, text.trim());
    setText('');
  };

  const handleEdit = async () => {
    if (!editText.trim() || !editingMessage) return;
    if (editingMessage.text.trim() !== editText.trim())
      await editMessage(groupId, editingMessage.id, editText.trim());
    setEditingMessage(null);
    setEditText('');
    setShowOptions(null);
  };

  const handleDelete = async message => {
    Alert.alert(
      'Delete Message',
      'Are you sure you want to delete this message?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            await deleteMessage(groupId, message.id);
            setShowOptions(null);
          },
        },
      ],
    );
  };

  const startEditing = message => {
    setEditingMessage(message);
    setEditText(message.text);
    setShowOptions(null);
    setTimeout(() => {
      editInputRef.current?.focus();
    }, 100);
  };

  const cancelEdit = () => {
    setEditingMessage(null);
    setEditText('');
  };

  const renderItem = ({ item, index }) => {
    if (item.type === 'section') {
      return (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>{item.title}</Text>
        </View>
      );
    }

    const isMe = item.senderId === userId;
    const senderName = isMe
      ? 'You'
      : item?.senderName
      ? item.senderName.trim().split(' ')[0]
      : 'Guest';
    const senderImage = item.senderId && allUsers[item.senderId]?.profileImage;

    const formattedTime = new Date(
      item.createdAt.seconds ? item.createdAt.seconds * 1000 : item.createdAt,
    ).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    const time = formattedTime.replace(/am|pm/, match => match.toUpperCase());

    // Extract initials for fallback
    // const initials = item.senderName
    //   ? item.senderName
    //       .split(' ')
    //       .map(part => part[0])
    //       .join('')
    //       .toUpperCase()
    //   : 'G';

    const initials = item?.senderName
      ? item.senderName.trim().split(' ')[0][0].toUpperCase()
      : 'G';

    return (
      <View style={[styles.messageWrapper, isMe && styles.myMessageWrapper]}>
        {!isMe && (
          <View style={styles.senderContainer}>
            {senderImage ? (
              <TouchableOpacity
                onPress={() => {
                  setModalImage(senderImage);
                  setModalVisible(true);
                  setItemData(item);
                }}
              >
                <Image
                  source={{ uri: senderImage }}
                  style={styles.profileImage}
                  onError={() => {
                    // Fallback to initials if image fails
                    setAllUsers(prev => ({
                      ...prev,
                      [item.senderId]: {
                        ...prev[item.senderId],
                        profileImage: null,
                      },
                    }));
                  }}
                />
              </TouchableOpacity>
            ) : (
              <View
                style={[
                  styles.profileImage,
                  {
                    backgroundColor: '#667781',
                    justifyContent: 'center',
                    alignItems: 'center',
                  },
                ]}
              >
                <TouchableOpacity
                  onPress={() => {
                    setModalImage(senderImage);
                    setModalVisible(true);
                    setItemData(item);
                  }}
                >
                  <Text style={{ color: '#fff', fontWeight: 'bold' }}>
                    {initials}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
            <Text style={styles.senderName}>{senderName}</Text>
          </View>
        )}

        <TouchableOpacity
          onLongPress={() => {
            if (isMe) {
              setShowOptions(item.id);

              // clear previous timer
              if (hideOptionsTimeout.current)
                clearTimeout(hideOptionsTimeout.current);

              // auto-hide after 20 seconds
              hideOptionsTimeout.current = setTimeout(() => {
                setShowOptions(null);
              }, 20000);
            }
          }}
          style={[
            styles.messageContainer,
            isMe ? styles.myMessage : styles.otherMessage,
          ]}
        >
          <Text style={isMe ? styles.myMessageText : styles.otherMessageText}>
            {item.text}
          </Text>
          <View style={styles.messageFooter}>
            <Text style={styles.timeText}>
              {time} {item.edited ? '(edited)' : ''}
            </Text>
          </View>
        </TouchableOpacity>

        {showOptions === item.id && isMe && (
          <View style={styles.optionsContainer}>
            <TouchableOpacity
              onPress={() => startEditing(item)}
              style={styles.optionButton}
            >
              <EditIcon />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleDelete(item)}
              style={styles.optionButton}
            >
              <DeleteIcon />
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <>
        <Header title="Group chat" hideDropdown={true} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2d677aff" />
          <Text style={styles.loadingText}>Loading messages...</Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Header title="Group chat" hideDropdown={true} />
      {/* <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        style={{ flex: 1 }}
      > */}
        <TouchableOpacity
          activeOpacity={1}
          style={{ flex: 1 }}
          onPress={() => setShowOptions(null)}
        >
          <FlatList
            ref={flatListRef}
            data={messagesWithSections}
            renderItem={renderItem}
            keyExtractor={item => item.id}
            inverted
            contentContainerStyle={{ paddingVertical: 10 }}
            style={styles.container}
            removeClippedSubviews={Platform.OS === 'android'}
            maxToRenderPerBatch={10}
            updateCellsBatchingPeriod={50}
            initialNumToRender={15}
            windowSize={10}
          />
        </TouchableOpacity>

        {editingMessage ? (
          <View style={styles.editContainer}>
            <Text style={styles.editLabel}>Editing message</Text>
            <View style={styles.editInputContainer}>
              <TextInput
                ref={editInputRef}
                style={[
                  styles.editInput,
                  {
                    height: Math.min(editInputHeight, 100),
                    textAlignVertical: 'top',
                  },
                ]}
                value={editText}
                onChangeText={setEditText}
                placeholder="Edit your message..."
                placeholderTextColor="gray"
                multiline
                onContentSizeChange={e =>
                  setEditInputHeight(e.nativeEvent.contentSize.height)
                }
                scrollEnabled={editInputHeight >= 100}
                returnKeyType="default"
              />

              {/* <TouchableOpacity
                onPress={handleEdit}
                style={styles.editSendButton}
              >
                <MaterialIcons name="send" size={25} color="#fff" />
              </TouchableOpacity>
              <TouchableOpacity
                onPress={cancelEdit}
                style={styles.editCancelButton}
              >
                <MaterialIcons name="cancel" size={25} color="#fff" />
              </TouchableOpacity> */}

              <View style={styles.editButtonRow}>
                <TouchableOpacity
                  onPress={handleEdit}
                  style={styles.editSendButton}
                >
                  <MaterialIcons name="send" size={22} color="#fff" />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={cancelEdit}
                  style={styles.editCancelButton}
                >
                  <MaterialIcons name="cancel" size={22} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ) : (
          <View style={styles.inputContainer}>
            {/* <TextInput
              style={styles.input}
              value={text}
              onChangeText={setText}
              placeholder="Type a message..."
              placeholderTextColor={'gray'}
            /> */}

            <TextInput
              ref={inputRef}
              style={[
                styles.input,
                {
                  height: Math.min(inputHeight, 100),
                  textAlignVertical: 'top',
                },
              ]}
              value={text}
              onChangeText={setText}
              placeholder="Type a message..."
              placeholderTextColor="gray"
              multiline
              onContentSizeChange={e =>
                setInputHeight(e.nativeEvent.contentSize.height)
              }
              scrollEnabled={inputHeight >= 100}
              returnKeyType="default"
            />
            <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
              <MaterialIcons name="send" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
      {/* </KeyboardAvoidingView> */}

      {/* Profile Image Modal with Close Button */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => {
          setModalVisible(false);
          setItemData(null);
        }}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => {
                setModalVisible(false);
                setItemData(null);
              }}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
            {modalImage ? (
              <Image
                source={{ uri: modalImage }}
                style={[styles.modalImage, { marginBottom: 5 }]}
                resizeMode="contain"
              />
            ) : (
              <View
                style={[
                  styles.modalProfileImage,
                  {
                    backgroundColor: '#667781',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: 10,
                  },
                ]}
              >
                <Text
                  style={{ color: '#fff', fontWeight: 'bold', fontSize: 60 }}
                >
                  {itemData?.senderName
                    ? itemData.senderName.trim().split(' ')[0][0].toUpperCase()
                    : 'G'}
                </Text>
              </View>
            )}
            <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 20 }}>
              {itemData?.senderName ? itemData.senderName.trim() : 'Guest'}
            </Text>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#e5ddd5' },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e5ddd5',
  },
  loadingText: {
    marginTop: 10,
    color: '#2d677aff',
    fontSize: 16,
    width: '100%',
    textAlign: 'center',
    justifyContent: 'center',
  },
  sectionContainer: { alignItems: 'center', marginVertical: 10 },
  sectionHeader: {
    backgroundColor: '#e5ddd5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    color: '#667781',
    fontWeight: '500',
    fontSize: 12,
  },
  messageWrapper: {
    marginVertical: 2,
    marginHorizontal: 8,
    alignItems: 'flex-start',
  },
  myMessageWrapper: { alignItems: 'flex-end' },
  messageContainer: {
    padding: 8,
    borderRadius: 8,
    maxWidth: '75%',
    marginBottom: 2,
  },
  myMessage: {
    backgroundColor: '#0b4180ff',
    borderTopRightRadius: 2,
    marginRight: 5,
  },
  otherMessage: {
    backgroundColor: '#2f545fff',
    borderTopLeftRadius: 2,
    marginLeft: 5,
  },
  senderName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#667781',
    marginBottom: 2,
  },
  profileImage: { width: 23, height: 23, borderRadius: 16, marginRight: 3 },
  myMessageText: { color: '#faf3f3ff', fontSize: 15 },
  otherMessageText: { color: '#fff', fontSize: 15 },
  messageFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 2,
  },
  timeText: { fontSize: 11, color: '#f5f7f8ff' },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4,
    marginRight: 8,
  },
  optionButton: {
    padding: 6,
    marginLeft: 8,
    backgroundColor: '#fff',
    borderRadius: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
  },
  editIcon: { fontSize: 16 },
  deleteIcon: { fontSize: 16 },
  inputContainer: {
    flexDirection: 'row',
    padding: 8,
    backgroundColor: '#f0f0f0',
    borderTopWidth: 1,
    borderTopColor: '#ddd',
    alignItems: 'flex-end',
  },
  input: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    fontSize: 15,
    maxHeight: 100,
    color: '#000',
  },
  sendButton: {
    backgroundColor: '#0078fe',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    justifyContent: 'center',
  },
  editContainer: {
    backgroundColor: '#fff8e1',
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#ffd54f',
  },
  editLabel: { fontSize: 12, color: '#666', marginBottom: 6 },
  editInputContainer: { flexDirection: 'row', alignItems: 'flex-end' },

  editButtonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    // marginTop: 8,
  },

  editInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#ffd54f',
    color: '#000',
  },
  editSendButton: {
    backgroundColor: '#0078fe',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    marginRight: 8,
  },
  senderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  editCancelButton: {
    backgroundColor: '#666',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '90%',
    height: '50%',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
    backgroundColor: '#fff',
    borderRadius: 30,
    padding: 8,
  },
  modalCloseText: { fontSize: 25, color: '#000', textAlign: 'center' },
  modalImage: {
    width: 250,
    height: 250,
    borderRadius: 200,
  },
  // modalImage: {
  //   width: "100%",
  //   height: "100%",
  //   borderRadius: 100,
  // },
  modalProfileImage: {
    width: 200,
    height: 200,
    borderRadius: 100,
  },
});
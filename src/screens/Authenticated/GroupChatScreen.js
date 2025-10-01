import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
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

// Group messages by section
const prepareMessagesWithSections = messages => {
  if (!messages.length) return [];

  const sortedMessages = [...messages].sort((a, b) => {
    const aTime = a.createdAt.seconds
      ? a.createdAt.seconds * 1000
      : a.createdAt;
    const bTime = b.createdAt.seconds
      ? b.createdAt.seconds * 1000
      : b.createdAt;
    return aTime - bTime;
  });

  const result = [];
  let currentSection = null;

  sortedMessages.forEach(msg => {
    const section = getSectionLabel(msg.createdAt);
    if (section !== currentSection) {
      result.push({
        id: `section-${section}`,
        type: 'section',
        title: section,
        timestamp: msg.createdAt,
      });
      currentSection = section;
    }
    result.push({
      ...msg,
      type: 'message',
    });
  });

  return result;
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
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialLoaded, setInitialLoaded] = useState(false);

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
    const messagesWithSections = prepareMessagesWithSections(messages);

  // After messages are fetched initially
  useEffect(() => {
    scrollToBottom(messagesWithSections)
  }, [messagesWithSections, initialLoaded]);

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

    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);
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
    Alert.alert('Delete Message', 'Are you sure you want to delete this message?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteMessage(groupId, message.id);
          setShowOptions(null);
        },
      },
    ]);
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

  const scrollToBottom = () => {
    if (!initialLoaded && messagesWithSections.length > 0) {
      try {
        setTimeout(() => {
          flatListRef.current?.scrollToIndex({
          index: messagesWithSections.length - 1,
          animated: false,
        });
        setInitialLoaded(true);
        }, 500)
      } catch (e) {
        // fallback if not measured yet
        setTimeout(() => {
          flatListRef.current?.scrollToEnd({ animated: true });
        setInitialLoaded(true);
        }, 500)
      }
    }
  };


  const renderItem = ({ item }) => {
    if (item.type === 'section') {
      return (
        <View style={styles.sectionContainer}>
          <Text style={styles.sectionHeader}>{item.title}</Text>
        </View>
      );
    }

    const isMe = item.senderId === userId;
    const senderName = isMe ? 'You' : item.senderName || 'Unknown';
    const senderImage = item.senderId && allUsers[item.senderId]?.profileImage;

    const formattedTime = new Date(
      item.createdAt.seconds ? item.createdAt.seconds * 1000 : item.createdAt
    ).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    const time = formattedTime.replace(/am|pm/, match => match.toUpperCase());

    // Extract initials for fallback
    const initials = item.senderName
      ? item.senderName
        .split(' ')
        .map(part => part[0])
        .join('')
        .toUpperCase()
      : 'U';

    return (
      <View style={[styles.messageWrapper, isMe && styles.myMessageWrapper]}>
        {!isMe && (
          <View style={styles.senderContainer}>
            {senderImage ? (
              <TouchableOpacity
                onPress={() => {
                  setModalImage(senderImage);
                  setModalVisible(true);
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
                  { backgroundColor: '#667781', justifyContent: 'center', alignItems: 'center' },
                ]}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold' }}>{initials}</Text>
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
              if (hideOptionsTimeout.current) clearTimeout(hideOptionsTimeout.current);

              // auto-hide after 20 seconds
              hideOptionsTimeout.current = setTimeout(() => {
                setShowOptions(null);
              }, 20000);
            }
          }}
          style={[styles.messageContainer, isMe ? styles.myMessage : styles.otherMessage]}
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
            <TouchableOpacity onPress={() => startEditing(item)} style={styles.optionButton}>
              <EditIcon />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleDelete(item)} style={styles.optionButton}>
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
        <Header title="Group chat" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2d677aff" />
          <Text style={styles.loadingText}>Loading messages...</Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Header title="Group chat" />
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
        style={{ flex: 1 }}
      >
        {/* TouchableOpacity to hide options when tapping outside */}
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
            contentContainerStyle={{ paddingVertical: 10 }}
            style={styles.container}
            onContentSizeChange={() => scrollToBottom}
            onLayout={() => scrollToBottom}
          />
        </TouchableOpacity>

        {editingMessage ? (
          <View style={styles.editContainer}>
            <Text style={styles.editLabel}>Editing message</Text>
            <View style={styles.editInputContainer}>
              <TextInput
                ref={editInputRef}
                style={styles.editInput}
                value={editText}
                onChangeText={setEditText}
                placeholder="Edit your message..."
                placeholderTextColor={'gray'}
              />
              <TouchableOpacity onPress={handleEdit} style={styles.editSendButton}>
                <Text style={{ color: '#fff' }}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={cancelEdit} style={styles.editCancelButton}>
                <Text style={{ color: '#fff' }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              value={text}
              onChangeText={setText}
              placeholder="Type a message..."
              placeholderTextColor={'gray'}
            />
            <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
              <Text style={{ color: '#fff' }}>Send</Text>
            </TouchableOpacity>
          </View>
        )}
      </KeyboardAvoidingView>

      {/* Profile Image Modal with Close Button */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalCloseText}>✕</Text>
            </TouchableOpacity>
            <Image
              source={{ uri: modalImage }}
              style={styles.modalImage}
              resizeMode="contain"
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#e5ddd5' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#e5ddd5' },
  loadingText: { marginTop: 10, color: '#2d677aff', fontSize: 16 },
  sectionContainer: { alignItems: 'center', marginVertical: 10 },
  sectionHeader: { backgroundColor: '#e5ddd5', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, color: '#667781', fontWeight: '500', fontSize: 12 },
  messageWrapper: { marginVertical: 2, marginHorizontal: 8, alignItems: 'flex-start' },
  myMessageWrapper: { alignItems: 'flex-end' },
  messageContainer: { padding: 8, borderRadius: 8, maxWidth: '75%', marginBottom: 2 },
  myMessage: { backgroundColor: '#0b4180ff', borderTopRightRadius: 2, marginRight: 5 },
  otherMessage: { backgroundColor: '#2f545fff', borderTopLeftRadius: 2, marginLeft: 5 },
  senderName: { fontSize: 12, fontWeight: '600', color: '#667781', marginBottom: 2 },
  profileImage: { width: 25, height: 25, borderRadius: 16, marginRight: 2 },
  myMessageText: { color: '#faf3f3ff', fontSize: 15 },
  otherMessageText: { color: '#fff', fontSize: 15 },
  messageFooter: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 2 },
  timeText: { fontSize: 11, color: '#f5f7f8ff' },
  optionsContainer: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 4, marginRight: 8 },
  optionButton: { padding: 6, marginLeft: 8, backgroundColor: '#fff', borderRadius: 16, elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.2, shadowRadius: 1 },
  editIcon: { fontSize: 16 },
  deleteIcon: { fontSize: 16 },
  inputContainer: { flexDirection: 'row', padding: 8, backgroundColor: '#f0f0f0', borderTopWidth: 1, borderTopColor: '#ddd', alignItems: 'center' },
  input: { flex: 1, backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, marginRight: 8, fontSize: 15, maxHeight: 100 },
  sendButton: { backgroundColor: '#0078fe', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, justifyContent: 'center' },
  editContainer: { backgroundColor: '#fff8e1', padding: 12, borderTopWidth: 1, borderTopColor: '#ffd54f' },
  editLabel: { fontSize: 12, color: '#666', marginBottom: 6 },
  editInputContainer: { flexDirection: 'row', alignItems: 'center' },
  editInput: { flex: 1, backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 16, paddingVertical: 8, marginRight: 8, fontSize: 15, borderWidth: 1, borderColor: '#ffd54f' },
  editSendButton: { backgroundColor: '#0078fe', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8, marginRight: 8 },
  senderContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  editCancelButton: { backgroundColor: '#666', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 8 },

  // Modal styles
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
    backgroundColor: '#ffffffff',
    borderRadius: 15,
    padding: 8,
  },
  modalCloseText: { fontSize: 25, color: '#000' },
  modalImage: {
    width: '100%',
    height: '100%',
    borderRadius: 12,
  },
});



//Nishant Code
// import React, { useState, useEffect, useRef } from 'react';
// import {
//   View,
//   Text,
//   FlatList,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   Alert,
//   KeyboardAvoidingView,
//   Platform,
//   ActivityIndicator,
// } from 'react-native';
// import { useSelector } from 'react-redux';
// import {
//   sendMessage,
//   editMessage,
//   deleteMessage,
//   ensureUserInGroup,
//   fetchCollection,
// } from '../../Services/firestoreServices';
// import { useGroupMessages } from '../../hooks/useGroupMessages';
// import Header from '../../components/Header'; // Make sure to import your Header component

// // Icons (you can replace these with your actual icon imports)
// const EditIcon = () => <Text style={styles.editIcon}>✏️</Text>;
// const DeleteIcon = () => <Text style={styles.deleteIcon}>🗑️</Text>;

// // Helper to get section label
// const getSectionLabel = timestamp => {
//   const msgDate =
//     typeof timestamp === 'number'
//       ? new Date(timestamp * 1000)
//       : timestamp.seconds
//       ? new Date(timestamp.seconds * 1000)
//       : new Date(timestamp);
//   const today = new Date();
//   const yesterday = new Date();
//   yesterday.setDate(today.getDate() - 1);

//   if (
//     msgDate.getDate() === today.getDate() &&
//     msgDate.getMonth() === today.getMonth() &&
//     msgDate.getFullYear() === today.getFullYear()
//   )
//     return 'Today';

//   if (
//     msgDate.getDate() === yesterday.getDate() &&
//     msgDate.getMonth() === yesterday.getMonth() &&
//     msgDate.getFullYear() === yesterday.getFullYear()
//   )
//     return 'Yesterday';

//   return msgDate.toLocaleDateString(undefined, {
//     day: 'numeric',
//     month: 'long',
//     year: 'numeric',
//   });
// };

// // Group messages by section and add section headers as items
// const prepareMessagesWithSections = messages => {
//   if (!messages.length) return [];

//   // Sort messages by timestamp (oldest first)
//   const sortedMessages = [...messages].sort((a, b) => {
//     const aTime = a.createdAt.seconds
//       ? a.createdAt.seconds * 1000
//       : a.createdAt;
//     const bTime = b.createdAt.seconds
//       ? b.createdAt.seconds * 1000
//       : b.createdAt;
//     return aTime - bTime;
//   });

//   const result = [];
//   let currentSection = null;

//   sortedMessages.forEach(msg => {
//     const section = getSectionLabel(msg.createdAt);

//     // Add section header if it's a new section
//     if (section !== currentSection) {
//       result.push({
//         id: `section-${section}`,
//         type: 'section',
//         title: section,
//         timestamp: msg.createdAt,
//       });
//       currentSection = section;
//     }

//     // Add the message
//     result.push({
//       ...msg,
//       type: 'message',
//     });
//   });

//   return result;
// };

// export default function GroupChatScreen() {
//   const [groupId, setGroupId] = useState(null);
//   const [text, setText] = useState('');
//   const [editingMessage, setEditingMessage] = useState(null);
//   const [editText, setEditText] = useState('');
//   const [showOptions, setShowOptions] = useState(null);
//   const userId = useSelector(state => state.auth?.user);
//   const messages = useGroupMessages(groupId) || [];
//   const flatListRef = useRef(null);
//   const editInputRef = useRef(null);
//   const [userData, setUserData] = useState(null);
//   const [loading, setLoaing] = useState(true);

//   const getUserData = async () => {
//     const user = await fetchCollection('users', userId);
//     if (user) setUserData(user);
//   };

//   useEffect(() => {
//     fetchAllData();
//   }, [userId]);

//   const fetchAllData = async () => {
//     try {
//       if (!userId) return;
//       const gId = await ensureUserInGroup(userId);
//       setGroupId(gId);
//       getUserData();
//     } catch (error) {
//       setLoaing(false);
//     } finally {
//       setLoaing(false);
//     }
//   };

// // Scroll to bottom when messages change
// useEffect(() => {
//   if (flatListRef.current && messages.length > 0) {
//     setTimeout(() => {
//       flatListRef.current.scrollToEnd({ animated: true });
//     }, 100);
//   }
// }, [messages]);

//   const handleSend = async () => {
//     if (!text.trim() || !groupId) return;
//     await sendMessage(groupId, userData, text.trim());
//     setText('');
//   };

//   const handleEdit = async () => {
//     if (!editText.trim() || !editingMessage) return;
//     if (editingMessage.text.trim() !== editText.trim())
//       await editMessage(groupId, editingMessage.id, editText.trim());
//     setEditingMessage(null);
//     setEditText('');
//     setShowOptions(null);
//   };

//   const handleDelete = async message => {
//     Alert.alert(
//       'Delete Message',
//       'Are you sure you want to delete this message?',
//       [
//         {
//           text: 'Cancel',
//           style: 'cancel',
//         },
//         {
//           text: 'Delete',
//           style: 'destructive',
//           onPress: async () => {
//             await deleteMessage(groupId, message.id);
//             setShowOptions(null);
//           },
//         },
//       ],
//     );
//   };

//   const startEditing = message => {
//     setEditingMessage(message);
//     setEditText(message.text);
//     setShowOptions(null);
//     setTimeout(() => {
//       editInputRef.current?.focus();
//     }, 100);
//   };

//   const cancelEdit = () => {
//     setEditingMessage(null);
//     setEditText('');
//   };

//   const renderItem = ({ item }) => {
//     if (item.type === 'section') {
//       return (
//         <View style={styles.sectionContainer}>
//           <Text style={styles.sectionHeader}>{item.title}</Text>
//         </View>
//       );
//     }

//     const isMe = item.senderId === userId;
//     const senderName = isMe ? 'You' : item.senderName || 'Unknown';

//     const formattedTime = new Date(
//       item.createdAt.seconds ? item.createdAt.seconds * 1000 : item.createdAt,
//     ).toLocaleTimeString([], {
//       hour: '2-digit',
//       minute: '2-digit',
//       hour12: true,
//     });
//     const time = formattedTime.replace(/am|pm/, match => match.toUpperCase());

//     return (
//       <View style={[styles.messageWrapper, isMe && styles.myMessageWrapper]}>
//         {!isMe && <Text style={styles.senderName}>{senderName}</Text>}
//         <TouchableOpacity
//           onLongPress={() => isMe && setShowOptions(item.id)}
//           style={[
//             styles.messageContainer,
//             isMe ? styles.myMessage : styles.otherMessage,
//           ]}
//         >
//           <Text style={isMe ? styles.myMessageText : styles.otherMessageText}>
//             {item.text}
//           </Text>
//           <View style={styles.messageFooter}>
//             <Text style={styles.timeText}>
//               {time} {item.edited ? '(edited)' : ''}
//             </Text>
//           </View>
//         </TouchableOpacity>

//         {showOptions === item.id && isMe && (
//           <View style={styles.optionsContainer}>
//             <TouchableOpacity
//               onPress={() => startEditing(item)}
//               style={styles.optionButton}
//             >
//               <EditIcon />
//             </TouchableOpacity>
//             <TouchableOpacity
//               onPress={() => handleDelete(item)}
//               style={styles.optionButton}
//             >
//               <DeleteIcon />
//             </TouchableOpacity>
//           </View>
//         )}
//       </View>
//     );
//   };

//   const messagesWithSections = prepareMessagesWithSections(messages);

//   if (loading) {
//     return (
//       <>
//         <Header title="Group chat" />
//         <View style={styles.loadingContainer}>
//           <ActivityIndicator size="large" color="#2d677aff" />
//           <Text style={styles.loadingText}>Loading messages...</Text>
//         </View>
//       </>
//     );
//   }

//   return (
//     <>
//       <Header title="Group chat" />
//       <KeyboardAvoidingView
//         behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
//         keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
//         style={{ flex: 1 }}
//       >
//         <View style={styles.container}>
//           <FlatList
//             ref={flatListRef}
//             data={messagesWithSections}
//             renderItem={renderItem}
//             keyExtractor={item => item.id}
//             contentContainerStyle={{ paddingVertical: 10 }}
// onContentSizeChange={() => {
//   if (flatListRef.current && messages.length > 0) {
//     flatListRef.current.scrollToEnd({ animated: true });
//   }
// }}
//           />

//           {editingMessage ? (
//             <View style={styles.editContainer}>
//               <Text style={styles.editLabel}>Editing message</Text>
//               <View style={styles.editInputContainer}>
//                 <TextInput
//                   ref={editInputRef}
//                   style={styles.editInput}
//                   value={editText}
//                   onChangeText={setEditText}
//                   placeholder="Edit your message..."
//                   placeholderTextColor={'gray'}
//                 />
//                 <TouchableOpacity
//                   onPress={handleEdit}
//                   style={styles.editSendButton}
//                 >
//                   <Text style={{ color: '#fff' }}>Save</Text>
//                 </TouchableOpacity>
//                 <TouchableOpacity
//                   onPress={cancelEdit}
//                   style={styles.editCancelButton}
//                 >
//                   <Text style={{ color: '#fff' }}>Cancel</Text>
//                 </TouchableOpacity>
//               </View>
//             </View>
//           ) : (
//             <View style={styles.inputContainer}>
//               <TextInput
//                 style={styles.input}
//                 value={text}
//                 onChangeText={setText}
//                 placeholder="Type a message..."
//                 placeholderTextColor={'gray'}
//               />
//               <TouchableOpacity onPress={handleSend} style={styles.sendButton}>
//                 <Text style={{ color: '#fff' }}>Send</Text>
//               </TouchableOpacity>
//             </View>
//           )}
//         </View>
//       </KeyboardAvoidingView>
//     </>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#e5ddd5',
//   },
//   loadingContainer: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#e5ddd5',
//   },
//   loadingText: {
//     marginTop: 10,
//     color: '#2d677aff',
//     fontSize: 16,
//   },
//   sectionContainer: {
//     alignItems: 'center',
//     marginVertical: 10,
//   },
//   sectionHeader: {
//     backgroundColor: '#e5ddd5',
//     paddingHorizontal: 12,
//     paddingVertical: 4,
//     borderRadius: 12,
//     color: '#667781',
//     fontWeight: '500',
//     fontSize: 12,
//   },
//   messageWrapper: {
//     marginVertical: 2,
//     marginHorizontal: 8,
//     alignItems: 'flex-start',
//   },
//   myMessageWrapper: {
//     alignItems: 'flex-end',
//   },
//   messageContainer: {
//     padding: 8,
//     borderRadius: 8,
//     maxWidth: '75%',
//     marginBottom: 2,
//   },
//   myMessage: {
//     backgroundColor: '#0b4180ff',
//     borderTopRightRadius: 2,
//     marginRight: 5,
//   },
//   otherMessage: {
//     backgroundColor: '#2f545fff',
//     borderTopLeftRadius: 2,
//     marginLeft: 5,
//   },
//   senderName: {
//     fontSize: 12,
//     fontWeight: '600',
//     color: '#667781',
//     marginBottom: 2,
//     marginLeft: 6,
//   },
//   myMessageText: {
//     color: '#faf3f3ff',
//     fontSize: 15,
//   },
//   otherMessageText: {
//     color: '#fff',
//     fontSize: 15,
//   },
//   messageFooter: {
//     flexDirection: 'row',
//     justifyContent: 'flex-end',
//     marginTop: 2,
//   },
//   timeText: {
//     fontSize: 11,
//     color: '#f5f7f8ff',
//   },
//   optionsContainer: {
//     flexDirection: 'row',
//     justifyContent: 'flex-end',
//     marginTop: 4,
//     marginRight: 8,
//   },
//   optionButton: {
//     padding: 6,
//     marginLeft: 8,
//     backgroundColor: '#fff',
//     borderRadius: 16,
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 1 },
//     shadowOpacity: 0.2,
//     shadowRadius: 1,
//   },
//   editIcon: {
//     fontSize: 16,
//   },
//   deleteIcon: {
//     fontSize: 16,
//   },
//   inputContainer: {
//     flexDirection: 'row',
//     padding: 8,
//     backgroundColor: '#f0f0f0',
//     borderTopWidth: 1,
//     borderTopColor: '#ddd',
//     alignItems: 'center',
//   },
//   input: {
//     flex: 1,
//     backgroundColor: '#fff',
//     borderRadius: 20,
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     marginRight: 8,
//     fontSize: 15,
//     maxHeight: 100,
//   },
//   sendButton: {
//     backgroundColor: '#0078fe',
//     borderRadius: 20,
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     justifyContent: 'center',
//   },
//   editContainer: {
//     backgroundColor: '#fff8e1',
//     padding: 12,
//     borderTopWidth: 1,
//     borderTopColor: '#ffd54f',
//   },
//   editLabel: {
//     fontSize: 12,
//     color: '#666',
//     marginBottom: 6,
//   },
//   editInputContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   editInput: {
//     flex: 1,
//     backgroundColor: '#fff',
//     borderRadius: 20,
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     marginRight: 8,
//     fontSize: 15,
//     borderWidth: 1,
//     borderColor: '#ffd54f',
//   },
//   editSendButton: {
//     backgroundColor: '#0078fe',
//     borderRadius: 20,
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//     marginRight: 8,
//   },
//   editCancelButton: {
//     backgroundColor: '#666',
//     borderRadius: 20,
//     paddingHorizontal: 12,
//     paddingVertical: 8,
//   },
// });
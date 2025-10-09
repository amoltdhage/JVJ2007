// // src/components/Header.js
// import { useNavigation } from '@react-navigation/native';
// import React, { useState } from 'react';
// import { useTranslation } from 'react-i18next';
// import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
// import DropDownPicker from 'react-native-dropdown-picker';
// import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

// export default function Header({ title, showBack = false }) {
//   const navigation = useNavigation();

//     const { i18n } = useTranslation();

//   const [open, setOpen] = useState(false);
//   const [language, setLanguage] = useState(i18n.language);
//   const [items, setItems] = useState([
//     { label: 'English', value: 'en' },
//     { label: 'मराठी', value: 'mr' },
//   ]);

//   const handleLanguageChange = lang => {
//     setLanguage(lang);
//     i18n.changeLanguage(lang);
//   };

//   return (
//     <View style={styles.header}>
//       {/* Left: Drawer Menu OR Back Button */}
//       {showBack ? (
//         <TouchableOpacity
//           onPress={() => navigation.goBack()}
//           style={styles.leftBtn}
//         >
//           <MaterialIcon name="arrow-back" size={26} color="#fff" />
//         </TouchableOpacity>
//       ) : (
//         <TouchableOpacity
//           onPress={() => navigation?.openDrawer()}
//           style={styles.leftBtn}
//         >
//           <MaterialIcon name="menu" size={26} color="#fff" />
//         </TouchableOpacity>
//       )}

//       {/* Center: Title */}
//       <Text style={styles.title} numberOfLines={1}>
//         {title}
//       </Text>

//       {/* Right: Notification Button */}
//       {/* <TouchableOpacity onPress={() => navigation?.navigate('Notifications')} style={styles.rightBtn}>
//         <MaterialIcon name="notifications" size={26} color="#fff" />
//       </TouchableOpacity> */}

//       {/* Right: Language Dropdown */}
//       <View style={styles.dropdownContainer}>
//         <DropDownPicker
//           open={open}
//           value={language}
//           items={items}
//           setOpen={setOpen}
//           setValue={setLanguage}
//           setItems={setItems}
//           onChangeValue={handleLanguageChange}
//           style={styles.dropdown}
//           dropDownContainerStyle={styles.dropdownList}
//           textStyle={{ color: '#fff', fontSize: 12 }}
//           arrowIconStyle={{ tintColor: '#fff' }}
//           placeholder=""
//           showTickIcon={false}
//           zIndex={9999}
//         />
//       </View>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     backgroundColor: '#002b5c',
//     paddingHorizontal: 16,
//     paddingVertical: 12,
//     elevation: 4,
//     paddingTop: 30,
//   },
//   leftBtn: {
//     padding: 4,
//   },
//   rightBtn: {
//     padding: 4,
//   },
//   title: {
//     flex: 1,
//     fontSize: 18,
//     color: '#fff',
//     fontWeight: 'bold',
//     textAlign: 'center',
//   },

//   dropdownContainer: {
//     width: 95,
//     zIndex: 1000,
//   },
//   dropdown: {
//     backgroundColor: '#003f7f',
//     borderColor: '#007bff',
//     height: 36,
//   },
//   dropdownList: {
//     backgroundColor: '#003f7f',
//     borderColor: '#007bff',
//   },
// });

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

export default function Header({
  title,
  showBack = false,
  hideDropdown = false,
}) {
  const navigation = useNavigation();
  const { i18n } = useTranslation();

  const [modalVisible, setModalVisible] = useState(false);
  const languages = [
    { label: 'मराठी', value: 'mr' },
    { label: 'English', value: 'en' },
  ];

  const changeLanguage = lang => {
    i18n.changeLanguage(lang);
    setModalVisible(false);
  };

  return (
    <View style={styles.header}>
      {/* Back or Menu */}
      {showBack ? (
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.leftBtn}
        >
          <MaterialIcon name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          onPress={() => navigation.openDrawer()}
          style={styles.leftBtn}
        >
          <Text style={styles.btnText}>☰</Text>
        </TouchableOpacity>
      )}

      {/* Title */}
      <Text style={styles.title}>{title}</Text>

      {/* Language Button */}
      {!hideDropdown ? <TouchableOpacity
        style={styles.langBtn}
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.langBtnText}>
          {i18n.language === 'en' ? 'English' : 'मराठी'}
        </Text>
      </TouchableOpacity> : null}

      {/* Language Selection Modal */}
        <Modal
          visible={modalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback>
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>
                    Select Language / भाषा निवडा
                  </Text>
                  {languages.map((lang, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={styles.langOption}
                      onPress={() => changeLanguage(lang.value)}
                    >
                      <Text style={styles.langOptionText}>{lang.label}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#002b5c',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 30,
  },
  leftBtn: { padding: 8 },
  btnText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  title: {
    flex: 1,
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  langBtn: { padding: 8, backgroundColor: '#0055a0', borderRadius: 6 },
  langBtnText: { color: '#fff', fontWeight: 'bold' },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    paddingVertical: 20,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  langOption: {
    paddingVertical: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  langOptionText: { fontSize: 18, fontWeight: 'bold', color: '#002b5c' },
});

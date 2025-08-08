import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  FlatList,
  Platform,PermissionsAndroid
} from 'react-native';
import Header from '../components/Header';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import { Picker } from '@react-native-picker/picker';
import DatePicker from 'react-native-date-picker';  // <--- Added
import RNFS from 'react-native-fs';
const EVENT_INFO = {
  titleBig: 'JVJ 2007 - 10th Batch',
  subtitle: 'Get Together',
  dateLine: '📅 25th October 2025, Saturday',
  timeLine: '⏰ 10:00 AM - 4:30 PM',
  placeLine: '📍 Janta Vidyalaya, Jamod',
};

const REG_COUNTER_KEY = 'GT_REG_COUNTER'; // store numeric counter
const REG_LIST_KEY = 'GT_REGS'; // store list of regs

const GetTogetherForm = ({ navigation }) => {
  // form state
  const [form, setForm] = useState({
    fullName: '',
    dob: null,           // <--- Changed dobYear to dob (Date object)
    mobile: '',
    village: '',
    attending: '',       // start empty so user must select
    childrenCount: '0',
    comments: '',
  });

  // children details array of objects { name:'', age:'' }
  const [children, setChildren] = useState([]);

  // UI state
  const [errors, setErrors] = useState({});
  const [submittedData, setSubmittedData] = useState(null); // filled registration after submit
  const [regId, setRegId] = useState(null);
  const [loadingPDF, setLoadingPDF] = useState(false);
  const [dobPickerOpen, setDobPickerOpen] = useState(false);

  useEffect(() => {
    // if childrenCount changes, prepare children array length
    const count = parseInt(form.childrenCount || '0', 3);
    const arr = [];
    for (let i = 0; i < count; i++) {
      arr.push(children[i] || { name: '', age: '' });
    }
    setChildren(arr);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.childrenCount]);

  const handleChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleChildChange = (index, field, val) => {
    const cloned = [...children];
    cloned[index] = { ...cloned[index], [field]: val };
    setChildren(cloned);
  };

  const validate = () => {
    const newErr = {};
    if (!form.attending) {
      newErr.attending = 'Please select if you are attending';
    }
    if (form.attending === 'yes') {
      if (!form.fullName.trim()) {
        newErr.fullName = 'Full name is required';
      }
      if (!form.dob) {
        newErr.dob = 'Date of birth is required';
      }
      if (!form.mobile.trim()) {
        newErr.mobile = 'Mobile number required';
      } else if (!/^\d{10}$/.test(form.mobile)) {
        newErr.mobile = 'Mobile must be 10 digits';
      }
      if (!form.village.trim()) {
        newErr.village = 'Village/City required';
      }
      // validate children details if any
      const count = parseInt(form.childrenCount || '0', 3);
      for (let i = 0; i < count; i++) {
        if (!children[i] || !children[i].name?.trim()) {
          newErr[`child_name_${i}`] = 'Child name required';
        }
        if (!children[i] || !children[i].age?.trim()) {
          newErr[`child_age_${i}`] = 'Child age required';
        }
      }
    }

    setErrors(newErr);
    return Object.keys(newErr).length === 0;
  };

  // generate reg id by incrementing counter saved in AsyncStorage
  const generateRegId = async () => {
    try {
      const cur = await AsyncStorage.getItem(REG_COUNTER_KEY);
      let next = 1;
      if (cur) {
        const num = parseInt(cur, 10);
        if (!isNaN(num)) next = num + 1;
      }
      await AsyncStorage.setItem(REG_COUNTER_KEY, String(next));
      // format number to 3 digits
      const numStr = String(next).padStart(3, '0');
      return `2007-10thBatchID-${numStr}`;
    } catch (err) {
      // fallback
      const fallback = `2007-10thBatchID-001`;
      return fallback;
    }
  };

  const handleSubmit = async () => {
    if (!validate()) {
      Alert.alert('Please fix errors', 'Complete required fields highlighted in red.');
      return;
    }

    if (form.attending === 'no') {
      // Just show thank-you if no
      setSubmittedData({ attending: 'no' });
      return;
    }

    const regIdLocal = await generateRegId();
    setRegId(regIdLocal);

    const totalPersons = 1 + parseInt(form.childrenCount || '0', 3);
    const payload = {
      regId: regIdLocal,
      createdAt: new Date().toISOString(),
      ...form,
      children,
      totalPersons,
    };

    // store registration locally (append to list)
    try {
      const existing = await AsyncStorage.getItem(REG_LIST_KEY);
      let arr = [];
      if (existing) arr = JSON.parse(existing);
      arr.push(payload);
      await AsyncStorage.setItem(REG_LIST_KEY, JSON.stringify(arr));
    } catch (err) {
      console.warn('Failed store reg:', err);
    }

    // show success view
    setSubmittedData(payload);
  };

//   // Create PDF using react-native-html-to-pdf
//   const handleDownloadPDF = async () => {
//   if (!submittedData || submittedData.attending === 'no') return;
//   setLoadingPDF(true);

//   // Format DOB as DD/MM/YYYY for PDF display
//   const dobFormatted = submittedData.dob
//     ? new Date(submittedData.dob).toLocaleDateString('en-GB')
//     : '-';

//   const html = `
//     <html>
//       <head>
//         <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
//         <style>
//           body { font-family: Arial, sans-serif; padding: 16px; color: #222;}
//           .header { text-align: center; background:#002b5c; color:white; padding:12px; border-radius:6px; }
//           .section { margin-top:12px; padding:10px; border:1px solid #ccc; border-radius:6px; }
//           .label { font-weight: bold; }
//           .small { font-size: 12px; color: #555; }
//         </style>
//       </head>
//       <body>
//         <div class="header">
//           <h2>${EVENT_INFO.titleBig}</h2>
//           <div style="font-size:14px">${EVENT_INFO.subtitle}</div>
//         </div>

//         <div class="section">
//           <div class="label">Registration ID:</div>
//           <div>${submittedData.regId}</div>
//           <div class="small">Registered at: ${new Date(submittedData.createdAt).toLocaleString()}</div>
//         </div>

//         <div class="section">
//           <div class="label">Participant Info</div>
//           <div><strong>Name:</strong> ${submittedData.fullName}</div>
//           <div><strong>DOB:</strong> ${dobFormatted}</div>
//           <div><strong>Mobile:</strong> ${submittedData.mobile}</div>
//           <div><strong>Village/City:</strong> ${submittedData.village}</div>
//           <div><strong>Attending:</strong> ${submittedData.attending}</div>
//           <div><strong>Children:</strong> ${submittedData.children.length}</div>
//           ${
//             submittedData.children.length > 0
//               ? `<div><strong>Children details:</strong><ul>` +
//                 submittedData.children
//                   .map((c) => `<li>${c.name} (age ${c.age})</li>`)
//                   .join('') +
//                 `</ul></div>`
//               : ''
//           }
//           <div><strong>Comments:</strong> ${submittedData.comments || '-'}</div>
//         </div>

//         <div class="section">
//           <div class="label">Event</div>
//           <div>${EVENT_INFO.dateLine}</div>
//           <div>${EVENT_INFO.timeLine}</div>
//           <div>${EVENT_INFO.placeLine}</div>
//           <div style="margin-top:8px; font-weight:bold; color:#002b5c;">Let's reconnect, relive memories, and celebrate our school bond!</div>
//         </div>
//       </body>
//     </html>
//   `;

//   try {
//     const options = {
//       html,
//       fileName: `${submittedData.regId}`,
//       directory: 'Download', // Saves to Downloads folder on Android for easy access
//     };
//     const file = await RNHTMLtoPDF.convert(options);
//     setLoadingPDF(false);
//     Alert.alert('PDF Saved', `Saved file at:\n${file.filePath}`);
//   } catch (err) {
//     setLoadingPDF(false);
//     Alert.alert('PDF Error', 'Could not create PDF. Please Contact Admin 9890332831');
//     console.warn(err);
//   }
// };


 // Request Android storage permission at runtime
  async function requestStoragePermission() {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission Required',
            message: 'This app needs access to your storage to save PDFs',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    return true; // iOS - no permission needed
  }

  const handleDownloadPDF = async () => {
    if (!submittedData || submittedData.attending === 'no') return;

    const hasPermission = await requestStoragePermission();
    if (!hasPermission) {
      Alert.alert('Permission Denied', 'Storage permission is required to save the PDF.');
      return;
    }

    setLoadingPDF(true);

    // Format DOB as DD/MM/YYYY
    const dobFormatted = submittedData.dob
      ? new Date(submittedData.dob).toLocaleDateString('en-GB')
      : '-';

const html = `
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Event Registration</title>
  <link href="https://fonts.googleapis.com/css2?family=Roboto&display=swap" rel="stylesheet" />
  <style>
    /* Reset & base */
    body {
      font-family: 'Roboto', Arial, sans-serif;
      color: #333;
      margin: 0;
      padding: 24px;
      background: #f9f9f9;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .container {
      max-width: 700px;
      margin: auto;
      background: white;
      border-radius: 12px;
      box-shadow: 0 0 15px rgba(0,0,0,0.1);
      padding: 24px 32px;
    }
    .header {
      text-align: center;
      background-color: #002b5c;
      color: #fff;
      padding: 20px 16px;
      border-radius: 12px 12px 0 0;
      box-shadow: inset 0 -3px 8px rgba(0,0,0,0.2);
    }
    .header h2 {
      margin: 0 0 6px 0;
      font-weight: 700;
      font-size: 28px;
      letter-spacing: 1px;
    }
    .header .subtitle {
      font-weight: 400;
      font-size: 16px;
      opacity: 0.85;
    }
    .section {
      margin-top: 24px;
      padding: 18px 24px;
      border: 1px solid #d1d7e0;
      border-radius: 10px;
      background: #fff;
      box-shadow: 0 1px 4px rgba(0,0,0,0.05);
    }
    .label {
      font-weight: 700;
      font-size: 16px;
      margin-bottom: 8px;
      color: #002b5c;
      border-bottom: 2px solid #002b5c;
      padding-bottom: 4px;
    }
    .field {
      font-size: 15px;
      margin-bottom: 8px;
      line-height: 1.4;
      color: #444;
    }
    .small {
      font-size: 13px;
      color: #666;
      margin-top: 4px;
      font-style: italic;
    }
    ul.children-list {
      padding-left: 20px;
      margin-top: 6px;
      color: #444;
      list-style-type: disc;
    }
    ul.children-list li {
      margin-bottom: 4px;
    }
    .footer-note {
      margin-top: 24px;
      text-align: center;
      font-weight: 600;
      font-size: 16px;
      color: #002b5c;
      letter-spacing: 0.5px;
    }
    .bottom-footer {
      margin-top: 40px;
      text-align: center;
      font-size: 14px;
      color: #666;
      font-style: italic;
      border-top: 1px solid #ddd;
      padding-top: 16px;
      letter-spacing: 0.3px;
    }
    .bottom-footer a {
      color: #002b5c;
      text-decoration: none;
      font-weight: 600;
    }
    .bottom-footer a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>${EVENT_INFO.titleBig}</h2>
      <div class="subtitle">${EVENT_INFO.subtitle}</div>
    </div>

    <div class="section">
      <div class="label">Registration ID</div>
      <div class="field">${submittedData.regId}</div>
      <div class="small">Registered at: ${new Date(submittedData.createdAt).toLocaleString()}</div>
    </div>

    <div class="section">
      <div class="label">Participant Information</div>
      <div class="field"><strong>Name:</strong> ${submittedData.fullName}</div>
      <div class="field"><strong>DOB:</strong> ${dobFormatted}</div>
      <div class="field"><strong>Mobile:</strong> ${submittedData.mobile}</div>
      <div class="field"><strong>Village/City:</strong> ${submittedData.village}</div>
      <div class="field"><strong>Attending:</strong> ${submittedData.attending}</div>
      <div class="field"><strong>Children:</strong> ${submittedData.children.length}</div>
      ${
        submittedData.children.length > 0
          ? `<div class="field"><strong>Children details:</strong>
            <ul class="children-list">` +
            submittedData.children
              .map((c) => `<li>${c.name} (age ${c.age})</li>`)
              .join('') +
            `</ul></div>`
          : ''
      }
      <div class="field"><strong>Comments:</strong> ${submittedData.comments || '-'}</div>
    </div>

    <div class="section">
      <div class="label">Event Details</div>
      <div class="field">${EVENT_INFO.dateLine}</div>
      <div class="field">${EVENT_INFO.timeLine}</div>
      <div class="field">${EVENT_INFO.placeLine}</div>
      <div class="footer-note">Let's reconnect, relive memories, and celebrate our school bond!</div>
    </div>

    <div class="bottom-footer">
      <p>Thank you for registering! See you soon at the event.</p>
     <p>Visit us: 
  <a href="#" onclick="event.preventDefault();" style="color:#002b5c; text-decoration:none; cursor:default;">
    https://www.jamod.in
  </a>
</p>
    </div>
  </div>
</body>
</html>
`;


    try {
      // Create PDF in default cache directory first
      const options = {
        html,
        fileName: `${submittedData.regId}`,
        directory: 'Documents', // Use Documents to get app accessible folder
      };
      const file = await RNHTMLtoPDF.convert(options);

      // Define a custom folder path (example: /Download/YourAppFolder)
      const customDir = `${RNFS.DownloadDirectoryPath}`;

      // Check if folder exists, create if not
      const folderExists = await RNFS.exists(customDir);
      if (!folderExists) {
        await RNFS.mkdir(customDir);
      }

      // Destination file path
      const destPath = `${customDir}/${submittedData.regId}.pdf`;

      // Move the PDF from cache to custom folder
      await RNFS.moveFile(file.filePath, destPath);

      setLoadingPDF(false);
      Alert.alert('PDF Saved', `Saved file at:\n${destPath}`);
    } catch (err) {
      setLoadingPDF(false);
      Alert.alert('PDF Error', 'Could not create PDF. Please Contact Admin 9890332831');
      console.warn(err);
    }
  };



  const resetForm = () => {
    setForm({
      fullName: '',
      dob: null,
      mobile: '',
      village: '',
      attending: '',
      childrenCount: '0',
      comments: '',
    });
    setChildren([]);
    setErrors({});
    setSubmittedData(null);
    setRegId(null);
  };

  // UI: success view (after submit)
  const renderSuccessView = () => {
    if (!submittedData) return null;
    if (submittedData.attending === 'no') {
      return (
        <ScrollView contentContainerStyle={styles.container}>
          <Header title={EVENT_INFO.subtitle} navigation={navigation} showBack />
          <View style={styles.successInner}>
            <View style={styles.memoryCard}>
              <Text style={styles.bigTitle}>{EVENT_INFO.titleBig}</Text>
              <Text style={styles.subtitle}>{EVENT_INFO.subtitle}</Text>
              <View style={styles.detailBox}>
                <Text style={styles.detail}>{EVENT_INFO.dateLine}</Text>
                <Text style={styles.detail}>{EVENT_INFO.timeLine}</Text>
                <Text style={styles.detail}>{EVENT_INFO.placeLine}</Text>
              </View>
              <View style={{ marginTop: 24, alignItems: 'center' }}>
                <Text style={{ fontSize: 16, fontWeight: '700', color: '#002b5c', textAlign: 'center' }}>
                  Thank you for your response! We’ll miss you at the event.
                </Text>
                <TouchableOpacity
                  style={[styles.pdfButton, { backgroundColor: '#eee', marginTop: 30 }]}
                  onPress={resetForm}
                >
                  <Text style={{ color: '#002b5c', fontWeight: '700' }}>Go Back</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      );
    }

    // else attending === 'yes', show detailed success with PDF option
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Header title={EVENT_INFO.subtitle} navigation={navigation} showBack />
        <View style={styles.successInner}>
          <View style={styles.memoryCard}>
            <Text style={styles.bigTitle}>{EVENT_INFO.titleBig}</Text>
            <Text style={styles.subtitle}>{EVENT_INFO.subtitle}</Text>

            <View style={styles.detailBox}>
              <Text style={styles.detail}>{EVENT_INFO.dateLine}</Text>
              <Text style={styles.detail}>{EVENT_INFO.timeLine}</Text>
              <Text style={styles.detail}>{EVENT_INFO.placeLine}</Text>
            </View>

            <View style={styles.regBox}>
              <Text style={styles.regIdLabel}>Registration ID</Text>
              <Text style={styles.regId}>{submittedData.regId}</Text>
            </View>

            <View style={{ marginTop: 12 }}>
              <Text style={styles.infoText}><Text style={{ fontWeight: '700' }}>Name:</Text> {submittedData.fullName}</Text>
              <Text style={styles.infoText}><Text style={{ fontWeight: '700' }}>DOB:</Text> {new Date(submittedData.dob).toLocaleDateString('en-GB')}</Text>
              <Text style={styles.infoText}><Text style={{ fontWeight: '700' }}>Mobile:</Text> {submittedData.mobile}</Text>
              <Text style={styles.infoText}><Text style={{ fontWeight: '700' }}>Village/City:</Text> {submittedData.village}</Text>
              <Text style={styles.infoText}><Text style={{ fontWeight: '700' }}>Attending:</Text> {submittedData.attending}</Text>
              <Text style={styles.infoText}><Text style={{ fontWeight: '700' }}>Children:</Text> {submittedData.children.length}</Text>
              <Text style={styles.infoText}><Text style={{ fontWeight: '700' }}>Total persons:</Text> {submittedData.totalPersons}</Text>
            </View>

            {submittedData.children.length > 0 && (
              <View style={{ marginTop: 10 }}>
                <Text style={{ fontWeight: '700' }}>Children Details:</Text>
                {submittedData.children.map((c, i) => (
                  <Text key={i} style={styles.infoText}>• {c.name} — age {c.age}</Text>
                ))}
              </View>
            )}

            <View style={{ marginTop: 12 }}>
              <Text style={{ fontStyle: 'italic' }}>"{`Let's reconnect, relive memories, and celebrate our school bond!`}"</Text>
            </View>

            <View style={{ marginTop: 16, width: '100%' }}>
              <TouchableOpacity style={styles.pdfButton} onPress={handleDownloadPDF}>
                <Text style={styles.pdfButtonText}>{loadingPDF ? 'Preparing PDF...' : 'Download PDF'}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={[styles.pdfButton, { backgroundColor: '#eee', marginTop: 10 }]} onPress={resetForm}>
                <Text style={{ color: '#002b5c', fontWeight: '700' }}>Register Another</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    );
  };

  // Main form UI

  if (submittedData) {
    return renderSuccessView();
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Header title="Get-Together Form" navigation={navigation} showBack />
      <View style={styles.inner}>
        <MaterialIcon name="event" size={56} color="'#002b5c'," style={{ marginBottom: 6 }} />
        <Text style={styles.title}>Are you attending?</Text>

        {/* Attending radio */}
        <View style={{ width: '100%', marginBottom: 16 , alignItems:"center" }}>
          {errors.attending && <Text style={styles.errorText}>{errors.attending}</Text>}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity
              style={form.attending === 'yes' ? styles.radioActive : styles.radioBtn}
              onPress={() => handleChange('attending', 'yes')}
            >
              <Text style={form.attending === 'yes' ? styles.radioTextActive : styles.radioText}>Yes</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={form.attending === 'no' ? styles.radioActive : styles.radioBtn}
              onPress={() => handleChange('attending', 'no')}
            >
              <Text style={form.attending === 'no' ? styles.radioTextActive : styles.radioText}>No</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Show full form only if attending === 'yes' */}
        {form.attending === 'yes' && (
          <>
            {/* Full Name */}
            <View style={styles.inputWrapper}>
              <View style={styles.inputContainer}>
                <MaterialIcon name="person" size={20} style={styles.icon} />
                <TextInput
                  placeholder="Full name"
                  placeholderTextColor="#999"
                  value={form.fullName}
                  onChangeText={(t) => handleChange('fullName', t)}
                  style={styles.input}
                />
              </View>
              {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}
            </View>

            {/* DOB picker */}
            <View style={styles.inputWrapper}>
              <TouchableOpacity style={styles.inputContainer} onPress={() => setDobPickerOpen(true)}>
                <MaterialIcon name="calendar-today" size={20} style={styles.icon} />
                <Text style={[styles.input, { color: form.dob ? '#fff' : '#999' }]}>
                  {form.dob ? form.dob.toLocaleDateString('en-GB') : 'Select date of birth (DD/MM/YYYY)'}
                </Text>
              </TouchableOpacity>
              {errors.dob && <Text style={styles.errorText}>{errors.dob}</Text>}

              <DatePicker
                modal
                mode="date"
                open={dobPickerOpen}
                date={form.dob || new Date(1990, 0, 1)}
                minimumDate={new Date(1989, 0, 1)}
                maximumDate={new Date(1992, 11, 31)}
                locale="en-GB"
                onConfirm={(date) => {
                  setDobPickerOpen(false);
                  handleChange('dob', date);
                }}
                onCancel={() => setDobPickerOpen(false)}
              />
            </View>

            {/* Mobile */}
            <View style={styles.inputWrapper}>
              <View style={styles.inputContainer}>
                <MaterialIcon name="phone" size={20} style={styles.icon} />
                <TextInput
                  placeholder="Mobile number"
                  placeholderTextColor="#999"
                  value={form.mobile}
                  keyboardType="phone-pad"
                  onChangeText={(t) => handleChange('mobile', t)}
                  style={styles.input}
                />
              </View>
              {errors.mobile && <Text style={styles.errorText}>{errors.mobile}</Text>}
            </View>

            {/* Village/City */}
            <View style={styles.inputWrapper}>
              <View style={styles.inputContainer}>
                <MaterialIcon name="location-city" size={20} style={styles.icon} />
                <TextInput
                  placeholder="Village / City"
                  placeholderTextColor="#999"
                  value={form.village}
                  onChangeText={(t) => handleChange('village', t)}
                  style={styles.input}
                />
              </View>
              {errors.village && <Text style={styles.errorText}>{errors.village}</Text>}
            </View>

            {/* Children Count */}
            <View style={styles.inputWrapper}>
              <View style={styles.inputContainer}>
                <MaterialIcon name="family-restroom" size={20} style={styles.icon} />
                <Picker
                  selectedValue={form.childrenCount}
                  style={{ flex: 1, color: '#fff' }}
                  onValueChange={(itemValue) => handleChange('childrenCount', itemValue)}
                  dropdownIconColor="#fff"
                >
                  {[...Array(4).keys()].map((v) => (
                    <Picker.Item key={v} label={`${v}`} value={`${v}`} />
                  ))}
                </Picker>
              </View>
            </View>

            {/* Children details */}
            {children.length > 0 && (
              <View style={{ width: '100%', marginTop: 8 }}>
                <Text style={{ fontWeight: '600', color: '#fff', marginBottom: 6 }}>
                  Children Details
                </Text>
                {children.map((child, i) => (
                  <View key={i} style={styles.childRow}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <TextInput
                        placeholder="Child name"
                        placeholderTextColor="#999"
                        value={child.name}
                        onChangeText={(t) => handleChildChange(i, 'name', t)}
                        style={[styles.input, { color: '#fff' }]}
                      />
                      {errors[`child_name_${i}`] && (
                        <Text style={styles.errorText}>{errors[`child_name_${i}`]}</Text>
                      )}
                    </View>
                    <View style={{ width: 70 }}>
                      <TextInput
                        placeholder="Age"
                        placeholderTextColor="#999"
                        value={child.age}
                        keyboardType="numeric"
                        onChangeText={(t) => handleChildChange(i, 'age', t)}
                        style={[styles.input, { color: '#fff' }]}
                      />
                      {errors[`child_age_${i}`] && (
                        <Text style={styles.errorText}>{errors[`child_age_${i}`]}</Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Comments */}
            <View style={styles.inputWrapper}>
              <View style={styles.inputContainer}>
                <MaterialIcon name="edit" size={20} style={styles.icon} />
                <TextInput
                  placeholder="Comments (optional)"
                  placeholderTextColor="#999"
                  value={form.comments}
                  onChangeText={(t) => handleChange('comments', t)}
                  style={[styles.input, { height: 80 }]}
                  multiline
                />
              </View>
            </View>

            {/* Submit */}
            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
              <Text style={styles.submitText}>Submit</Text>
            </TouchableOpacity>
          </>
        )}

        {/* If attending === 'no' show thank-you message */}
        {form.attending === 'no' && (
          <View style={{ marginTop: 24, padding: 16, backgroundColor: '#002b5c', borderRadius: 8 }}>
            <Text style={{ color: '#fff', fontSize: 16, textAlign: 'center' }}>
              Thank you for your response! We will miss you at the event.
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

export default GetTogetherForm;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    // backgroundColor: '#00172D',
    backgroundColor: '#eef4ff',
    alignItems: 'center',
    paddingBottom: 80,
  },
  inner: {
    width: '90%',
    paddingVertical: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    color: '#002b5c',
    fontWeight: '700',
    marginBottom: 16,
  },
  inputWrapper: {
    width: '100%',
    marginBottom: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    backgroundColor: '#002b5c',
    borderRadius: 6,
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 44,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingLeft: 8,
  },
  icon: {
    color: '#00b4db',
  },
  radioBtn: {
    borderWidth: 2,
    borderColor: '#002b5c',
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  radioActive: {
    backgroundColor: '#002b5c',
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  radioText: {
    color: '#002b5c',
    fontWeight: '600',
  },
  radioTextActive: {
    color: '#fff',  //#00172D',
    fontWeight: '600',
  },
  submitBtn: {
    backgroundColor: '#002b5c',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 12,
    width: '100%',
    alignItems: 'center',
  },
  submitText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
  },
  errorText: {
    color: '#ff6961',
    marginTop: 4,
  },
  childRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  successInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  memoryCard: {
    backgroundColor: '#004080',
    borderRadius: 12,
    padding: 16,
    width: '90%',
    alignItems: 'center',
  },
  bigTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#00b4db',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: '#fff',
    marginTop: 6,
  },
  detailBox: {
    marginTop: 12,
    alignItems: 'center',
  },
  detail: {
    color: '#99ccff',
    fontSize: 14,
  },
  regBox: {
    backgroundColor: '#002b5c',
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  regIdLabel: {
    fontWeight: '700',
    color: '#00b4db',
  },
  regId: {
    color: '#fff',
    fontSize: 20,
    marginTop: 4,
  },
  infoText: {
    color: '#fff',
    fontSize: 16,
    marginTop: 4,
  },
  pdfButton: {
    backgroundColor: '#00b4db',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  pdfButtonText: {
    color: '#00172D',
    fontWeight: '700',
    fontSize: 16,
  },
});










// import React, { useEffect, useState } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   TextInput,
//   TouchableOpacity,
//   Alert,
//   Modal,
//   FlatList,
//   Platform,
// } from 'react-native';
// import Header from '../components/Header';
// import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import RNHTMLtoPDF from 'react-native-html-to-pdf';
// import { Picker } from '@react-native-picker/picker';

// const EVENT_INFO = {
//   titleBig: 'JVJ 2007 - 10th Batch',
//   subtitle: 'Get Together',
//   dateLine: '📅 25th October 2025, Saturday',
//   timeLine: '⏰ 10:00 AM - 4:30 PM',
//   placeLine: '📍 Janta Vidyalaya, Jamod',
// };

// const REG_COUNTER_KEY = 'GT_REG_COUNTER'; // store numeric counter
// const REG_LIST_KEY = 'GT_REGS'; // store list of regs

// const GetTogetherForm = ({ navigation }) => {
//   // form state
//   const [form, setForm] = useState({
//     fullName: '',
//     dobYear: '', // year only
//     mobile: '',
//     village: '',
//     attending: 'yes', // 'yes' or 'no'
//     childrenCount: '0', // string because Picker returns string
//     comments: '',
//   });

//   // children details array of objects { name:'', age:'' }
//   const [children, setChildren] = useState([]);

//   // UI state
//   const [errors, setErrors] = useState({});
//   const [showYearModal, setShowYearModal] = useState(false);
//   const [submittedData, setSubmittedData] = useState(null); // filled registration after submit
//   const [regId, setRegId] = useState(null);
//   const [loadingPDF, setLoadingPDF] = useState(false);

//   // available years for DOB (example: 1989-1992 and some extras if needed)
//   const YEARS = ['1989', '1990', '1991', '1992'];

//   useEffect(() => {
//     // if childrenCount changes, prepare children array length
//     const count = parseInt(form.childrenCount || '0', 10);
//     const arr = [];
//     for (let i = 0; i < count; i++) {
//       arr.push(children[i] || { name: '', age: '' });
//     }
//     setChildren(arr);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [form.childrenCount]);

//   const handleChange = (name, value) => {
//     setForm((prev) => ({ ...prev, [name]: value }));
//     setErrors((prev) => ({ ...prev, [name]: '' }));
//   };

//   const handleChildChange = (index, field, val) => {
//     const cloned = [...children];
//     cloned[index] = { ...cloned[index], [field]: val };
//     setChildren(cloned);
//   };

//   const validate = () => {
//     const newErr = {};
//     if (!form.fullName.trim()) {
//       newErr.fullName = 'Full name is required';
//     }
//     if (!form.dobYear) {
//       newErr.dobYear = 'Birth year required';
//     }
//     if (!form.mobile.trim()) {
//       newErr.mobile = 'Mobile number required';
//     } else if (!/^\d{10}$/.test(form.mobile)) {
//       newErr.mobile = 'Mobile must be 10 digits';
//     }
//     if (!form.village.trim()) {
//       newErr.village = 'Village/City required';
//     }
//     // validate children details if any
//     const count = parseInt(form.childrenCount || '0', 10);
//     for (let i = 0; i < count; i++) {
//       if (!children[i] || !children[i].name?.trim()) {
//         newErr[`child_name_${i}`] = 'Child name required';
//       }
//       if (!children[i] || !children[i].age?.trim()) {
//         newErr[`child_age_${i}`] = 'Child age required';
//       }
//     }

//     setErrors(newErr);
//     return Object.keys(newErr).length === 0;
//   };

//   // generate reg id by incrementing counter saved in AsyncStorage
//   const generateRegId = async () => {
//     try {
//       const cur = await AsyncStorage.getItem(REG_COUNTER_KEY);
//       let next = 1;
//       if (cur) {
//         const num = parseInt(cur, 10);
//         if (!isNaN(num)) next = num + 1;
//       }
//       await AsyncStorage.setItem(REG_COUNTER_KEY, String(next));
//       // format number to 3 digits
//       const numStr = String(next).padStart(3, '0');
//       return `2007-10thBatchID-${numStr}`;
//     } catch (err) {
//       // fallback
//       const fallback = `2007-10thBatchID-001`;
//       return fallback;
//     }
//   };

//   const handleSubmit = async () => {
//     if (!validate()) {
//       Alert.alert('Please fix errors', 'Complete required fields highlighted in red.');
//       return;
//     }

//     const regIdLocal = await generateRegId();
//     setRegId(regIdLocal);

//     const totalPersons = 1 + parseInt(form.childrenCount || '0', 10);
//     const payload = {
//       regId: regIdLocal,
//       createdAt: new Date().toISOString(),
//       ...form,
//       children,
//       totalPersons,
//     };

//     // store registration locally (append to list)
//     try {
//       const existing = await AsyncStorage.getItem(REG_LIST_KEY);
//       let arr = [];
//       if (existing) arr = JSON.parse(existing);
//       arr.push(payload);
//       await AsyncStorage.setItem(REG_LIST_KEY, JSON.stringify(arr));
//     } catch (err) {
//       console.warn('Failed store reg:', err);
//     }

//     // show success view
//     setSubmittedData(payload);
//   };

//   // Create PDF using react-native-html-to-pdf
//   const handleDownloadPDF = async () => {
//     if (!submittedData) return;
//     setLoadingPDF(true);

//     const html = `
//       <html>
//         <head>
//           <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
//           <style>
//             body { font-family: Arial, sans-serif; padding: 16px; color: #222;}
//             .header { text-align: center; background:#002b5c; color:white; padding:12px; border-radius:6px; }
//             .section { margin-top:12px; padding:10px; border:1px solid #ccc; border-radius:6px; }
//             .label { font-weight: bold; }
//             .small { font-size: 12px; color: #555; }
//           </style>
//         </head>
//         <body>
//           <div class="header">
//             <h2>${EVENT_INFO.titleBig}</h2>
//             <div style="font-size:14px">${EVENT_INFO.subtitle}</div>
//           </div>

//           <div class="section">
//             <div class="label">Registration ID:</div>
//             <div>${submittedData.regId}</div>
//             <div class="small">Registered at: ${new Date(submittedData.createdAt).toLocaleString()}</div>
//           </div>

//           <div class="section">
//             <div class="label">Participant Info</div>
//             <div><strong>Name:</strong> ${submittedData.fullName}</div>
//             <div><strong>Birth year:</strong> ${submittedData.dobYear}</div>
//             <div><strong>Mobile:</strong> ${submittedData.mobile}</div>
//             <div><strong>Village/City:</strong> ${submittedData.village}</div>
//             <div><strong>Attending:</strong> ${submittedData.attending}</div>
//             <div><strong>Children:</strong> ${submittedData.children.length}</div>
//             ${submittedData.children.length > 0 ? `<div><strong>Children details:</strong><ul>` + submittedData.children.map(c => `<li>${c.name} (age ${c.age})</li>`).join('') + `</ul></div>` : ''}
//             <div><strong>Comments:</strong> ${submittedData.comments || '-'}</div>
//           </div>

//           <div class="section">
//             <div class="label">Event</div>
//             <div>${EVENT_INFO.dateLine}</div>
//             <div>${EVENT_INFO.timeLine}</div>
//             <div>${EVENT_INFO.placeLine}</div>
//             <div style="margin-top:8px; font-weight:bold; color:#002b5c;">Let's reconnect, relive memories, and celebrate our school bond!</div>
//           </div>
//         </body>
//       </html>
//     `;

//     try {
//       const options = {
//         html,
//         fileName: `${submittedData.regId}`,
//         directory: 'Documents',
//       };
//       const file = await RNHTMLtoPDF.convert(options);
//       setLoadingPDF(false);
//       Alert.alert('PDF Saved', `Saved file at:\n${file.filePath}`);
//     } catch (err) {
//       setLoadingPDF(false);
//       Alert.alert('PDF Error', 'Could not create PDF. Make sure react-native-html-to-pdf is installed and configured.');
//       console.warn(err);
//     }
//   };

//   const resetForm = () => {
//     setForm({
//       fullName: '',
//       dobYear: '',
//       mobile: '',
//       village: '',
//       attending: 'yes',
//       childrenCount: '0',
//       comments: '',
//     });
//     setChildren([]);
//     setErrors({});
//     setSubmittedData(null);
//     setRegId(null);
//   };

//   // small UI helpers
//   const renderYearModal = () => (
//     <Modal visible={showYearModal} transparent animationType="slide">
//       <View style={styles.modalBackdrop}>
//         <View style={styles.modalBox}>
//           <Text style={styles.modalTitle}>Select Birth Year</Text>
//           <FlatList
//             data={YEARS}
//             keyExtractor={(i) => i}
//             renderItem={({ item }) => (
//               <TouchableOpacity
//                 style={styles.yearItem}
//                 onPress={() => {
//                   handleChange('dobYear', item);
//                   setShowYearModal(false);
//                 }}
//               >
//                 <Text style={styles.yearText}>{item}</Text>
//               </TouchableOpacity>
//             )}
//           />
//           <TouchableOpacity style={styles.modalClose} onPress={() => setShowYearModal(false)}>
//             <Text style={{ color: '#fff' }}>Close</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </Modal>
//   );

//   // UI: success view (after submit)
//   const renderSuccessView = () => {
//     if (!submittedData) return null;
//     return (
//       <ScrollView contentContainerStyle={styles.container}>
//         <Header title={EVENT_INFO.subtitle} navigation={navigation} showBack />
//         <View style={styles.successInner}>
//           <View style={styles.memoryCard}>
//             <Text style={styles.bigTitle}>{EVENT_INFO.titleBig}</Text>
//             <Text style={styles.subtitle}>{EVENT_INFO.subtitle}</Text>

//             <View style={styles.detailBox}>
//               <Text style={styles.detail}>{EVENT_INFO.dateLine}</Text>
//               <Text style={styles.detail}>{EVENT_INFO.timeLine}</Text>
//               <Text style={styles.detail}>{EVENT_INFO.placeLine}</Text>
//             </View>

//             <View style={styles.regBox}>
//               <Text style={styles.regIdLabel}>Registration ID</Text>
//               <Text style={styles.regId}>{submittedData.regId}</Text>
//             </View>

//             <View style={{ marginTop: 12 }}>
//               <Text style={styles.infoText}><Text style={{ fontWeight: '700' }}>Name:</Text> {submittedData.fullName}</Text>
//               <Text style={styles.infoText}><Text style={{ fontWeight: '700' }}>Birth year:</Text> {submittedData.dobYear}</Text>
//               <Text style={styles.infoText}><Text style={{ fontWeight: '700' }}>Mobile:</Text> {submittedData.mobile}</Text>
//               <Text style={styles.infoText}><Text style={{ fontWeight: '700' }}>Village/City:</Text> {submittedData.village}</Text>
//               <Text style={styles.infoText}><Text style={{ fontWeight: '700' }}>Attending:</Text> {submittedData.attending}</Text>
//               <Text style={styles.infoText}><Text style={{ fontWeight: '700' }}>Children:</Text> {submittedData.children.length}</Text>
//               <Text style={styles.infoText}><Text style={{ fontWeight: '700' }}>Total persons:</Text> {submittedData.totalPersons}</Text>
//             </View>

//             {submittedData.children.length > 0 && (
//               <View style={{ marginTop: 10 }}>
//                 <Text style={{ fontWeight: '700' }}>Children Details:</Text>
//                 {submittedData.children.map((c, i) => (
//                   <Text key={i} style={styles.infoText}>• {c.name} — age {c.age}</Text>
//                 ))}
//               </View>
//             )}

//             <View style={{ marginTop: 12 }}>
//               <Text style={{ fontStyle: 'italic' }}>"{`Let's reconnect, relive memories, and celebrate our school bond!`}"</Text>
//             </View>

//             <View style={{ marginTop: 16, width: '100%' }}>
//               <TouchableOpacity style={styles.pdfButton} onPress={handleDownloadPDF}>
//                 <Text style={styles.pdfButtonText}>{loadingPDF ? 'Preparing PDF...' : 'Download PDF'}</Text>
//               </TouchableOpacity>

//               <TouchableOpacity style={[styles.pdfButton, { backgroundColor: '#eee', marginTop: 10 }]} onPress={resetForm}>
//                 <Text style={{ color: '#002b5c', fontWeight: '700' }}>Register Another</Text>
//               </TouchableOpacity>
//             </View>
//           </View>
//         </View>
//       </ScrollView>
//     );
//   };

//   // main form UI
//   if (submittedData) {
//     return renderSuccessView();
//   }

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <Header title="🎉 Get-Together Form" navigation={navigation} showBack />
//       <View style={styles.inner}>
//         <MaterialIcon name="event" size={56} color="#00b4db" style={{ marginBottom: 6 }} />
//         <Text style={styles.title}>Fill your details</Text>

//         {/* Full Name */}
//         <View style={styles.inputWrapper}>
//           <View style={styles.inputContainer}>
//             <MaterialIcon name="person" size={20} style={styles.icon} />
//             <TextInput
//               placeholder="Full name"
//               placeholderTextColor="#999"
//               value={form.fullName}
//               onChangeText={(t) => handleChange('fullName', t)}
//               style={styles.input}
//             />
//           </View>
//           {errors.fullName && <Text style={styles.errorText}>{errors.fullName}</Text>}
//         </View>

//         {/* Year-only DOB (modal picker) */}
//         <View style={styles.inputWrapper}>
//           <TouchableOpacity style={styles.inputContainer} onPress={() => setShowYearModal(true)}>
//             <MaterialIcon name="calendar-today" size={20} style={styles.icon} />
//             <Text style={[styles.input, { color: form.dobYear ? '#fff' : '#999' }]}>
//               {form.dobYear ? form.dobYear : 'Select birth year'}
//             </Text>
//           </TouchableOpacity>
//           {errors.dobYear && <Text style={styles.errorText}>{errors.dobYear}</Text>}
//         </View>

//         {/* Mobile */}
//         <View style={styles.inputWrapper}>
//           <View style={styles.inputContainer}>
//             <MaterialIcon name="phone" size={20} style={styles.icon} />
//             <TextInput
//               placeholder="Mobile number"
//               placeholderTextColor="#999"
//               value={form.mobile}
//               keyboardType="number-pad"
//               maxLength={10}
//               onChangeText={(t) => handleChange('mobile', t.replace(/[^0-9]/g, ''))}
//               style={styles.input}
//             />
//           </View>
//           {errors.mobile && <Text style={styles.errorText}>{errors.mobile}</Text>}
//         </View>

//         {/* Village/City */}
//         <View style={styles.inputWrapper}>
//           <View style={styles.inputContainer}>
//             <MaterialIcon name="location-city" size={20} style={styles.icon} />
//             <TextInput
//               placeholder="Current Village / City"
//               placeholderTextColor="#999"
//               value={form.village}
//               onChangeText={(t) => handleChange('village', t)}
//               style={styles.input}
//             />
//           </View>
//           {errors.village && <Text style={styles.errorText}>{errors.village}</Text>}
//         </View>

//         {/* Attending - custom radio */}
//         <View style={{ width: '100%', marginTop: 10 }}>
//           <Text style={{ color: '#ccc', marginBottom: 6 }}>Are you attending?</Text>
//           <View style={{ flexDirection: 'row', gap: 12 }}>
//             <TouchableOpacity
//               style={form.attending === 'yes' ? styles.radioActive : styles.radioBtn}
//               onPress={() => handleChange('attending', 'yes')}
//             >
//               <Text style={form.attending === 'yes' ? styles.radioTextActive : styles.radioText}>Yes</Text>
//             </TouchableOpacity>
//             <TouchableOpacity
//               style={form.attending === 'no' ? styles.radioActive : styles.radioBtn}
//               onPress={() => handleChange('attending', 'no')}
//             >
//               <Text style={form.attending === 'no' ? styles.radioTextActive : styles.radioText}>No</Text>
//             </TouchableOpacity>
//           </View>
//         </View>

//         {/* Children count (0-5) */}
//         <View style={[styles.inputWrapper, { marginTop: 12 }]}>
//           <Text style={{ color: '#ccc', marginBottom: 6 }}>How many children attending with you?</Text>
//           <View style={styles.pickerWrap}>
//             <Picker
//               selectedValue={form.childrenCount}
//               onValueChange={(val) => handleChange('childrenCount', String(val))}
//               style={Platform.OS === 'ios' ? { height: 160 } : {}}
//               itemStyle={{ color: '#fff' }}
//             >
//               <Picker.Item label="0" value="0" />
//               <Picker.Item label="1" value="1" />
//               <Picker.Item label="2" value="2" />
//               <Picker.Item label="3" value="3" />
//               <Picker.Item label="4" value="4" />
//               <Picker.Item label="5" value="5" />
//             </Picker>
//           </View>
//         </View>

//         {/* Dynamic child inputs */}
//         {children.map((c, idx) => (
//           <View key={idx} style={styles.childBox}>
//             <Text style={{ color: '#ddd', marginBottom: 6 }}>Child {idx + 1}</Text>
//             <View style={styles.inputContainerSmall}>
//               <TextInput
//                 placeholder="Name"
//                 placeholderTextColor="#999"
//                 value={c.name}
//                 onChangeText={(t) => handleChildChange(idx, 'name', t)}
//                 style={[styles.input, { paddingVertical: 6 }]}
//               />
//               <TextInput
//                 placeholder="Age"
//                 placeholderTextColor="#999"
//                 value={c.age}
//                 keyboardType="number-pad"
//                 maxLength={2}
//                 onChangeText={(t) => handleChildChange(idx, 'age', t.replace(/[^0-9]/g, ''))}
//                 style={[styles.input, { width: 90, marginLeft: 8 }]}
//               />
//             </View>
//             {errors[`child_name_${idx}`] && <Text style={styles.errorText}>{errors[`child_name_${idx}`]}</Text>}
//             {errors[`child_age_${idx}`] && <Text style={styles.errorText}>{errors[`child_age_${idx}`]}</Text>}
//           </View>
//         ))}

//         {/* Comments */}
//         <View style={styles.inputWrapper}>
//           <View style={[styles.inputContainer, { minHeight: 100, alignItems: 'flex-start' }]}>
//             <MaterialIcon name="chat" size={20} style={styles.icon} />
//             <TextInput
//               placeholder="Any comments? (optional)"
//               placeholderTextColor="#999"
//               value={form.comments}
//               onChangeText={(t) => handleChange('comments', t)}
//               style={[styles.input, { height: 90, textAlignVertical: 'top' }]}
//               multiline
//             />
//           </View>
//         </View>

//         {/* Submit */}
//         <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
//           <Text style={styles.submitText}>Submit</Text>
//         </TouchableOpacity>
//       </View>

//       {renderYearModal()}
//     </ScrollView>
//   );
// };

// export default GetTogetherForm;

// const styles = StyleSheet.create({
//   container: {
//     backgroundColor: '#121212',
//     flexGrow: 1,
//   },
//   inner: {
//     padding: 16,
//     alignItems: 'center',
//   },
//   title: {
//     color: '#00b4db',
//     fontSize: 20,
//     marginBottom: 12,
//     fontWeight: '700',
//   },
//   inputWrapper: {
//     width: '100%',
//     marginBottom: 10,
//   },
//   inputContainer: {
//     flexDirection: 'row',
//     backgroundColor: '#1e1e1e',
//     borderRadius: 12,
//     padding: 12,
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: '#004e66',
//   },
//   inputContainerSmall: {
//     flexDirection: 'row',
//     backgroundColor: '#1e1e1e',
//     borderRadius: 12,
//     padding: 8,
//     alignItems: 'center',
//     borderWidth: 1,
//     borderColor: '#004e66',
//     width: '100%',
//   },
//   icon: {
//     color: '#00b4db',
//     marginRight: 8,
//   },
//   input: {
//     flex: 1,
//     color: '#fff',
//     fontSize: 16,
//   },
//   errorText: {
//     color: '#ff4444',
//     marginTop: 6,
//     fontSize: 13,
//     paddingLeft: 6,
//   },
//   radioBtn: {
//     borderWidth: 1,
//     borderColor: '#00b4db',
//     paddingHorizontal: 14,
//     paddingVertical: 8,
//     borderRadius: 8,
//   },
//   radioActive: {
//     backgroundColor: '#00b4db',
//     paddingHorizontal: 14,
//     paddingVertical: 8,
//     borderRadius: 8,
//   },
//   radioText: { color: '#ddd', fontWeight: '600' },
//   radioTextActive: { color: '#fff', fontWeight: '700' },
//   pickerWrap: {
//     backgroundColor: '#1e1e1e',
//     borderRadius: 8,
//     overflow: 'hidden',
//     borderWidth: 1,
//     borderColor: '#004e66',
//   },
//   childBox: {
//     width: '100%',
//     marginTop: 8,
//   },
//   submitBtn: {
//     width: '100%',
//     marginTop: 18,
//     backgroundColor: '#002b5c',
//     paddingVertical: 14,
//     borderRadius: 12,
//     alignItems: 'center',
//   },
//   submitText: {
//     color: '#fff',
//     fontWeight: '700',
//     fontSize: 16,
//   },
//   modalBackdrop: {
//     flex: 1,
//     backgroundColor: '#00000066',
//     justifyContent: 'center',
//     alignItems: 'center',
//   },
//   modalBox: {
//     width: '80%',
//     maxHeight: '70%',
//     backgroundColor: '#fff',
//     borderRadius: 10,
//     padding: 12,
//   },
//   modalTitle: {
//     fontSize: 16,
//     fontWeight: '700',
//     marginBottom: 8,
//   },
//   yearItem: {
//     paddingVertical: 12,
//     borderBottomWidth: 1,
//     borderBottomColor: '#eee',
//   },
//   yearText: {
//     fontSize: 16,
//   },
//   modalClose: {
//     marginTop: 10,
//     backgroundColor: '#002b5c',
//     paddingVertical: 10,
//     borderRadius: 8,
//     alignItems: 'center',
//   },

//   /* success view */
//   successInner: {
//     padding: 16,
//     alignItems: 'center',
//   },
//   memoryCard: {
//     backgroundColor: '#FFF8E1',
//     padding: 16,
//     borderRadius: 12,
//     marginVertical: 20,
//     width: '100%',
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     elevation: 4,
//   },
//   bigTitle: {
//     fontSize: 20,
//     fontWeight: '800',
//     color: '#002b5c',
//     textAlign: 'center',
//   },
//   subtitle: {
//     fontSize: 14,
//     color: '#004d73',
//     textAlign: 'center',
//     marginBottom: 8,
//   },
//   detailBox: {
//     alignSelf: 'center',
//     marginTop: 8,
//     paddingLeft: 5,
//   },
//   detail: {
//     color: '#003366',
//     fontSize: 14,
//     marginVertical: 2,
//     textAlign: 'center',
//   },
//   regBox: {
//     marginTop: 12,
//     alignItems: 'center',
//   },
//   regIdLabel: { color: '#666', fontSize: 12 },
//   regId: { fontWeight: '800', marginTop: 4, color: '#002b5c' },
//   infoText: { marginTop: 6, color: '#222' },

//   pdfButton: {
//     backgroundColor: '#002b5c',
//     paddingVertical: 12,
//     borderRadius: 10,
//     alignItems: 'center',
//   },
// });

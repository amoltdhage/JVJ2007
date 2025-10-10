// import React, { useEffect, useRef, useState } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   ScrollView,
//   StatusBar,
//   ActivityIndicator,
// } from 'react-native';
// import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
// import LinearGradient from 'react-native-linear-gradient';
// import DropDownPicker from 'react-native-dropdown-picker';
// import { useTranslation } from 'react-i18next';
// import AuthenticationService from '../../Services/authservice';
// import { useLoading } from '../../../LoadingContext';

// const LoginScreen = ({ navigation }) => {
//   const { t, i18n } = useTranslation();
//   const { isLoading } = useLoading();
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [secureText, setSecureText] = useState(true);
//   const [errors, setErrors] = useState({});
//   const { LoginService } = AuthenticationService();

//   const [open, setOpen] = useState(false);
//   const [language, setLanguage] = useState(i18n.language);
//   const [items, setItems] = useState([
//     { label: 'मराठी', value: 'mr' },
//     { label: 'English', value: 'en' },
//   ]);

//   const passwordRef = useRef(null);

//   const validate = () => {
//     let valid = true;
//     const newErrors = {};
//     if (!email.trim()) {
//       newErrors.email = 'Email is required';
//       valid = false;
//     } else if (!/\S+@\S+\.\S+/.test(email)) {
//       newErrors.email = 'Invalid email';
//       valid = false;
//     }
//     if (!password) {
//       newErrors.password = 'Password is required';
//       valid = false;
//     }
//     setErrors(newErrors);
//     return valid;
//   };

//   const handleLogin = () => {
//     if (validate()) {
//       LoginService(email, password);
//     }
//   };

//   const handleLanguageChange = lang => {
//     setLanguage(lang);
//     i18n.changeLanguage(lang);
//   };

//   useEffect(() => {
//     passwordRef.current?.focus();
//   }, []);

//   return (
//     <ScrollView
//       contentContainerStyle={styles.container}
//       keyboardShouldPersistTaps="handled"
//       scrollEnabled={true}
//     >
//       <StatusBar barStyle="light-content" />
//       <Text style={[styles.title, { marginTop: 25 }]}>{t('login.title')}</Text>
//       <Text style={styles.title2}>{t('login.batch')}</Text>

//       <MaterialIcon name="person-outline" size={60} color="#00b4db" />

//       <Text style={styles.smallText}>{t('login.warning')}</Text>

//       {/* Language Dropdown */}
//       <View style={styles.languageSection}>
//         <Text style={styles.languageLabel}>Select Language / भाषा निवडा</Text>
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
//           textStyle={{ color: '#00b4db' }}
//           zIndex={1000}
//           zIndexInverse={3000}
//           arrowIconStyle={{ tintColor: '#00b4db' }}
//         />
//       </View>

//       <Text style={styles.title}>{t('login.login')}</Text>

//       {/* Email Field */}
//       <View style={styles.inputWrapper}>
//         <View style={styles.inputContainer}>
//           <MaterialIcon name="email" size={22} style={styles.icon} />
//           <TextInput
//             placeholder={t('login.emailPlaceholder')}
//             placeholderTextColor="#999"
//             style={styles.input}
//             value={email}
//             onChangeText={text => {
//               setEmail(text);
//               setErrors({ ...errors, email: '' });
//             }}
//             keyboardType="email-address"
//           />
//         </View>
//         {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
//       </View>

//       {/* Password Field */}
//       <View style={styles.inputWrapper}>
//         <View style={styles.inputContainer}>
//           <MaterialIcon name="lock" size={22} style={styles.icon} />
//           <TextInput
//             ref={passwordRef}
//             placeholder={t('login.passwordPlaceholder')}
//             placeholderTextColor="#999"
//             style={styles.input}
//             secureTextEntry={secureText}
//             value={password}
//             onChangeText={text => {
//               setPassword(text);
//               setErrors({ ...errors, password: '' });
//             }}
//             returnKeyType="done"
//             onSubmitEditing={email?.trim()?.length && password?.trim()?.length && handleLogin}
//           />
//           <TouchableOpacity onPress={() => setSecureText(!secureText)}>
//             <MaterialIcon
//               name={secureText ? 'visibility-off' : 'visibility'}
//               size={22}
//               style={styles.icon}
//             />
//           </TouchableOpacity>
//         </View>
//         {errors.password && (
//           <Text style={styles.errorText}>{errors.password}</Text>
//         )}
//       </View>

//       {/* Login Button */}
//       <TouchableOpacity style={styles.button} onPress={handleLogin}>
//         <LinearGradient colors={['#00b4db', '#0083b0']} style={styles.gradient}>
//           {isLoading ? (
//             <ActivityIndicator size="large" color="#f3f6f7ff" />
//           ) : (
//             <Text style={styles.buttonText}>{t('login.login')}</Text>
//           )}
//         </LinearGradient>
//       </TouchableOpacity>

//       <View style={styles.inlineTextContainer}>
//         <Text style={styles.loginText}>
//           {t('login.forgotPassword')}
//           <TouchableOpacity
//             onPress={() => navigation.navigate('ResetPassword')}
//           >
//             <Text style={styles.linkText}> {t('login.reset')}</Text>
//           </TouchableOpacity>
//         </Text>
//       </View>

//       <View style={styles.inlineTextContainer}>
//         <Text style={styles.loginText}>
//           {t('login.noAccount')}
//           <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
//             <Text style={styles.linkText}> {t('login.signUp')}</Text>
//           </TouchableOpacity>
//         </Text>
//       </View>
//     </ScrollView>
//   );
// };

// export default LoginScreen;

// const styles = StyleSheet.create({
//   container: {
//     flexGrow: 1,
//     backgroundColor: '#121212',
//     alignItems: 'center',
//     paddingVertical: 30,
//     paddingHorizontal: 20,
//     width: '100%',
//   },
//   title: {
//     fontSize: 28,
//     color: '#00b4db',
//     fontWeight: 'bold',
//     textAlign: 'center',
//   },
//   title2: {
//     fontSize: 28,
//     color: '#00b4db',
//     fontWeight: 'bold',
//     marginBottom: 20,
//     textAlign: 'center',
//   },
  // smallText: {
  //   color: '#f1a6a6ff',
  //   fontSize: 15,
  //   textAlign: 'center',
  // },
//   inputWrapper: {
//     width: '100%',
//     marginBottom: 10,
//     marginTop: 20,
//   },
//   inputContainer: {
//     flexDirection: 'row',
//     backgroundColor: '#1e1e1e',
//     borderRadius: 12,
//     padding: 10,
//     alignItems: 'center',
//     borderWidth: 1.3,
//     borderColor: '#004e66',
//   },
//   icon: {
//     color: '#00b4db',
//     marginRight: 10,
//   },
//   input: {
//     flex: 1,
//     color: '#fff',
//     fontSize: 16,
//   },
//   errorText: {
//     color: '#ff4444',
//     marginTop: 5,
//     fontSize: 13,
//     paddingLeft: 5,
//   },
//   button: {
//     width: '100%',
//     marginVertical: 20,
//     borderRadius: 12,
//     overflow: 'hidden',
//     elevation: 3,
//   },
//   gradient: {
//     paddingVertical: 14,
//     alignItems: 'center',
//   },
//   buttonText: {
//     color: '#fff',
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   loginText: {
//     width: '100%',
//     color: '#aaa',
//     fontSize: 14,
//     textAlign: 'center',
//   },
//   inlineTextContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     flexWrap: 'wrap',
//     marginTop: 10,
//   },
//   linkText: {
//     color: '#00b4db',
//     fontWeight: 'bold',
//     fontSize: 16,
//     marginBottom: -4,
//     marginLeft: 8,
//   },

//   languageSection: {
//     width: '100%',
//     marginTop: 20,
//     marginBottom: 15,
//     alignItems: 'center',
//   },
//   languageLabel: {
//     color: '#00b4db',
//     fontSize: 16,
//     fontWeight: '600',
//     marginBottom: 6,
//     textAlign: 'left',
//     width: '100%',
//   },

//   dropdownContainer: {
//     width: '100%',
//     marginBottom: 15,
//     marginTop: 15,
//     zIndex: 10,
//   },
//   dropdown: {
//     backgroundColor: '#1e1e1e',
//     borderColor: '#00b4db',
//   },
//   dropdownList: {
//     backgroundColor: '#1e1e1e',
//     borderColor: '#00b4db',
//   },
// });

import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import DropDownPicker from 'react-native-dropdown-picker';
import { useTranslation } from 'react-i18next';
import AuthenticationService from '../../Services/authservice';
import { useLoading } from '../../../LoadingContext';

const LoginScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const { isLoading } = useLoading();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureText, setSecureText] = useState(true);
  const [errors, setErrors] = useState({});
  const { LoginService } = AuthenticationService();

  const [open, setOpen] = useState(false);
  const [language, setLanguage] = useState(i18n.language);
  const [items, setItems] = useState([
    { label: 'मराठी', value: 'mr' },
    { label: 'English', value: 'en' },
  ]);

  const passwordRef = useRef(null);

  const validate = () => {
    const newErrors = {};
    if (!email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Invalid email';
    if (!password) newErrors.password = 'Password is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = () => {
    if (validate()) LoginService(email, password);
  };

  const handleLanguageChange = lang => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
  };

  useEffect(() => {
    handleLanguageChange("mr");
  }, [])
  
  useEffect(() => {
    passwordRef.current?.focus();
  }, []);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <MaterialIcon name="person-outline" size={52} color="#00b4db" />
        <Text style={styles.title}>JVJ Reconnect</Text>
        <Text style={styles.subtitle}>Login</Text>
      </View>
      <Text style={styles.smallText}>सूचना: जर तुम्ही पहिल्यांदा ॲप वापरत असाल तर आधी आपले खाते तयार करा, त्यासाठी खालील दिलेल्या{'\n'}Sign up वर क्लिक करा.</Text>

      {/* Language Selector */}
      {/* <View style={styles.languageSection}>
        <DropDownPicker
          open={open}
          value={language}
          items={items}
          setOpen={setOpen}
          setValue={setLanguage}
          setItems={setItems}
          onChangeValue={handleLanguageChange}
          style={styles.dropdown}
          dropDownContainerStyle={styles.dropdownList}
          textStyle={styles.dropdownText}
          arrowIconStyle={{ tintColor: '#00b4db' }}
          placeholder="Select language"
        />
      </View> */}

      {/* Email Input */}
      <View style={styles.inputWrapper}>
        <View style={styles.inputContainer}>
          <MaterialIcon name="email" size={18} style={styles.icon} />
          <TextInput
            placeholder="Email Address"
            placeholderTextColor="#888"
            style={styles.input}
            value={email}
            onChangeText={text => {
              setEmail(text);
              setErrors({ ...errors, email: '' });
            }}
            keyboardType="email-address"
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current.focus()}
          />
        </View>
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
      </View>

      {/* Password Input */}
      <View style={styles.inputWrapper}>
        <View style={styles.inputContainer}>
          <MaterialIcon name="lock" size={18} style={styles.icon} />
          <TextInput
            ref={passwordRef}
            placeholder="Password"
            placeholderTextColor="#888"
            style={styles.input}
            secureTextEntry={secureText}
            value={password}
            onChangeText={text => {
              setPassword(text);
              setErrors({ ...errors, password: '' });
            }}
            returnKeyType="done"
            onSubmitEditing={handleLogin}
          />
          <TouchableOpacity onPress={() => setSecureText(!secureText)}>
            <MaterialIcon
              name={secureText ? 'visibility-off' : 'visibility'}
              size={18}
              style={styles.icon}
            />
          </TouchableOpacity>
        </View>
        {errors.password && (
          <Text style={styles.errorText}>{errors.password}</Text>
        )}
      </View>

      {/* Login Button */}
      <TouchableOpacity
        style={styles.button}
        activeOpacity={0.85}
        onPress={handleLogin}
      >
        <LinearGradient colors={['#00b4db', '#0083b0']} style={styles.gradient}>
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Login</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>

      {/* Links */}
      <Text style={styles.linkGroup}>
        Forgot your password?
        <Text
          style={styles.linkText}
          onPress={() => navigation.navigate('ResetPassword')}
        >
          {' '}Reset
        </Text>
      </Text>

      <Text style={styles.linkGroup}>
        Don't have an account?
        <Text
          style={styles.linkText}
          onPress={() => navigation.navigate('SignUp')}
        >
          {' '}Sign up
        </Text>
      </Text>
    </ScrollView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#0d0d0d',
    // alignItems: 'center',
    // justifyContent: 'center',
    paddingHorizontal: '7%',
    paddingVertical: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 22,
    color: '#00b4db',
    fontWeight: '700',
    marginTop: 8,
  },
  subtitle: {
    fontSize: 18,
    color: '#00b4db',
    opacity: 0.8,
    marginTop: 2,
    fontWeight: "bold"
  },
  languageSection: {
    width: '100%',
    marginBottom: 20,
    zIndex: 1000,
  },
  dropdown: {
    backgroundColor: '#161616',
    borderColor: '#00b4db50',
    borderWidth: 1,
    borderRadius: 8,
    height: 42,
  },
  smallText: {
    color: '#f1a6a6ff',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: "bold"
  },
  dropdownList: {
    backgroundColor: '#161616',
    borderColor: '#00b4db50',
  },
  dropdownText: {
    color: '#00b4db',
    fontSize: 14,
  },
  inputWrapper: {
    width: '100%',
    marginTop: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#161616',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#004e6655',
  },
  icon: {
    color: '#00b4db',
    marginRight: 8,
    opacity: 0.8,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 15,
    paddingVertical: 4,
  },
  errorText: {
    color: '#ff5c5c',
    fontSize: 12,
    marginTop: 3,
    marginLeft: 4,
  },
  button: {
    width: '100%',
    marginTop: 28,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
  },
  gradient: {
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  linkGroup: {
    color: '#aaa',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 14,
    width: "100%"
  },
  linkText: {
    color: '#00b4db',
    fontWeight: '600',
  },
});

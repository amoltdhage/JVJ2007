// import React, { useEffect, useState } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   ScrollView,
//   StatusBar,
//   KeyboardAvoidingView,
//   Platform,
//   ActivityIndicator,
//   Animated,
//   Keyboard,
// } from 'react-native';
// import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
// import LinearGradient from 'react-native-linear-gradient';
// import { useLoading } from '../../../LoadingContext';
// import AuthenticationService from '../../Services/authservice';
// import DropDownPicker from 'react-native-dropdown-picker';
// import { useTranslation } from 'react-i18next';

// const SignUpScreen = ({ navigation }) => {
//   const { t, i18n } = useTranslation();
//   const [form, setForm] = useState({
//     firstName: '',
//     lastName: '',
//     email: '',
//     mobile: '',
//     password: '',
//     confirmPassword: '',
//   });

//   const { isLoading } = useLoading();
//   const { SignUpService } = AuthenticationService();

//   const [errors, setErrors] = useState({});
//   const [secureText, setSecureText] = useState(true);
//   const [secureConfirmText, setSecureConfirmText] = useState(true);

//   const [open, setOpen] = useState(false);
//   const [language, setLanguage] = useState(i18n.language);
//   const [items, setItems] = useState([
//     { label: 'मराठी', value: 'mr' },
//     { label: 'English', value: 'en' },
//   ]);

//   const handleChange = (name, value) => {
//     setForm({ ...form, [name]: value });
//     setErrors({ ...errors, [name]: '' }); // clear error as user types
//   };

//   const handleLanguageChange = lang => {
//     setLanguage(lang);
//     i18n.changeLanguage(lang);
//   };

//   const validate = () => {
//     let valid = true;
//     const newErrors = {};

//     if (!form.firstName.trim()) {
//       newErrors.firstName = 'First name is required';
//       valid = false;
//     }
//     if (!form.lastName.trim()) {
//       newErrors.lastName = 'Last name is required';
//       valid = false;
//     }
//     if (!form.email.trim()) {
//       newErrors.email = 'Email is required';
//       valid = false;
//     } else if (!/\S+@\S+\.\S+/.test(form.email)) {
//       newErrors.email = 'Email is invalid';
//       valid = false;
//     }
//     if (!form.mobile.trim()) {
//       newErrors.mobile = 'Mobile number is required';
//       valid = false;
//     } else if (!/^\d{10}$/.test(form.mobile)) {
//       newErrors.mobile = 'Mobile must be 10 digits';
//       valid = false;
//     }
//     if (!form.password) {
//       newErrors.password = 'Password is required';
//       valid = false;
//     } else if (form.password.length < 6) {
//       newErrors.password = 'Min 6 characters';
//       valid = false;
//     }
//     if (!form.confirmPassword) {
//       newErrors.confirmPassword = 'Please confirm password';
//       valid = false;
//     } else if (form.password !== form.confirmPassword) {
//       newErrors.confirmPassword = 'Passwords do not match';
//       valid = false;
//     }

//     setErrors(newErrors);
//     return valid;
//   };

//   const handleSignUp = () => {
//     if (validate()) {
//       const randomNum = Math.floor(100000 + Math.random() * 900000); // 6-digit random number
//       const reversedNum = String(randomNum).split('').reverse().join(''); // reverse the digits

//       const requestBody = {
//         firstName: form.firstName?.trim(),
//         lastName: form.lastName?.trim(),
//         email: form.email,
//         mobile: form.mobile,
//         isAdmin: false,
//         isCashier: false,
//         isAdminCode: `${randomNum}-${form.password}-${reversedNum}`,
//       };
//       SignUpService(requestBody, form.password);
//     }
//   };

//   const [keyboardHeight] = useState(new Animated.Value(0));

//   useEffect(() => {
//     const showSub = Keyboard.addListener('keyboardDidShow', e => {
//       Animated.timing(keyboardHeight, {
//         toValue: e.endCoordinates.height,
//         duration: 250,
//         useNativeDriver: false,
//       }).start();
//     });

//     const hideSub = Keyboard.addListener('keyboardDidHide', () => {
//       Animated.timing(keyboardHeight, {
//         toValue: 0,
//         duration: 250,
//         useNativeDriver: false,
//       }).start();
//     });

//     return () => {
//       showSub.remove();
//       hideSub.remove();
//     };
//   }, []);

//   return (
//     <Animated.View style={{ flex: 1, paddingBottom: keyboardHeight - 1 }}>
//       <ScrollView contentContainerStyle={styles.container}>
//         <StatusBar barStyle="light-content" />
//         <MaterialIcon
//           name="person-add-alt"
//           size={60}
//           color="#00b4db"
//           style={{ marginBottom: 10 }}
//         />
//         <Text style={styles.title}>{t('signup.title')}</Text>

//         {/* Language Dropdown */}
//         <View style={styles.languageSection}>
//           <Text style={styles.languageLabel}>Select Language / भाषा निवडा</Text>
//           <DropDownPicker
//             open={open}
//             value={language}
//             items={items}
//             setOpen={setOpen}
//             setValue={setLanguage}
//             setItems={setItems}
//             onChangeValue={handleLanguageChange}
//             style={styles.dropdown}
//             dropDownContainerStyle={styles.dropdownList}
//             textStyle={{ color: '#00b4db' }}
//             zIndex={1000}
//             zIndexInverse={3000}
//             arrowIconStyle={{ tintColor: '#00b4db' }}
//           />
//         </View>

//         {[
//           { name: 'firstName', placeholder: t('signup.firstName'), icon: 'person' },
//           {
//             name: 'lastName',
//             placeholder: t('signup.lastName'),
//             icon: 'person-outline',
//           },
//           { name: 'email', placeholder: t('signup.email'), icon: 'email' },
//           { name: 'mobile', placeholder: t('signup.mobile'), icon: 'phone' },
//         ].map((field, index) => (
//           <View key={index} style={styles.inputWrapper}>
//             <View style={styles.inputContainer}>
//               <MaterialIcon name={field.icon} size={22} style={styles.icon} />
//               <TextInput
//                 placeholder={field.placeholder}
//                 style={styles.input}
//                 placeholderTextColor="#999"
//                 value={form[field.name]}
//                 onChangeText={text => {
//                   if (field?.name === 'mobile') {
//                     text = text.replace(/[^0-9]/g, '');
//                   }
//                   handleChange(field.name, text);
//                 }}
//                 keyboardType={
//                   field?.name === 'mobile'
//                     ? 'numeric'
//                     : field?.name === 'email'
//                     ? 'email-address'
//                     : 'default'
//                 }
//                 maxLength={field?.name === 'mobile' ? 10 : 100}
//               />
//             </View>
//             {errors[field.name] && (
//               <Text style={styles.errorText}>{errors[field.name]}</Text>
//             )}
//           </View>
//         ))}

//         {/* Password */}
//         <View style={styles.inputWrapper}>
//           <View style={styles.inputContainer}>
//             <MaterialIcon name="lock" size={22} style={styles.icon} />
//             <TextInput
//               placeholder={t("signup.password")}
//               secureTextEntry={secureText}
//               style={styles.input}
//               placeholderTextColor="#999"
//               value={form.password}
//               onChangeText={text => handleChange('password', text)}
//               maxLength={15}
//             />
//             <TouchableOpacity onPress={() => setSecureText(!secureText)}>
//               <MaterialIcon
//                 name={secureText ? 'visibility-off' : 'visibility'}
//                 size={22}
//                 style={styles.icon}
//               />
//             </TouchableOpacity>
//           </View>
//           {errors.password && (
//             <Text style={styles.errorText}>{errors.password}</Text>
//           )}
//         </View>

//         {/* Confirm Password */}
//         <View style={styles.inputWrapper}>
//           <View style={styles.inputContainer}>
//             <MaterialIcon name="lock-outline" size={22} style={styles.icon} />
//             <TextInput
//               placeholder={t("signup.confirmPassword")}
//               secureTextEntry={secureConfirmText}
//               style={styles.input}
//               placeholderTextColor="#999"
//               value={form.confirmPassword}
//               onChangeText={text => handleChange('confirmPassword', text)}
//               maxLength={15}
//             />
//             <TouchableOpacity
//               onPress={() => setSecureConfirmText(!secureConfirmText)}
//             >
//               <MaterialIcon
//                 name={secureConfirmText ? 'visibility-off' : 'visibility'}
//                 size={22}
//                 style={styles.icon}
//               />
//             </TouchableOpacity>
//           </View>
//           {errors.confirmPassword && (
//             <Text style={styles.errorText}>{errors.confirmPassword}</Text>
//           )}
//         </View>

//         {/* Submit Button */}
//         <TouchableOpacity style={styles.button} onPress={handleSignUp}>
//           <LinearGradient
//             colors={['#00b4db', '#0083b0']}
//             style={styles.gradient}
//           >
//             {isLoading ? (
//               <ActivityIndicator size="large" color="#f3f6f7ff" />
//             ) : (
//               <Text style={styles.buttonText}>{t("signup.button")}</Text>
//             )}
//           </LinearGradient>
//         </TouchableOpacity>

//         {/* Already have account */}
//         {/* <TouchableOpacity onPress={() => navigation.navigate('login')}>
//           <Text style={styles.loginText}>
//             Already have an account?{' '}
//             <Text style={{ color: '#00b4db', fontWeight: 'bold' }}>Login</Text>
//           </Text>
//         </TouchableOpacity> */}
//         <View style={styles.inlineTextContainer}>
//           <Text style={styles.loginText}>
//             {t("signup.haveAccount")}
//             <TouchableOpacity onPress={() => navigation.navigate('login')}>
//               <Text style={styles.linkText}> {t("signup.login")}</Text>
//             </TouchableOpacity>
//           </Text>
//         </View>
//       </ScrollView>
//     </Animated.View>
//   );
// };

// export default SignUpScreen;

// const styles = StyleSheet.create({
//   container: {
//     flexGrow: 1,
//     backgroundColor: '#121212',
//     alignItems: 'center',
//     paddingVertical: 30,
//     paddingHorizontal: 20,
//   },
//   title: {
//     fontSize: 28,
//     color: '#00b4db',
//     fontWeight: 'bold',
//     marginBottom: 25,
//   },
//   inputWrapper: {
//     width: '100%',
//     marginBottom: 10,
//   },
//   inputContainer: {
//     flexDirection: 'row',
//     backgroundColor: '#1e1e1e',
//     borderRadius: 12,
//     padding: 14,
//     alignItems: 'center',
//     borderWidth: 1.3,
//     borderColor: '#00b4db',
//     borderColor: '#004e66', // darker shade of blue
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
//     color: '#aaa',
//     marginTop: 10,
//     fontSize: 14,
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
//     marginTop: 5,
//     marginBottom: 30
//   },
//   linkText: {
//     color: '#00b4db',
//     fontWeight: 'bold',
//     fontSize: 16,
//     marginBottom: -4,
//     marginLeft: 10,
//   },

//   languageSection: {
//     width: '100%',
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

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  ActivityIndicator,
  Animated,
  Keyboard,
  Dimensions,
} from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { useLoading } from '../../../LoadingContext';
import AuthenticationService from '../../Services/authservice';
import DropDownPicker from 'react-native-dropdown-picker';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');

const SignUpScreen = ({ navigation }) => {
  const { t, i18n } = useTranslation();
  const { isLoading } = useLoading();
  const { SignUpService } = AuthenticationService();

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({});
  const [secureText, setSecureText] = useState(true);
  const [secureConfirmText, setSecureConfirmText] = useState(true);
  const [open, setOpen] = useState(false);
  const [language, setLanguage] = useState(i18n.language);
  const [items, setItems] = useState([
    { label: 'मराठी', value: 'mr' },
    { label: 'English', value: 'en' },
  ]);
  const [keyboardHeight] = useState(new Animated.Value(0));

  const handleChange = (name, value) => {
    setForm({ ...form, [name]: value });
    setErrors({ ...errors, [name]: '' });
  };

  const handleLanguageChange = lang => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
  };

  useEffect(() => {
    handleLanguageChange('en');
  }, []);

  const validate = () => {
    let valid = true;
    const newErrors = {};

    if (!form.firstName.trim())
      (newErrors.firstName = 'First name is required'), (valid = false);
    if (!form.lastName.trim())
      (newErrors.lastName = 'Last name is required'), (valid = false);
    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Email is invalid';
      valid = false;
    }
    if (!form.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
      valid = false;
    } else if (!/^\d{10}$/.test(form.mobile)) {
      newErrors.mobile = 'Mobile must be 10 digits';
      valid = false;
    }
    if (!form.password) {
      newErrors.password = 'Password is required';
      valid = false;
    } else if (form.password.length < 6) {
      newErrors.password = 'Min 6 characters';
      valid = false;
    }
    if (!form.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm password';
      valid = false;
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSignUp = () => {
    if (validate()) {
      const randomNum = Math.floor(100000 + Math.random() * 900000);
      const reversedNum = String(randomNum).split('').reverse().join('');

      const requestBody = {
        firstName: form.firstName?.trim(),
        lastName: form.lastName?.trim(),
        email: form.email,
        mobile: form.mobile,
        isAdmin: false,
        isCashier: false,
        isAdminCode: `${randomNum}-${form.password}-${reversedNum}`,
      };
      SignUpService(requestBody, form.password).then(res => {
        if(res?.success) {
          handleLanguageChange("mr")
        }
      });
    }
  };

  useEffect(() => {
    const showSub = Keyboard.addListener('keyboardDidShow', e => {
      Animated.timing(keyboardHeight, {
        toValue: e.endCoordinates.height,
        duration: 250,
        useNativeDriver: false,
      }).start();
    });
    const hideSub = Keyboard.addListener('keyboardDidHide', () => {
      Animated.timing(keyboardHeight, {
        toValue: 0,
        duration: 250,
        useNativeDriver: false,
      }).start();
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  return (
      <ScrollView contentContainerStyle={styles.container}>
        <StatusBar barStyle="light-content" />

        <MaterialIcon name="person-add-alt" size={50} color="#00b4db" />
        <Text style={styles.title}>{t('signup.title')}</Text>

        {/* Language Dropdown */}
        {/* <View style={styles.languageSection}>
          <Text style={styles.languageLabel}>Select Language / भाषा निवडा</Text>
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
            textStyle={{ color: '#00b4db', fontSize: 15 }}
            arrowIconStyle={{ tintColor: '#00b4db' }}
          />
        </View> */}

        {[
          {
            name: 'firstName',
            placeholder: t('signup.firstName'),
            icon: 'person',
          },
          {
            name: 'lastName',
            placeholder: t('signup.lastName'),
            icon: 'person-outline',
          },
          { name: 'email', placeholder: t('signup.email'), icon: 'email' },
          { name: 'mobile', placeholder: t('signup.mobile'), icon: 'phone' },
        ].map((field, index) => (
          <View key={index} style={styles.inputWrapper}>
            <View style={styles.inputContainer}>
              <MaterialIcon name={field.icon} size={20} style={styles.icon} />
              <TextInput
                placeholder={field.placeholder}
                style={styles.input}
                placeholderTextColor="#888"
                value={form[field.name]}
                onChangeText={text => {
                  if (field?.name === 'mobile')
                    text = text.replace(/[^0-9]/g, '');
                  handleChange(field.name, text);
                }}
                keyboardType={
                  field?.name === 'mobile'
                    ? 'numeric'
                    : field?.name === 'email'
                    ? 'email-address'
                    : 'default'
                }
                maxLength={field?.name === 'mobile' ? 10 : 100}
              />
            </View>
            {errors[field.name] && (
              <Text style={styles.errorText}>{errors[field.name]}</Text>
            )}
          </View>
        ))}

        {/* Password */}
        <View style={styles.inputWrapper}>
          <View style={styles.inputContainer}>
            <MaterialIcon name="lock" size={20} style={styles.icon} />
            <TextInput
              placeholder={t('signup.password')}
              secureTextEntry={secureText}
              style={styles.input}
              placeholderTextColor="#888"
              value={form.password}
              onChangeText={text => handleChange('password', text)}
              maxLength={15}
            />
            <TouchableOpacity onPress={() => setSecureText(!secureText)}>
              <MaterialIcon
                name={secureText ? 'visibility-off' : 'visibility'}
                size={20}
                style={styles.icon}
              />
            </TouchableOpacity>
          </View>
          {errors.password && (
            <Text style={styles.errorText}>{errors.password}</Text>
          )}
        </View>

        {/* Confirm Password */}
        <View style={styles.inputWrapper}>
          <View style={styles.inputContainer}>
            <MaterialIcon name="lock-outline" size={20} style={styles.icon} />
            <TextInput
              placeholder={t('signup.confirmPassword')}
              secureTextEntry={secureConfirmText}
              style={styles.input}
              placeholderTextColor="#888"
              value={form.confirmPassword}
              onChangeText={text => handleChange('confirmPassword', text)}
              maxLength={15}
            />
            <TouchableOpacity
              onPress={() => setSecureConfirmText(!secureConfirmText)}
            >
              <MaterialIcon
                name={secureConfirmText ? 'visibility-off' : 'visibility'}
                size={20}
                style={styles.icon}
              />
            </TouchableOpacity>
          </View>
          {errors.confirmPassword && (
            <Text style={styles.errorText}>{errors.confirmPassword}</Text>
          )}
        </View>

        {/* Submit Button */}
        <TouchableOpacity style={styles.button} onPress={handleSignUp}>
          <LinearGradient
            colors={['#00b4db', '#0083b0']}
            style={styles.gradient}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#f3f6f7ff" />
            ) : (
              <Text style={styles.buttonText}>{t('signup.button')}</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.inlineTextContainer}>
          <Text style={styles.loginText}>
            {t('signup.haveAccount')}
            <Text
              onPress={() => navigation.navigate('login')}
              style={styles.linkText}
            >
              {' '}
              {t('signup.login')}
            </Text>
          </Text>
        </View>
      </ScrollView>
  );
};

export default SignUpScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#121212',
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: width * 0.06,
  },
  title: {
    fontSize: 24,
    color: '#00b4db',
    fontWeight: '700',
    marginTop: 5,
    marginBottom: 30
  },
  inputWrapper: {
    width: '100%',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    backgroundColor: '#1a1a1a',
    borderRadius: 10,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#004e66',
  },
  icon: {
    color: '#00b4db',
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 15,
  },
  errorText: {
    color: '#ff5252',
    marginTop: 4,
    fontSize: 12,
    paddingLeft: 6,
  },
  button: {
    width: '100%',
    marginVertical: 15,
    borderRadius: 10,
    overflow: 'hidden',
  },
  gradient: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  inlineTextContainer: {
    marginTop: 10,
    marginBottom: 30,
    width: "100%"
  },
  loginText: {
    color: '#aaa',
    fontSize: 14,
    textAlign: 'center',
    // width: '100%',
  },
  linkText: {
    color: '#00b4db',
    fontWeight: 'bold',
    fontSize: 15,
  },
  languageSection: {
    width: '100%',
    marginBottom: 15,
  },
  languageLabel: {
    color: '#00b4db',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 6,
  },
  dropdown: {
    backgroundColor: '#1a1a1a',
    borderColor: '#004e66',
    minHeight: 38,
  },
  dropdownList: {
    backgroundColor: '#1a1a1a',
    borderColor: '#004e66',
  },
});
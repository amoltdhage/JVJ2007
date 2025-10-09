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
  Keyboard,
  Animated,
} from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import DropDownPicker from 'react-native-dropdown-picker';
import { useTranslation } from 'react-i18next';
import '../../i18n/i18n.js'; // import i18n setup
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

  const validate = () => {
    let valid = true;
    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = 'Email is required';
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Invalid email';
      valid = false;
    }
    if (!password) {
      newErrors.password = 'Password is required';
      valid = false;
    }
    setErrors(newErrors);
    return valid;
  };

  const handleLogin = () => {
    if (validate()) {
      LoginService(email, password);
    }
  };

  const handleLanguageChange = lang => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
  };

  const [keyboardHeight] = useState(new Animated.Value(0));

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
    <Animated.View style={{ flex: 1, paddingBottom: keyboardHeight }}>
      <ScrollView contentContainerStyle={styles.container}>
        <StatusBar barStyle="light-content" />
        <Text style={[styles.title, { marginTop: 25 }]}>
          {t('login.title')}
        </Text>
        <Text style={styles.title2}>{t('login.batch')}</Text>

        <MaterialIcon name="person-outline" size={60} color="#00b4db" />

        <Text style={styles.smallText}>{t('login.warning')}</Text>

        {/* Language Dropdown */}
        <View style={styles.languageSection}>
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
            textStyle={{ color: '#00b4db' }}
            zIndex={1000}
            zIndexInverse={3000}
            arrowIconStyle={{ tintColor: '#00b4db' }}
          />
        </View>

        <Text style={styles.title}>{t('login.login')}</Text>

        {/* Email Field */}
        <View style={styles.inputWrapper}>
          <View style={styles.inputContainer}>
            <MaterialIcon name="email" size={22} style={styles.icon} />
            <TextInput
              placeholder={t('login.emailPlaceholder')}
              placeholderTextColor="#999"
              style={styles.input}
              value={email}
              onChangeText={text => {
                setEmail(text);
                setErrors({ ...errors, email: '' });
              }}
              keyboardType="email-address"
            />
          </View>
          {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}
        </View>

        {/* Password Field */}
        <View style={styles.inputWrapper}>
          <View style={styles.inputContainer}>
            <MaterialIcon name="lock" size={22} style={styles.icon} />
            <TextInput
              placeholder={t('login.passwordPlaceholder')}
              placeholderTextColor="#999"
              style={styles.input}
              secureTextEntry={secureText}
              value={password}
              onChangeText={text => {
                setPassword(text);
                setErrors({ ...errors, password: '' });
              }}
            />
            <TouchableOpacity onPress={() => setSecureText(!secureText)}>
              <MaterialIcon
                name={secureText ? 'visibility-off' : 'visibility'}
                size={22}
                style={styles.icon}
              />
            </TouchableOpacity>
          </View>
          {errors.password && (
            <Text style={styles.errorText}>{errors.password}</Text>
          )}
        </View>

        {/* Login Button */}
        <TouchableOpacity style={styles.button} onPress={handleLogin}>
          <LinearGradient
            colors={['#00b4db', '#0083b0']}
            style={styles.gradient}
          >
            {isLoading ? (
              <ActivityIndicator size="large" color="#f3f6f7ff" />
            ) : (
              <Text style={styles.buttonText}>{t('login.login')}</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <View style={styles.inlineTextContainer}>
          <Text style={styles.loginText}>
            {t('login.forgotPassword')}
            <TouchableOpacity onPress={() => navigation.navigate('ResetPassword')}>
              <Text style={styles.linkText}> {t('login.reset')}</Text>
            </TouchableOpacity>
          </Text>
        </View>

        <View style={styles.inlineTextContainer}>
          <Text style={styles.loginText}>
            {t('login.noAccount')}
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
              <Text style={styles.linkText}> {t('login.signUp')}</Text>
            </TouchableOpacity>
          </Text>
        </View>
      </ScrollView>
    </Animated.View>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#121212',
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
    width: '100%',
  },
  title: {
    fontSize: 28,
    color: '#00b4db',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  title2: {
    fontSize: 28,
    color: '#00b4db',
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  smallText: {
    color: '#f1a6a6ff',
    fontSize: 15,
    textAlign: 'center',
  },
  inputWrapper: {
    width: '100%',
    marginBottom: 10,
    marginTop: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1.3,
    borderColor: '#004e66',
  },
  icon: {
    color: '#00b4db',
    marginRight: 10,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
  },
  errorText: {
    color: '#ff4444',
    marginTop: 5,
    fontSize: 13,
    paddingLeft: 5,
  },
  button: {
    width: '100%',
    marginVertical: 20,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
  },
  gradient: {
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loginText: {
    width: '100%',
    color: '#aaa',
    fontSize: 14,
    textAlign: 'center',
  },
  inlineTextContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flexWrap: 'wrap',
    marginTop: 10,
  },
  linkText: {
    color: '#00b4db',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: -4,
    marginLeft: 8,
  },

  languageSection: {
    width: '100%',
    marginTop: 20,
    marginBottom: 15,
    alignItems: 'center',
  },
  languageLabel: {
    color: '#00b4db',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 6,
    textAlign: 'left',
    width: '100%',
  },

  dropdownContainer: {
    width: '100%',
    marginBottom: 15,
    marginTop: 15,
    zIndex: 10,
  },
  dropdown: {
    backgroundColor: '#1e1e1e',
    borderColor: '#00b4db',
  },
  dropdownList: {
    backgroundColor: '#1e1e1e',
    borderColor: '#00b4db',
  },
});

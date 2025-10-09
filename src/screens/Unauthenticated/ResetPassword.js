import React, { useState } from 'react';
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
import { useLoading } from '../../../LoadingContext';
import AuthenticationService from '../../Services/authservice';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import DropDownPicker from 'react-native-dropdown-picker';

export default function ResetPassword() {
  const { t, i18n } = useTranslation();
  const { sendPasswordResetEmail } = AuthenticationService();
  const [form, setForm] = useState({ email: '' });
  const navigation = useNavigation();

  const { isLoading } = useLoading();

  const [errors, setErrors] = useState({});

  const [open, setOpen] = useState(false);
  const [language, setLanguage] = useState(i18n.language);
  const [items, setItems] = useState([
    { label: 'मराठी', value: 'mr' },
    { label: 'English', value: 'en' },
  ]);

  const handleLanguageChange = lang => {
    setLanguage(lang);
    i18n.changeLanguage(lang);
  };

  const handleChange = (name, value) => {
    setForm({ ...form, [name]: value });
    setErrors({ ...errors, [name]: '' }); // clear error as user types
  };

  const validate = () => {
    let valid = true;
    const newErrors = {};

    if (!form.email.trim()) {
      newErrors.email = 'Email is required';
      valid = false;
    } else if (!/\S+@\S+\.\S+/.test(form.email)) {
      newErrors.email = 'Email is invalid';
      valid = false;
    }
    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async () => {
    if (!validate(form)) return;
    sendPasswordResetEmail(form.email).then(res => {
      if (res?.success) navigation.navigate('login');
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar barStyle="light-content" />
      <MaterialIcon
        name="person-add-alt"
        size={60}
        color="#00b4db"
        style={{ marginBottom: 10 }}
      />
      <Text style={styles.title}>{t('resetPassword')}</Text>

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

      <View style={styles.inputWrapper}>
        <View style={styles.inputContainer}>
          <MaterialIcon name="email" size={22} style={styles.icon} />
          <TextInput
            placeholder={t('signup.email')}
            style={styles.input}
            placeholderTextColor="#999"
            value={form?.['email']}
            onChangeText={text => handleChange('email', text)}
            keyboardType="email-address"
            maxLength={100}
          />
        </View>
        {errors?.['email'] && (
          <Text style={styles.errorText}>{errors['email']}</Text>
        )}
      </View>

      {/* Submit Button */}
      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <LinearGradient colors={['#00b4db', '#0083b0']} style={styles.gradient}>
          {isLoading ? (
            <ActivityIndicator size="large" color="#f3f6f7ff" />
          ) : (
            <Text style={styles.buttonText}>{t('resetPassword')}</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>

      {/* Already have account */}
      <View style={styles.inlineTextContainer}>
        <Text style={styles.loginText}>
          {t('rememberedPassword')}
          <TouchableOpacity onPress={() => navigation.navigate('login')}>
            <Text style={styles.linkText}> {t('signup.login')}</Text>
          </TouchableOpacity>
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#121212',
    alignItems: 'center',
    paddingVertical: 120,
    paddingHorizontal: 20,
    height: '100%',
  },
  title: {
    fontSize: 28,
    color: '#00b4db',
    fontWeight: 'bold',
    marginBottom: 25,
  },
  inputWrapper: {
    width: '100%',
    marginBottom: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    backgroundColor: '#1e1e1e',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1.3,
    borderColor: '#00b4db',
    borderColor: '#004e66', // darker shade of blue
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

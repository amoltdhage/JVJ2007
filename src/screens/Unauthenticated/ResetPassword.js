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

export default function ResetPassword({ navigation }) {
  const { sendPasswordResetEmail } = AuthenticationService();
  const [form, setForm] = useState({ email: '' });

  const { isLoading } = useLoading();

  const [errors, setErrors] = useState({});

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
    sendPasswordResetEmail(form.email);
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
        <Text style={styles.title}>Reset Password</Text>

        <View style={styles.inputWrapper}>
          <View style={styles.inputContainer}>
            <MaterialIcon name="email" size={22} style={styles.icon} />
            <TextInput
              placeholder="Email Address"
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
          <LinearGradient
            colors={['#00b4db', '#0083b0']}
            style={styles.gradient}
          >
            {isLoading ? (
              <ActivityIndicator size="large" color="#f3f6f7ff" />
            ) : (
              <Text style={styles.buttonText}>Reset password</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Already have account */}
        <TouchableOpacity onPress={() => navigation.navigate('Auth')}>
          <Text style={styles.loginText}>
            Remembered your password?{' '}
            <Text style={{ color: '#00b4db', fontWeight: 'bold' }}>Login</Text>
          </Text>
        </TouchableOpacity>
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
    height: '100%'
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
    color: '#aaa',
    marginTop: 10,
    fontSize: 14,
  },
});

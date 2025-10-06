import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import AuthenticationService from '../../Services/authservice';
import { useLoading } from '../../../LoadingContext';

const LoginScreen = ({ navigation }) => {
  const { isLoading } = useLoading();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureText, setSecureText] = useState(true);
  const [errors, setErrors] = useState({});
  const { LoginService } = AuthenticationService();

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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : -30}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <StatusBar barStyle="light-content" />

        <Text style={[styles.title, { marginTop: 20 }]}>JVJ Reconnect</Text>
        <Text style={styles.title2}>2007 Batch</Text>
        <MaterialIcon
          name="person-outline"
          size={60}
          color="#00b4db"
          // style={{ marginBottom: 1 }}
        />

        <Text style={styles.title}>Login</Text>

        {/* Email Field */}
        <View style={styles.inputWrapper}>
          <View style={styles.inputContainer}>
            <MaterialIcon name="email" size={22} style={styles.icon} />
            <TextInput
              placeholder="Email Address"
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
              placeholder="Password"
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
              <Text style={styles.buttonText}>Login</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>
        <View style={styles.inlineTextContainer}>
          <Text style={styles.loginText}>
            Forgot your password?
            <TouchableOpacity
              onPress={() => navigation.navigate('ResetPassword')}
            >
              <Text style={styles.linkText}>Reset</Text>
            </TouchableOpacity>
          </Text>
        </View>

        <View style={styles.inlineTextContainer}>
          <Text style={styles.loginText}>
            Don’t have an account?
            <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
              <Text style={styles.linkText}>Sign Up</Text>
            </TouchableOpacity>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    // marginTop: 15,
    textAlign: 'center',
  },
  title2: {
    fontSize: 28,
    color: '#00b4db',
    fontWeight: 'bold',
    marginBottom: 25,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 10,
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
    marginLeft: 8
  },
});
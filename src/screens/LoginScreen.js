import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  StatusBar,
  Alert,
} from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import LinearGradient from 'react-native-linear-gradient';
import { googleLogin } from '../Services/authservice';
import { useDispatch } from 'react-redux';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [secureText, setSecureText] = useState(true);
  const [errors, setErrors] = useState({});
  const dispatch = useDispatch();

  const handleGoogleLogin = async () => {
    // try {
      const user = await googleLogin();
      console.log("user: ", user);
      dispatch(loginAction(user));
      Alert.alert('Login Success', `Welcome ${user.displayName}`);
    // } catch (error) {
    //   Alert.alert('Login Failed', error);
    //   console.error('Google Login Error:', error);
    // }
  };

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
      navigation.replace('Home');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar barStyle="light-content" />

      <Text style={styles.title}>JVJ Reconnect</Text>
      <Text style={styles.title2}>2007 Batch</Text>
      <MaterialIcon name="person-outline" size={60} color="#00b4db" style={{ marginBottom: 10 }} />

      <Text style={styles.title}>Login</Text>

      <TouchableOpacity style={styles.button} onPress={handleGoogleLogin}>
        <LinearGradient colors={['#00b4db', '#0083b0']} style={styles.gradient}>
          <Text style={styles.buttonText}>Google</Text>
        </LinearGradient>
      </TouchableOpacity>
      {/* Email Field */}
      <View style={styles.inputWrapper}>
        <View style={styles.inputContainer}>
          <MaterialIcon name="email" size={22} style={styles.icon} />
          <TextInput
            placeholder="Email Address"
            placeholderTextColor="#999"
            style={styles.input}
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              setErrors({ ...errors, email: '' });
            }}
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
            onChangeText={(text) => {
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
        {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}
      </View>

      {/* Login Button */}
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <LinearGradient colors={['#00b4db', '#0083b0']} style={styles.gradient}>
          <Text style={styles.buttonText}>Login</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* SignUp Link */}
      <TouchableOpacity onPress={() => navigation.navigate('SignUp')}>
        <Text style={styles.loginText}>
          Don't have an account?{' '}
          <Text style={{ color: '#00b4db', fontWeight: 'bold' }}>Sign Up</Text>
        </Text>
      </TouchableOpacity>
    </ScrollView>
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
  },
  title: {
    fontSize: 28,
    color: '#00b4db',
    fontWeight: 'bold',
    // marginBottom: 25,
    textAlign: "center"
  },
  title2: {
    fontSize: 28,
    color: '#00b4db',
    fontWeight: 'bold',
    marginBottom: 25,
    textAlign: "center"
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
    marginTop: 20
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
    color: '#aaa',
    marginTop: 10,
    fontSize: 14,
  },
});
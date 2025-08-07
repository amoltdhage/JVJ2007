// import React, { useState } from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   StyleSheet,
//   ScrollView,
//   StatusBar,
// } from 'react-native';
// import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
// import LinearGradient from 'react-native-linear-gradient';

// const SignUpScreen = ({ navigation }) => {
//   const [form, setForm] = useState({
//     firstName: '',
//     lastName: '',
//     email: '',
//     mobile: '',
//     password: '',
//     confirmPassword: '',
//   });

//   const [secureText, setSecureText] = useState(true);
//   const [secureConfirmText, setSecureConfirmText] = useState(true);

//   const handleChange = (name, value) => {
//     setForm({ ...form, [name]: value });
//   };

//   return (
//     <ScrollView contentContainerStyle={styles.container}>
//       <StatusBar barStyle="light-content" />

//       {/* Top Vector Icon */}
//       <MaterialIcon name="person-add-alt" size={60} color="#00b4db" style={{ marginBottom: 10 }} />

//       <Text style={styles.title}>Create Account</Text>

//       {[
//         { name: 'firstName', placeholder: 'First Name', icon: 'person' },
//         { name: 'lastName', placeholder: 'Last Name', icon: 'person-outline' },
//         { name: 'email', placeholder: 'Email Address', icon: 'email' },
//         { name: 'mobile', placeholder: 'Mobile Number', icon: 'phone' },
//       ].map((field, index) => (
//         <View style={styles.inputContainer} key={index}>
//           <MaterialIcon name={field.icon} size={22} style={styles.icon} />
//           <TextInput
//             placeholder={field.placeholder}
//             style={styles.input}
//             placeholderTextColor="#999"
//             value={form[field.name]}
//             onChangeText={(text) => handleChange(field.name, text)}
//           />
//         </View>
//       ))}

//       {/* Password */}
//       <View style={styles.inputContainer}>
//         <MaterialIcon name="lock" size={22} style={styles.icon} />
//         <TextInput
//           placeholder="Password"
//           secureTextEntry={secureText}
//           style={styles.input}
//           placeholderTextColor="#999"
//           value={form.password}
//           onChangeText={(text) => handleChange('password', text)}
//         />
//         <TouchableOpacity onPress={() => setSecureText(!secureText)}>
//           <MaterialIcon
//             name={secureText ? 'visibility-off' : 'visibility'}
//             size={22}
//             style={styles.icon}
//           />
//         </TouchableOpacity>
//       </View>

//       {/* Confirm Password */}
//       <View style={styles.inputContainer}>
//         <MaterialIcon name="lock-outline" size={22} style={styles.icon} />
//         <TextInput
//           placeholder="Confirm Password"
//           secureTextEntry={secureConfirmText}
//           style={styles.input}
//           placeholderTextColor="#999"
//           value={form.confirmPassword}
//           onChangeText={(text) => handleChange('confirmPassword', text)}
//         />
//         <TouchableOpacity onPress={() => setSecureConfirmText(!secureConfirmText)}>
//           <MaterialIcon
//             name={secureConfirmText ? 'visibility-off' : 'visibility'}
//             size={22}
//             style={styles.icon}
//           />
//         </TouchableOpacity>
//       </View>

//       {/* Submit Button */}
//       <TouchableOpacity style={styles.button}>
//         <LinearGradient
//           colors={['#00b4db', '#0083b0']}
//           style={styles.gradient}
//         >
//           <Text style={styles.buttonText}>Sign Up</Text>
//         </LinearGradient>
//       </TouchableOpacity>

//       {/* Already have account */}
//       <TouchableOpacity onPress={() => navigation.navigate('LoginScreen')}>
//         <Text style={styles.loginText}>
//           Already have an account?{' '}
//           <Text style={{ color: '#00b4db', fontWeight: 'bold' }}>Login</Text>
//         </Text>
//       </TouchableOpacity>
//     </ScrollView>
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
//   inputContainer: {
//     flexDirection: 'row',
//     backgroundColor: '#1e1e1e',
//     borderRadius: 12,
//     padding: 14,
//     alignItems: 'center',
//     marginBottom: 15,
//     width: '100%',
//     borderWidth: 1.3,
//     borderColor: '#00b4db', // 💙 now matches the button & title
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
// });


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

const SignUpScreen = ({ navigation }) => {
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

  const handleChange = (name, value) => {
    setForm({ ...form, [name]: value });
    setErrors({ ...errors, [name]: '' }); // clear error as user types
  };

  const validate = () => {
    let valid = true;
    const newErrors = {};

    if (!form.firstName.trim()) {
      newErrors.firstName = 'First name is required';
      valid = false;
    }
    if (!form.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
      valid = false;
    }
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
      // ✅ Simulate signup success
      Alert.alert('Success', 'Account created successfully!', [
        {
          text: 'Login Now',
          onPress: () => navigation.navigate('LoginScreen'),
        },
      ]);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <StatusBar barStyle="light-content" />
      <MaterialIcon name="person-add-alt" size={60} color="#00b4db" style={{ marginBottom: 10 }} />
      <Text style={styles.title}>Create Account</Text>

      {[
        { name: 'firstName', placeholder: 'First Name', icon: 'person' },
        { name: 'lastName', placeholder: 'Last Name', icon: 'person-outline' },
        { name: 'email', placeholder: 'Email Address', icon: 'email' },
        { name: 'mobile', placeholder: 'Mobile Number', icon: 'phone' },
      ].map((field, index) => (
        <View key={index} style={styles.inputWrapper}>
          <View style={styles.inputContainer}>
            <MaterialIcon name={field.icon} size={22} style={styles.icon} />
            <TextInput
              placeholder={field.placeholder}
              style={styles.input}
              placeholderTextColor="#999"
              value={form[field.name]}
              onChangeText={(text) => handleChange(field.name, text)}
            />
          </View>
          {errors[field.name] && <Text style={styles.errorText}>{errors[field.name]}</Text>}
        </View>
      ))}

      {/* Password */}
      <View style={styles.inputWrapper}>
        <View style={styles.inputContainer}>
          <MaterialIcon name="lock" size={22} style={styles.icon} />
          <TextInput
            placeholder="Password"
            secureTextEntry={secureText}
            style={styles.input}
            placeholderTextColor="#999"
            value={form.password}
            onChangeText={(text) => handleChange('password', text)}
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

      {/* Confirm Password */}
      <View style={styles.inputWrapper}>
        <View style={styles.inputContainer}>
          <MaterialIcon name="lock-outline" size={22} style={styles.icon} />
          <TextInput
            placeholder="Confirm Password"
            secureTextEntry={secureConfirmText}
            style={styles.input}
            placeholderTextColor="#999"
            value={form.confirmPassword}
            onChangeText={(text) => handleChange('confirmPassword', text)}
          />
          <TouchableOpacity onPress={() => setSecureConfirmText(!secureConfirmText)}>
            <MaterialIcon
              name={secureConfirmText ? 'visibility-off' : 'visibility'}
              size={22}
              style={styles.icon}
            />
          </TouchableOpacity>
        </View>
        {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}
      </View>

      {/* Submit Button */}
      <TouchableOpacity style={styles.button} onPress={handleSignUp}>
        <LinearGradient colors={['#00b4db', '#0083b0']} style={styles.gradient}>
          <Text style={styles.buttonText}>Sign Up</Text>
        </LinearGradient>
      </TouchableOpacity>

      {/* Already have account */}
      <TouchableOpacity onPress={() => navigation.navigate('Auth')}>
        <Text style={styles.loginText}>
          Already have an account? <Text style={{ color: '#00b4db', fontWeight: 'bold' }}>Login</Text>
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default SignUpScreen;

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

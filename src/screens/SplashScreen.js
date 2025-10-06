// SplashScreen.js
import React from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const SplashScreen = () => {
  return (
    <View style={styles.container}>
      <Image source={require("../assets/images/Janta-Vidyalaya-Jamod-2007-Reunion.png")} style={{width: 250, height: 250}} />
      {/* <Ionicons name="school-outline" size={100} color="#4B9CD3" /> */}
      <Text style={styles.title}>JVJ Reconnect 2007</Text>
    </View>
  );
};

export default SplashScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    marginTop: 20,
    fontSize: 28,
    fontWeight: 'bold',
    color: '#4B9CD3',
  },
});
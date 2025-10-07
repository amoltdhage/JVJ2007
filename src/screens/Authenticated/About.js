// src/screens/AboutScreen.tsx
import React from 'react';
import { ScrollView, Text, StyleSheet, Image } from 'react-native';

export default function AboutScreen() {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* App Logo */}
      {/* <Image 
        source={require('../assets/images/Janta-Vidyalaya-Jamod-2007-Reunion.png')} 
        style={styles.logo} 
        resizeMode="contain"
      /> */}

      <Text style={styles.title}>About JVJ 2007 Reconnect</Text>

      <Text style={styles.text}>
        This app is <Text style={styles.highlight}>designed and developed</Text> for the <Text style={styles.highlight}>JVJ 2007 10th Batch Get-Together</Text>. 
        The event is on <Text style={styles.highlight}>Saturday, 25th October 2025</Text> from <Text style={styles.highlight}>10:00 AM to 4:30 PM</Text> at 
        <Text style={styles.highlight}> Janta Vidyalaya, Jamod School</Text>.
      </Text>

      <Text style={styles.text}>
        All 10th batchmates are invited to reconnect and celebrate. Our teachers, school staff, and retired teachers are also invited as special guests.
      </Text>

      <Text style={styles.text}>
        This app helps everyone stay informed about the event and the gathering, so we can all come together to relive our school memories.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, backgroundColor: '#FFF0F5', alignItems: 'center' },
  logo: { width: 200, height: 200, marginBottom: 20 },
  title: { 
    fontSize: 24, 
    fontWeight: 'bold', 
    marginBottom: 15, 
    color: '#FF4081', 
    textAlign: 'center' 
  },
  text: { 
    fontSize: 16, 
    color: '#333', 
    marginBottom: 12, 
    lineHeight: 22, 
    textAlign: 'center'
  },
  highlight: {
    fontWeight: 'bold',
    color: '#FF4081',
  },
});

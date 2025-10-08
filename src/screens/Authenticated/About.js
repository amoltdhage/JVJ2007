// src/screens/Authenticated/About.js
import React from 'react';
import { ScrollView, Text, StyleSheet, Image, View, Dimensions } from 'react-native';
import Header from '../../components/Header';

const { width } = Dimensions.get('window');

export default function AboutScreen() {
  return (
    <View style={styles.container}>
      <Header title="About" />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Unified Video-Style Section */}
        <View style={styles.videoSection}>
          {/* Logo */}
          <Image
            source={require('../../assets/images/Janta-Vidyalaya-Jamod-2007-Reunion.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          {/* Title */}
          <Text style={styles.title}>About JVJ 2007 Reconnect</Text>

          {/* Description */}
          <Text style={styles.text}>
            This app is <Text style={styles.highlight}>designed and developed</Text> for the{' '}
            <Text style={styles.highlight}>JVJ 2007 10th Batch Get-Together</Text>. The event is on{' '}
            <Text style={styles.highlight}>Saturday, 25th October 2025</Text> from{' '}
            <Text style={styles.highlight}>10:00 AM to 4:30 PM</Text> at{' '}
            <Text style={styles.highlight}>Janta Vidyalaya, Jamod School</Text>.
          </Text>

          <Text style={styles.text}>
            All 10th batchmates are invited to reconnect and celebrate. Our teachers, school staff,
            and retired teachers are also invited as special guests.
          </Text>

          <Text style={styles.text}>
            This app helps everyone stay informed about the event and the gathering, so we can all
            come together to relive our school memories.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF0F5', // soft page background
  },
  scrollContainer: {
    padding: 20,
    alignItems: 'center',
  },

  // Card styling
  videoSection: {
    width: '95%',
    backgroundColor: '#002b5c', // deep navy blue
    borderRadius: 20,
    padding: 25,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },

  // Logo displayed simply
  logo: {
    width: width * 0.5,
    height: width * 0.5,
    resizeMode: 'contain',
    marginBottom: 20,
  },

  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 20,
  },

  text: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 15,
  },

  highlight: {
    fontWeight: 'bold',
    color: '#d1e0ff', // lighter highlight for dark background
  },
});

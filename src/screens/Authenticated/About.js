import React from 'react';
import {
  ScrollView,
  Text,
  StyleSheet,
  Image,
  View,
  Dimensions,
} from 'react-native';
import Header from '../../components/Header';
import { useTranslation } from 'react-i18next';

const { width } = Dimensions.get('window');

export default function AboutScreen() {
  const {t} = useTranslation();
  return (
    <View style={styles.container}>
      <Header title="About Us" />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.card}>
          {/* Logo */}
          <Image
            source={require('../../assets/images/Janta-Vidyalaya-Jamod-2007-Reunion.png')}
            style={styles.logo}
            resizeMode="contain"
          />

          {/* Title */}
          <Text style={styles.title}>{t("about.appTitle")}</Text>

          {/* Subtitle */}
          <Text style={styles.subtitle}>{t("about.subtitle")}</Text>

          {/* Description */}
          {/* <Text style={styles.paragraph}>
            This app is{' '}
            <Text style={styles.paragraph}>designed and developed</Text> for the{' '}
            <Text style={styles.paragraph}>JVJ 2007 10th Batch Reunion</Text>.
          </Text> */}
          <Text style={styles.paragraph}>{t("about.description.intro")}</Text>

          <Text style={styles.paragraph}>
            <Text style={styles.bold}>{t("about.description.eventDetails")}</Text>{' '}
            {/* 📅 <Text style={styles.bold}>Date:</Text> Saturday, 25th October
            2025{'\n'}
            🕙 <Text style={styles.bold}>Time:</Text> 10:00 AM to 4:30 PM{'\n'}
            🏫 <Text style={styles.bold}>Venue:</Text> Janta Vidyalaya, Jamod */}
          </Text>

          <Text style={styles.paragraph}>
            {t("about.description.invite")}
            {/* All 10th batchmates are warmly invited to reconnect, celebrate,{'\n'} 
            and relive our school memories with our beloved teachers and staff. */}
          </Text>

          <Text style={styles.paragraph}>
            {t("about.description.purpose")}
            {/* This app keeps you informed about the event schedule, attendees, and
            updates so that we all stay connected. */}
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9fc',
  },
  scrollContainer: {
    paddingVertical: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  card: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  logo: {
    width: width * 0.45,
    height: width * 0.45,
    marginBottom: 20,
    alignSelf: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#002b5c',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#555',
    textAlign: 'center',
    marginBottom: 20,
    marginTop: 4,
  },
  paragraph: {
    fontSize: 15,
    color: '#333',
    lineHeight: 24,
    marginBottom: 16,
    textAlign: 'center',
    width: "100%"
  },
  highlight: {
    color: '#1D3557',
    fontWeight: '600',
  },
  bold: {
    fontWeight: '600',
    width: "100%"
  },
});
// src/screens/Authenticated/ContactUs.js
import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Linking,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import Header from '../../components/Header';
import { useTranslation } from 'react-i18next';

const ContactUs = () => {
  const { t } = useTranslation();

  // Handlers
  const handleEmail = email => {
    Linking.openURL(`mailto:${email}`);
  };

  const handleCall = number => {
    Linking.openURL(`tel:${number}`);
  };

  const handleWhatsApp = number => {
    const appURL = `whatsapp://send?phone=${number}`;
    const webURL = `https://wa.me/${number}`;
    Linking.canOpenURL(appURL)
      .then(supported => {
        if (supported) {
          Linking.openURL(appURL);
        } else {
          Linking.openURL(webURL);
        }
      })
      .catch(err => console.log(err));
  };

  const handleWhatsAppGroup = () => {
    const groupURL =
      'https://chat.whatsapp.com/BQBpyzHXWjbCxW6aCNSmxd?mode=wwc';
    Linking.openURL(groupURL);
  };

  return (
    <View style={styles.container}>
      <Header title="Contact Us" />

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Intro Section */}
        <Text style={styles.title}>{t('contactUs.introTitle')}</Text>
        <Text style={styles.description}>{t('contactUs.introDesc')}</Text>

        {/* Official Support */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t('contactUs.officialSupportTitle')}</Text>

          <TouchableOpacity
            style={styles.button}
            onPress={() =>
              handleEmail('janta.vidyalaya.jamod.official@gmail.com')
            }
          >
            <Text style={styles.buttonText}>{t('contactUs.emailButton')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => handleCall('9890332831')}
          >
            <Text style={styles.buttonText}>{t('contactUs.callButton')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.button}
            onPress={() => handleWhatsApp('9890332831')}
          >
            <Text style={styles.buttonText}>{t('contactUs.whatsappButton')}</Text>
          </TouchableOpacity>
        </View>

        {/* WhatsApp Group */}
        <View style={[styles.card, { alignItems: 'ledt' }]}>
          <Text style={styles.sectionTitle}>{t('contactUs.whatsappGroupTitle')}</Text>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#34b764ff' }]}
            onPress={handleWhatsAppGroup}
          >
            <Text style={styles.buttonText}>{t('contactUs.whatsappGroupButton')}</Text>
          </TouchableOpacity>
        </View>

        {/* Developers */}
        <View style={styles.card}>
          <Text style={styles.sectionTitle}>{t('contactUs.developersTitle')}</Text>

          <Text style={styles.infoText}>{t('contactUs.developer1Name')}</Text>
          <Text style={styles.roleText}>{t('contactUs.developer1Role')}</Text>
          <TouchableOpacity
            style={styles.buttonSmall}
            onPress={() => handleCall('9890332831')}
          >
            <Text style={styles.buttonText}>{t('contactUs.developer1Call')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.buttonSmall}
            onPress={() => handleWhatsApp('9890332831')}
          >
            <Text style={styles.buttonText}>{t('contactUs.developer1WhatsApp')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.buttonSmall}
            onPress={() => handleEmail('amoltdhage@gmail.com')}
          >
            <Text style={styles.buttonText}>{t('contactUs.developer1Email')}</Text>
          </TouchableOpacity>

          <View style={{ height: 20 }} />

          <Text style={styles.infoText}>{t('contactUs.developer2Name')}</Text>
          <Text style={styles.roleText}>{t('contactUs.developer2Role')}</Text>
          <TouchableOpacity
            style={styles.buttonSmall}
            onPress={() => handleEmail('nishantjain951@gmail.com')}
          >
            <Text style={styles.buttonText}>{t('contactUs.developer2Email')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

export default ContactUs;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#040b51ff',
    textAlign: 'center',
    marginBottom: 10,
  },
  description: {
    fontSize: 13,
    textAlign: 'center',
    color: '#555',
    marginBottom: 25,
    lineHeight: 22,
  },
  card: {
    backgroundColor: '#f9f9f9',
    padding: 18,
    borderRadius: 15,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 15,
    color: '#333',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 5,
  },
  infoText: {
    fontSize: 16,
    marginBottom: 4,
    color: '#444',
  },
  roleText: {
    fontSize: 13,
    color: '#080a22ff',
    fontWeight: '400',
    fontFamily: Platform.OS === 'ios' ? 'Helvetica Neue' : 'sans-serif-medium',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#040b51ff',
    padding: 12,
    borderRadius: 10,
    marginVertical: 8,
  },
  buttonSmall: {
    backgroundColor: '#040b51ff',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    alignSelf: 'flex-start',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Linking,
} from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import CountdownTimer from '../../components/CountdownTimer'; // adjust path as needed
import Header from '../../components/Header';
const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const images = [
    {
      url: '',
      props: {
        source: require('../../assets/images/Approval.jpeg'),
      },
    },
  ];

  const calculateTimeLeft = () => {
    const targetDate = new Date('2025-10-25T10:00:00');
    const difference = +targetDate - +new Date();
    let timeLeft = {};

    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }

    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
      <Header title="Home" />
      <ScrollView contentContainerStyle={styles.container}>
        {/* Reunion Title Block */}
        <View style={styles.bannerBox}>
          <CountdownTimer />
          <Text style={styles.bigTitle}>JVJ 2007 - 10th Batch</Text>
          <Text style={styles.subtitle}>Get Together</Text>
          <View style={styles.detailBox}>
            <Text style={styles.detail}>📅 25th October 2025, Saturday</Text>
            <Text style={styles.detail}>⏰ 10:00 AM - 4:30 PM</Text>
            <Text style={styles.detail}>📍 Janta Vidyalaya, Jamod</Text>
          </View>
        </View>

        {/* Memory Quote */}
        {/* <View style={styles.memoryBox}>
        <Text style={styles.memoryText}>
          “We didn’t realize we were making memories, we just knew we were having fun.” {"\n"} {"\n"}
          "आपण तेव्हा आठवणी तयार करत होतो, हे तेव्हा कळलंच नाही… {"\n"}
           तेव्हा आपल्याला फक्त एवढंच माहीत होतं-आपण धमाल करत होतो!"
        </Text>
      </View> */}

        <View style={styles.memoryCard}>
          <Text style={styles.memoryQuote}>
            “We didn’t realize we were making memories, we just knew we were
            having fun.” {'\n'} {'\n'}
            "आपण तेव्हा आठवणी तयार करत होतो, हे तेव्हा कळलंच नाही… {'\n'}
            तेव्हा आपल्याला फक्त एवढंच माहीत होतं-आपण धमाल करत होतो!"
          </Text>
        </View>

        {/* Announcement Section */}
        <View style={styles.announcementBox}>
          {/* <Text style={styles.announcementTitle}>📢 Announcement</Text> */}
          {/* <Text style={styles.announcementText}>
            ✨ It’s Not Just a Reunion — It’s a Return to Where It All Began!
          </Text> */}

          {/* Get Together Form Section */}
          <View style={styles.formBox}>
            <TouchableOpacity
              style={styles.formButton}
              onPress={() => navigation.navigate('GetTogetherForm')}
            >
              <Text style={styles.formButtonText}>FILL GET-TOGETHER FORM</Text>
              <Text style={styles.formButtonText}>गेट-टुगेदर फॉर्म भरा</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.formTitle}>👆🏻</Text>
          <Text style={styles.formTitle}>🎉 Let’s Reconnect!</Text>
          <Text style={styles.formInfo}>
            ✍️ चला, पुन्हा भेटीची तयारी करूया!{'\n'}
            कोण येणार आहे, याची यादी करणं आवश्यक आहे.{'\n'}
            म्हणूनच हा फॉर्म भरणं गरजेचं आहे –{'\n'}
            जेणेकरून नियोजन सुरळीत होईल आणि{'\n'}
            सगळ्यांना सोबत येता येईल! 😊
          </Text>
        </View>

        <View style={styles.countdownBox}>
          <Text style={[styles.countdownTitle, { textAlign: 'center' }]}>
            ✨ It’s Not Just a Reunion — It’s a Return to Where It All Began!
          </Text>

          <Text
            style={[
              styles.countdownText,
              {
                color: 'blue',
                textAlign: 'center',
                textDecorationLine: 'underline',
              },
            ]}
            onPress={() =>
              Linking.openURL('https://drive.google.com/drive/folders/1zXbITy24O8ZAmOiPQ-sL7pWNo7wPlQGE?usp=drive_link')
            }
          >
            View Event Gallery
          </Text>
          {/* <Text style={styles.countdownText}>
            {timeLeft.days || 0}d {timeLeft.hours || 0}h {timeLeft.minutes || 0}
            m {timeLeft.seconds || 0}s
          </Text> */}
        </View>

        {/* Friendship Reminder */}
        <View style={styles.friendBox}>
          <Text style={styles.friendText}>
            💬 Tag your school bestie and let’s make this reunion unforgettable!
          </Text>
        </View>

        <View style={styles.iconBox}>
          <MaterialIcon name="school" size={100} color="#003366" />
        </View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#eef4ff',
    padding: 16,
    flexGrow: 1,
  },
  bannerBox: {
    backgroundColor: '#002b5c',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    marginBottom: 1,
  },
  bigTitle: {
    marginTop: 8,
    fontSize: 22,
    fontWeight: 'bold',
    color: '#ffffff',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#cce6ff',
    marginBottom: 10,
    textAlign: 'center',
  },
  detailBox: {
    alignSelf: 'center',
    marginTop: 10,
    paddingLeft: 5,
  },
  detail: {
    color: '#e0ecff',
    fontSize: 14,
    marginVertical: 2,
    textAlign: 'left',
  },
  memoryBox: {
    backgroundColor: '#dceaff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
  },
  memoryText: {
    fontStyle: 'italic',
    color: '#003366',
    textAlign: 'center',
    fontSize: 14,
  },
  announcementBox: {
    backgroundColor: '#c6e2ff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
  },
  announcementTitle: {
    fontWeight: 'bold',
    fontSize: 15,
    color: '#003366',
    marginBottom: 6,
    textAlign: 'center',
  },
  announcementText: {
    textAlign: 'center',
    color: '#003366',
  },
  formBox: {
    marginTop: 10,
    backgroundColor: '#d4980cf7',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  formTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#4E342E',
    // marginBottom: 8,
    marginTop: 8,
    textAlign: 'center',
  },
  formInfo: {
    fontSize: 16,
    color: '#4E342E',
    textAlign: 'center',
    marginHorizontal: 20,
    lineHeight: 24,
    marginTop: 12,
  },

  formButton: {
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  formButtonText: {
    color: '#003366',
    fontWeight: 'bold',
    fontSize: 14,
  },
  countdownBox: {
    backgroundColor: '#ffe082',
    borderRadius: 10,
    padding: 14,
    marginBottom: 20,
    alignItems: 'center',
  },
  countdownTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#4E342E',
    marginBottom: 6,
  },
  countdownText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#bf360c',
  },
  friendBox: {
    backgroundColor: '#e8f3ff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
  },
  friendText: {
    textAlign: 'center',
    fontWeight: '600',
    color: '#004080',
  },
  image: {
    width: width - 32,
    height: 180,
    borderRadius: 12,
    alignSelf: 'center',
    marginTop: 10,
  },
  iconBox: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  memoryCard: {
    backgroundColor: '#FFF8E1', // हलकी हळदीसारखी पिवळी
    padding: 16,
    borderRadius: 12,
    marginVertical: 20,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },

  memoryQuote: {
    fontSize: 16,
    color: '#5D4037',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 24,
    color: '#003366',
  },
});

export default HomeScreen;

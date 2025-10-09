// import React, { useEffect, useState, useRef } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   ScrollView,
//   Dimensions,
//   TouchableOpacity,
//   Linking,
//   Animated,
// } from 'react-native';
// import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
// import CountdownTimer from '../../components/CountdownTimer'; // adjust path as needed
// import Header from '../../components/Header';
// const { width } = Dimensions.get('window');

// const HomeScreen = ({ navigation }) => {
//   const images = [
//     {
//       url: '',
//       props: {
//         source: require('../../assets/images/Approval.jpeg'),
//       },
//     },
//   ];

//   const BlinkingGalleryButton = () => {
//     const blinkAnim = useRef(new Animated.Value(1)).current;

//     useEffect(() => {
//       const blink = Animated.loop(
//         Animated.sequence([
//           Animated.timing(blinkAnim, {
//             toValue: 0.2, // fade out
//             duration: 600,
//             useNativeDriver: true,
//           }),
//           Animated.timing(blinkAnim, {
//             toValue: 1, // fade in
//             duration: 600,
//             useNativeDriver: true,
//           }),
//         ]),
//       );
//       blink.start();
//       return () => blink.stop();
//     }, []);

//     return (
//       <TouchableOpacity
//         style={styles.galleryButton}
//         onPress={() =>
//           Linking.openURL(
//             'https://drive.google.com/drive/folders/1zXbITy24O8ZAmOiPQ-sL7pWNo7wPlQGE?usp=drive_link',
//           )
//         }
//       >
//         <Animated.Text
//           style={[styles.galleryButtonText, { opacity: blinkAnim }]}
//         >
//           🖼️ Watch All Event Photos{'\n'}कार्यक्रमातील सर्व छायाचित्रे पहा
//         </Animated.Text>
//       </TouchableOpacity>
//     );
//   };

//   const EventPassedDateTime = new Date('2025-10-25T10:25:00');
//   const [isEventPast, setIsEventPast] = useState(false);

//   useEffect(() => {
//     const timer = setInterval(() => {
//       const currentTime = new Date();
//       setIsEventPast(currentTime > EventPassedDateTime);
//     }, 1000);

//     return () => clearInterval(timer);
//   }, []);

//   const ThankYouMessage = () => {
//     const fadeAnim = useRef(new Animated.Value(0)).current; // initial opacity 0
//     const scaleAnim = useRef(new Animated.Value(1)).current; // initial scale 1

//     useEffect(() => {
//       // Fade in + subtle scaling loop for sparkle effect
//       Animated.loop(
//         Animated.sequence([
//           Animated.parallel([
//             Animated.timing(fadeAnim, {
//               toValue: 1,
//               duration: 1200,
//               useNativeDriver: true,
//             }),
//             Animated.sequence([
//               Animated.timing(scaleAnim, {
//                 toValue: 0.5,
//                 duration: 600,
//                 useNativeDriver: true,
//               }),
//               Animated.timing(scaleAnim, {
//                 toValue: 1,
//                 duration: 600,
//                 useNativeDriver: true,
//               }),
//             ]),
//           ]),
//           Animated.delay(800), // small pause before next loop
//         ]),
//       ).start();
//     }, [fadeAnim, scaleAnim]);

//     return (
//       <View style={styles.countdownBox}>
//         <Animated.Text
//           style={[
//             styles.countdownTitle,
//             {
//               textAlign: 'center',
//               opacity: fadeAnim,
//               transform: [{ scale: scaleAnim }],
//             },
//           ]}
//         >
//           🎉 This reunion wouldn’t have been possible without you! {'\n'} {'\n'}
//           ही भेटीची संधी तुमच्याशिवाय शक्य नसती!
//         </Animated.Text>
//       </View>
//     );
//   };

//   const SimpleThanksMessage = () => {
//     const fadeAnim = useRef(new Animated.Value(0)).current; // initial opacity 0

//     useEffect(() => {
//       Animated.timing(fadeAnim, {
//         toValue: 1,
//         duration: 250, // slow fade-in
//         useNativeDriver: true,
//       }).start();
//     }, [fadeAnim]);

//     return (
//       <View style={styles.countdownBox}>
//         <Animated.Text
//           style={[
//             styles.countdownTitle,
//             { textAlign: 'center', opacity: fadeAnim, lineHeight: 28 },
//           ]}
//         >
//           ✨ह्या आठवणी सदैव जिवंत राहतील!✨ {'\n\n'}
//           तुमच्या सर्वांच्या उपस्थितीमुळे,{'\n'} आजचा दिवस अतिशय हसत-खेळत{'\n'}आणि {'\n'}
//           खूप छान जुन्या आठवणींच्या गप्पा-गोष्टी करत {'\n'} कधी निघून गेला ते कळलंच नाही,{'\n\n'}
//           ही आपल्या १८ वर्षांनंतरची {'\n'} भेट खरोखर अविस्मरणीय झाली!{'\n\n'}
//           आपल्या सहभागाबद्दल मनापासून धन्यवाद!{'\n'}
//           Thanks a ton for being a part of this special day!
//         </Animated.Text>
//       </View>
//     );
//   };

//   const calculateTimeLeft = () => {
//     const targetDate = new Date('2025-10-25T10:00:00');
//     const difference = +targetDate - +new Date();
//     let timeLeft = {};

//     if (difference > 0) {
//       timeLeft = {
//         days: Math.floor(difference / (1000 * 60 * 60 * 24)),
//         hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
//         minutes: Math.floor((difference / 1000 / 60) % 60),
//         seconds: Math.floor((difference / 1000) % 60),
//       };
//     }

//     return timeLeft;
//   };

//   const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());
//   const [visible, setVisible] = useState(false);

//   useEffect(() => {
//     const timer = setInterval(() => {
//       setTimeLeft(calculateTimeLeft());
//     }, 1000);
//     return () => clearInterval(timer);
//   }, []);

//   return (
//     <>
//       <Header title="Home" />
//       <ScrollView contentContainerStyle={styles.container}>
//         {/* Reunion Title Block */}
//         <View style={styles.bannerBox}>
//           <CountdownTimer />
//           <Text style={styles.bigTitle}>JVJ 2007 - 10th Batch</Text>
//           <Text style={styles.subtitle}>Get Together</Text>
//           <View style={styles.detailBox}>
//             <Text style={styles.detail}>📅 25th October 2025, Saturday</Text>
//             <Text style={styles.detail}>⏰ 10:00 AM - 4:30 PM</Text>
//             <Text style={styles.detail}>📍 Janta Vidyalaya, Jamod</Text>
//             {isEventPast ? <BlinkingGalleryButton /> : null}
//           </View>
//         </View>

//         {!isEventPast ? (
//           <View style={styles.memoryCard}>
//             <Text style={styles.memoryQuote}>
//               “We didn’t realize we were making memories, we just knew we were
//               having fun.”{'\n'}
//               {'\n'}
//               आपण तेव्हा आठवणी तयार करत होतो, हे तेव्हा कळलंच नाही…{'\n'}
//               तेव्हा आपल्याला फक्त एवढंच माहीत होतं — आपण धमाल करत होतो!
//             </Text>
//           </View>
//         ) : null}

//         {/* Announcement Section */}
//         <View style={styles.announcementBox}>
//           {/* <Text style={styles.announcementTitle}>📢 Announcement</Text> */}

//           {isEventPast ? (
//             <SimpleThanksMessage />
//           ) : (
//             <>
//               <Text style={[styles.countdownTitle, { textAlign: 'center' }]}>
//                 ✨ It’s Not Just a Reunion — It’s a Return to Where It All
//                 Began!
//               </Text>
//               <Text style={styles.countdownTitle}>
//                 ✨ ही फक्त पुन्हा भेट नाही {'\n'} ही त्या ठिकाणी परत जाण्याची
//                 संधी आहे जिथून सर्व सुरू झाले!
//               </Text>

//               {/* Get Together Form Section */}
//               <View style={styles.formBox}>
//                 <TouchableOpacity
//                   style={styles.formButton}
//                   onPress={() => navigation.navigate('GetTogetherForm')}
//                 >
//                   <Text style={styles.formButtonText}>
//                     FILL GET-TOGETHER FORM
//                   </Text>
//                   <Text style={styles.formButtonText}>
//                     गेट-टुगेदर फॉर्म भरा
//                   </Text>
//                 </TouchableOpacity>
//               </View>
//               <Text style={styles.formTitle}>👆🏻</Text>
//               <Text style={styles.formTitle}>🎉 Let’s Reconnect!</Text>
//               <Text style={styles.formInfo}>
//                 ✍️ चला, पुन्हा भेटीची तयारी करूया!{'\n'}
//                 कोण येणार आहे, याची यादी करणं आवश्यक आहे.{'\n'}
//                 म्हणूनच हा फॉर्म भरणं गरजेचं आहे –{'\n'}
//                 जेणे करून नियोजन सुरळीत होईल आणि{'\n'}
//                 सगळ्यांना सोबत येता येईल! 😊
//               </Text>
//             </>
//           )}
//         </View>

//         <View style={styles.countdownBox}>
//           <Text style={[styles.countdownTitle, { textAlign: 'center' }]}>
//             🎉 This reunion wouldn’t have been possible without you! {'\n'}{' '}
//             {'\n'}
//             ही भेटीची संधी तुमच्याशिवाय शक्य नसती! {'\n'}
//           </Text>

//           <Text
//             style={[
//               styles.countdownText,
//               {
//                 color: 'blue',
//                 textAlign: 'center',
//                 textDecorationLine: 'underline',
//               },
//             ]}
//             onPress={() =>
//               Linking.openURL(
//                 'https://drive.google.com/drive/folders/1zXbITy24O8ZAmOiPQ-sL7pWNo7wPlQGE?usp=drive_link',
//               )
//             }
//           >
//             View Event Gallery - कार्यक्रमाची गॅलरी पहा
//           </Text>
//           {/* <Text style={styles.countdownText}>
//             {timeLeft.days || 0}d {timeLeft.hours || 0}h {timeLeft.minutes || 0}
//             m {timeLeft.seconds || 0}s
//           </Text> */}
//         </View>

//         {/* Friendship Reminder */}
//         <View style={styles.friendBox}>
//           <Text style={styles.friendText}>
//             💬 Tag your school bestie and let’s make this reunion unforgettable!
//           </Text>
//         </View>

//         <View style={styles.iconBox}>
//           <MaterialIcon name="school" size={100} color="#003366" />
//         </View>
//       </ScrollView>
//     </>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     backgroundColor: '#eef4ff',
//     padding: 16,
//     flexGrow: 1,
//   },
//   bannerBox: {
//     backgroundColor: '#002b5c',
//     borderRadius: 12,
//     padding: 20,
//     alignItems: 'center',
//     marginBottom: 1,
//   },
//   bigTitle: {
//     marginTop: 8,
//     fontSize: 22,
//     fontWeight: 'bold',
//     color: '#ffffff',
//     textAlign: 'center',
//   },
//   subtitle: {
//     fontSize: 14,
//     fontWeight: 'bold',
//     color: '#cce6ff',
//     marginBottom: 10,
//     textAlign: 'center',
//   },
//   detailBox: {
//     alignSelf: 'center',
//     marginTop: 10,
//     paddingLeft: 5,
//   },
//   detail: {
//     color: '#e0ecff',
//     fontSize: 14,
//     marginVertical: 2,
//     textAlign: 'left',
//   },
//   memoryBox: {
//     backgroundColor: '#dceaff',
//     borderRadius: 10,
//     padding: 14,
//     marginBottom: 16,
//   },
//   memoryText: {
//     fontStyle: 'italic',
//     color: '#003366',
//     textAlign: 'center',
//     fontSize: 14,
//   },
//   announcementBox: {
//     backgroundColor: '#c6e2ff',
//     borderRadius: 10,
//     padding: 16,
//     marginBottom: 16,
//   },
//   announcementTitle: {
//     fontWeight: 'bold',
//     fontSize: 15,
//     color: '#003366',
//     marginBottom: 6,
//     textAlign: 'center',
//   },
//   announcementText: {
//     textAlign: 'center',
//     color: '#003366',
//   },
//   formBox: {
//     marginTop: 10,
//     backgroundColor: '#d4980cf7',
//     borderRadius: 12,
//     padding: 16,
//     shadowColor: '#000',
//     shadowOpacity: 0.2,
//     shadowRadius: 4,
//     elevation: 4,
//   },
//   formTitle: {
//     fontSize: 14,
//     fontWeight: 'bold',
//     color: '#4E342E',
//     // marginBottom: 8,
//     marginTop: 8,
//     textAlign: 'center',
//   },
//   formInfo: {
//     fontSize: 16,
//     color: '#4E342E',
//     textAlign: 'center',
//     marginHorizontal: 20,
//     lineHeight: 24,
//     marginTop: 12,
//   },

//   formButton: {
//     paddingVertical: 10,
//     borderRadius: 8,
//     alignItems: 'center',
//   },
//   formButtonText: {
//     color: '#003366',
//     fontWeight: 'bold',
//     fontSize: 14,
//   },
//   countdownBox: {
//     backgroundColor: '#ffe082',
//     borderRadius: 10,
//     padding: 14,
//     marginBottom: 20,
//     alignItems: 'center',
//   },
//   countdownTitle: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#4E342E',
//     marginBottom: 6,
//     textAlign: 'center',
//   },
//   countdownText: {
//     fontSize: 16,
//     fontWeight: 'bold',
//     color: '#bf360c',
//   },
//   friendBox: {
//     backgroundColor: '#e8f3ff',
//     borderRadius: 10,
//     padding: 12,
//     marginBottom: 20,
//   },
//   friendText: {
//     textAlign: 'center',
//     fontWeight: '600',
//     color: '#004080',
//   },
//   image: {
//     width: width - 32,
//     height: 180,
//     borderRadius: 12,
//     alignSelf: 'center',
//     marginTop: 10,
//   },
//   iconBox: {
//     alignItems: 'center',
//     marginTop: 10,
//     marginBottom: 30,
//   },
//   memoryCard: {
//     backgroundColor: '#FFF8E1', // हलकी हळदीसारखी पिवळी
//     padding: 16,
//     borderRadius: 12,
//     marginVertical: 20,
//     marginHorizontal: 16,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//     elevation: 4,
//   },

//   memoryQuote: {
//     fontSize: 16,
//     color: '#5D4037',
//     fontStyle: 'italic',
//     textAlign: 'center',
//     lineHeight: 24,
//     color: '#003366',
//   },
//   galleryButton: {
//     backgroundColor: '#4e8cff', // blue button
//     paddingVertical: 12,
//     paddingHorizontal: 20,
//     borderRadius: 10,
//     alignItems: 'center',
//     marginTop: 10,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.2,
//     shadowRadius: 4,
//     elevation: 4,
//   },

//   galleryButtonText: {
//     color: '#ffffff',
//     fontWeight: 'bold',
//     fontSize: 14,
//     textAlign: 'center',
//     lineHeight: 20,
//   },
// });

// export default HomeScreen;

// src/screens/HomeScreen.js
import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Linking,
  Animated,
} from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import CountdownTimer from '../../components/CountdownTimer';
import Header from '../../components/Header';
import { useTranslation } from 'react-i18next';

const HomeScreen = ({ navigation }) => {
  const { t } = useTranslation();

  // Blinking Gallery Button
  const BlinkingGalleryButton = () => {
    const blinkAnim = useRef(new Animated.Value(1)).current;

    useEffect(() => {
      const blink = Animated.loop(
        Animated.sequence([
          Animated.timing(blinkAnim, {
            toValue: 0.2,
            duration: 600,
            useNativeDriver: true,
          }),
          Animated.timing(blinkAnim, {
            toValue: 1,
            duration: 600,
            useNativeDriver: true,
          }),
        ]),
      );
      blink.start();
      return () => blink.stop();
    }, []);

    return (
      <TouchableOpacity
        style={styles.galleryButton}
        onPress={() =>
          Linking.openURL(
            'https://drive.google.com/drive/folders/1zXbITy24O8ZAmOiPQ-sL7pWNo7wPlQGE?usp=drive_link',
          )
        }
      >
        <Animated.Text
          style={[styles.galleryButtonText, { opacity: blinkAnim }]}
        >
          {t('home.galleryButton')}
          {'\n'}
          {t('home.galleryButtonSub')}
        </Animated.Text>
      </TouchableOpacity>
    );
  };

  const EventPassedDateTime = new Date('2025-10-25T10:25:00');
  const [isEventPast, setIsEventPast] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const currentTime = new Date();
      setIsEventPast(currentTime > EventPassedDateTime);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const SimpleThanksMessage = () => {
    const fadeAnim = useRef(new Animated.Value(0)).current;
    useEffect(() => {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }, []);
    return (
      <View style={styles.countdownBox}>
        <Animated.Text
          style={[
            styles.countdownTitle,
            { opacity: fadeAnim, lineHeight: 28, textAlign: 'center' },
          ]}
        >
          {t('home.thankYouMessage')}
        </Animated.Text>
      </View>
    );
  };

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
        {/* Reunion Banner */}
        <View style={styles.bannerBox}>
          <CountdownTimer />
          <Text style={styles.bigTitle}>{t('home.reunionTitle')}</Text>
          <Text style={styles.subtitle}>{t('home.subtitle')}</Text>
          <View style={styles.detailBox}>
            <Text style={styles.detail}>{t('home.date')}</Text>
            <Text style={styles.detail}>{t('home.time')}</Text>
            <Text style={styles.detail}>{t('home.location')}</Text>
            {isEventPast && <BlinkingGalleryButton />}
          </View>
        </View>

        {/* Memory Card */}
        {!isEventPast && (
          <View style={styles.memoryCard}>
            <Text style={styles.memoryQuote}>
              {t('home.memoryQuote')}
              {'\n'}
              {t('home.memoryQuoteSub')}
            </Text>
          </View>
        )}

        {/* Announcement */}
        <View style={styles.announcementBox}>
          {isEventPast ? (
            <SimpleThanksMessage />
          ) : (
            <>
              <Text style={[styles.countdownTitle, { textAlign: 'center' }]}>
                {t('home.countdownMessage')}
              </Text>

              {/* Get-Together Form */}
              <View style={styles.formBox}>
                <TouchableOpacity
                  style={styles.formButton}
                  onPress={() => navigation.navigate('GetTogetherForm')}
                >
                  <Text style={styles.formButtonText}>
                    {t('home.formButton')}
                  </Text>
                  <Text style={styles.formButtonText}>
                    {t('home.formButtonSub')}
                  </Text>
                </TouchableOpacity>
              </View>

              <Text style={styles.formInfo}>{t('home.formInfo')}</Text>
            </>
          )}
        </View>

        {/* Thank You Message */}
        {/* {isEventPast && ( */}
          <View style={styles.countdownBox}>
            <Text style={[styles.countdownTitle, { textAlign: 'center' }]}>
              {t('home.thankYouMessage2')}
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
                Linking.openURL(
                  'https://drive.google.com/drive/folders/1M6gCliTxhZlHXnGqbAgG-2C_Tjs65rvn?usp=drive_link',
                )
              }
            >
              {t('home.galleryButtonSub')}
            </Text>
          </View>
        {/* )} */}

        {/* Friend Reminder */}
        <View style={styles.friendBox}>
          <Text style={styles.friendText}>{t('home.friendReminder')}</Text>
        </View>

        <View style={styles.iconBox}>
          <MaterialIcon name="school" size={100} color="#003366" />
        </View>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  container: { backgroundColor: '#eef4ff', padding: 16, flexGrow: 1 },
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
    width: '100%',
  },
  subtitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#cce6ff',
    marginBottom: 10,
    textAlign: 'center',
    width: '100%',
  },
  detailBox: {
    alignSelf: 'center',
    marginTop: 10,
    paddingLeft: 5,
    width: '100%',
  },
  detail: {
    color: '#e0ecff',
    fontSize: 14,
    marginVertical: 2,
    width: '100%',
    textAlign: 'center',
  },
  memoryCard: {
    backgroundColor: '#FFF8E1',
    padding: 16,
    borderRadius: 12,
    marginVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  memoryQuote: {
    fontSize: 16,
    color: '#003366',
    fontStyle: 'italic',
    textAlign: 'center',
    lineHeight: 24,
  },
  announcementBox: {
    backgroundColor: '#c6e2ff',
    borderRadius: 10,
    padding: 16,
    marginBottom: 16,
  },
  formBox: {
    marginTop: 10,
    backgroundColor: '#d4980cf7',
    borderRadius: 12,
    padding: 16,
    elevation: 4,
  },
  formButton: { paddingVertical: 10, borderRadius: 8, alignItems: 'center' },
  formButtonText: { color: '#003366', fontWeight: 'bold', fontSize: 14 },
  formInfo: {
    fontSize: 16,
    color: '#4E342E',
    textAlign: 'center',
    marginHorizontal: 20,
    lineHeight: 24,
    marginTop: 12,
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
    textAlign: 'center',
  },
  countdownText: { fontSize: 16, fontWeight: 'bold', color: '#bf360c' },
  friendBox: {
    backgroundColor: '#e8f3ff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
  },
  friendText: { textAlign: 'center', fontWeight: '600', color: '#004080' },
  iconBox: { alignItems: 'center', marginTop: 10, marginBottom: 30 },
  galleryButton: {
    backgroundColor: '#4e8cff',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    elevation: 4,
  },
  galleryButtonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
  },
});

export default HomeScreen;

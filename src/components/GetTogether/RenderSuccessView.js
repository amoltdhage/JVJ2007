import {
  Alert,
  Image,
  Linking,
  Pressable,
  ScrollView,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View
} from 'react-native';
import Header from '../Header';
import { useSelector } from 'react-redux';
import { invitePdf } from '../invitePdf';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import FileViewer from 'react-native-file-viewer';
import Share from 'react-native-share';
import { useNavigation } from '@react-navigation/native';
import { updateCollection } from '../../Services/firestoreServices';

export default function RenderSuccessView({
  userDetail,
  EVENT_INFO,
  styles,
  getUserData,
}) {
  const navigation = useNavigation();
  const auth = useSelector(state => state.auth);

  const resetForm = async () => {
    await updateCollection('users', auth.user, { attending: '' });
    getUserData(auth.user);
    setErrors({});
  };

  if (userDetail?.attending === '' || !userDetail) return null;
  if (userDetail.attending === false) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Header title={EVENT_INFO.subtitle} navigation={navigation} showBack />
        <View style={styles.successInner}>
          <View style={styles.memoryCard}>
            <Text style={styles.bigTitle}>{EVENT_INFO.titleBig}</Text>
            <Text style={styles.subtitle}>{EVENT_INFO.subtitle}</Text>
            <View style={styles.detailBox}>
              <Text style={styles.detail}>{EVENT_INFO.dateLine}</Text>
              <Text style={styles.detail}>{EVENT_INFO.timeLine}</Text>
              <Text style={styles.detail}>{EVENT_INFO.placeLine}</Text>
            </View>
            <View style={{ marginTop: 24, alignItems: 'center' }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: '700',
                  color: '#d7daddff',
                  textAlign: 'center',
                }}
              >
                Thank you for your response! We’ll miss you at the event.
              </Text>
              <TouchableOpacity
                style={[
                  styles.pdfButton,
                  { backgroundColor: '#eee', marginTop: 30 },
                ]}
                onPress={resetForm}
              >
                <Text style={{ color: '#002b5c', fontWeight: '700' }}>
                  Go Back
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </ScrollView>
    );
  }

  const handleDownloadPDF = async type => {
    let pdfPath = null;

    const htmlContent = await invitePdf({
      EVENT_INFO,
      form: userDetail,
      children: userDetail?.children,
      auth,
    });

    // Generate PDF from HTML
    const generatePDF = async () => {
      try {
        const file = await RNHTMLtoPDF.convert({
          html: htmlContent,
          fileName: 'JVJ-reconnect-invite',
          base64: false,
        });
        pdfPath = file.filePath;
        return file.filePath;
      } catch (error) {
        Alert.alert('Error', 'Could not generate PDF');
      }
    };

    // View PDF
    const handleViewPDF = async () => {
      try {
        let path = pdfPath || (await generatePDF());
        await FileViewer.open(path, { showOpenWithDialog: true });
      } catch (error) {
        Alert.alert('Error', 'Could not open PDF');
      }
    };

    // Share PDF
    const handleSharePDF = async () => {
      try {
        let path = pdfPath || (await generatePDF());
        await Share.open({
          title: 'Share PDF',
          url: `file://${path}`,
          type: 'application/pdf',
        });
      } catch (error) {
        if (error?.message !== 'User did not share') {
          Alert.alert('Error', 'Could not share PDF');
        }
      }
    };
    if (type === 'view') await handleViewPDF();
    else await handleSharePDF();
  };

  if (userDetail?.attending === true) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Header title={EVENT_INFO.subtitle} navigation={navigation} showBack />
        <View style={styles.successInner}>
          <View style={styles.memoryCard}>
            <Text style={styles.bigTitle}>{EVENT_INFO.titleBig}</Text>
            <Text style={styles.subtitle}>{EVENT_INFO.subtitle}</Text>

            <View style={styles.detailBox}>
              <Text style={styles.detail}>{EVENT_INFO.dateLine}</Text>
              <Text style={styles.detail}>{EVENT_INFO.timeLine}</Text>
              <Text style={styles.detail}>{EVENT_INFO.placeLine}</Text>
            </View>

            <View style={styles.regBox}>
              <Text style={styles.regIdLabel}>Registration ID</Text>
              <Text style={styles.regId}>
                {auth?.user ? `${auth.user.slice(0, 15)}` : 'N/A'}
              </Text>
            </View>

            <View style={{ marginTop: 12 }}>
              <Text style={styles.infoText}>
                <Text style={{ fontWeight: '700' }}>Name:</Text>{' '}
                {userDetail?.fullName ||
                  userDetail?.firstName + ' ' + userDetail?.lastName}
              </Text>
              <Text style={styles.infoText}>
                <Text style={{ fontWeight: '700' }}>DOB:</Text>{' '}
                {new Date(userDetail?.dob).toLocaleDateString('en-GB')}
              </Text>
              <Text style={styles.infoText}>
                <Text style={{ fontWeight: '700' }}>Mobile:</Text>{' '}
                {userDetail?.mobile}
              </Text>
              <Text style={styles.infoText}>
                <Text style={{ fontWeight: '700' }}>Village/City:</Text>{' '}
                {userDetail?.village}
              </Text>
              <Text style={styles.infoText}>
                <Text style={{ fontWeight: '700' }}>Attending:</Text>{' '}
                {userDetail?.attending === true ? 'Yes' : 'No'}
              </Text>
              <Text style={styles.infoText}>
                <Text style={{ fontWeight: '700' }}>Children:</Text>{' '}
                {userDetail?.children?.length}
              </Text>
              <Text style={styles.infoText}>
                <Text style={{ fontWeight: '700' }}>Total persons:</Text>{' '}
                {1 + userDetail?.childrenCount}
              </Text>
            </View>

            {userDetail?.children?.length > 0 && (
              <View style={{ marginTop: 10 }}>
                <Text style={{ fontWeight: '700', color: '#fff' }}>
                  Children Details:
                </Text>
                {userDetail?.children.map((c, i) => (
                  <Text key={i} style={styles.infoText}>
                    • {c.name} — age {c.age}
                  </Text>
                ))}
              </View>
            )}

            <View style={{ marginTop: 12 }}>
              <Text
                style={{
                  fontStyle: 'italic',
                  color: '#fff',
                  textAlign: 'center',
                }}
              >
                Let's reconnect, relive memories, and celebrate our school bond!
              </Text>
            </View>
            {[1, true].includes(userDetail?.isPaid) ? (
              <View style={{ marginTop: 16, width: '100%' }}>
                <TouchableOpacity
                  style={styles.pdfButton}
                  onPress={() => handleDownloadPDF('view')}
                >
                  <Text style={styles.pdfButtonText}>View PDF</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.pdfButton, { marginTop: 10 }]}
                  onPress={() => handleDownloadPDF('share')}
                >
                  <Text style={styles.pdfButtonText}>Share PDF</Text>
                </TouchableOpacity>
                {userDetail?.isAllowAnother === true ? (
                  <TouchableOpacity
                    style={[
                      styles.pdfButton,
                      { backgroundColor: '#eee', marginTop: 10 },
                    ]}
                    onPress={resetForm}
                  >
                    <Text style={{ color: '#002b5c', fontWeight: '700' }}>
                      Register Another
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            ) : (
              <View
                style={{ marginTop: 16, width: '100%', alignItems: 'center' }}
              >
                <Pressable>
                  <Image
                    source={require('../../assets/images/QR-code.jpg')}
                    style={{ width: 250, height: 250, marginBottom: 15 }}
                    resizeMode="contain"
                  />
                </Pressable>
                <Text
                  style={{
                    textAlign: 'center',
                    fontSize: 14,
                    color: '#f4f4f4',
                    marginBottom: 15,
                    paddingHorizontal: 20,
                    lineHeight: 20,
                  }}
                >
                  Pay here using this QR code. You will get the invitation PDF
                  within 24 hours. If you do not receive it by then, please
                  WhatsApp us on{' '}
                  <TouchableWithoutFeedback
                    onPress={() => Linking.openURL('tel:9890332831')}
                  >
                    <Text
                      style={{
                        fontWeight: 'bold',
                        color: '#fff',
                        textDecorationLine: 'underline',
                      }}
                    >
                      9890332831
                    </Text>
                  </TouchableWithoutFeedback>
                  .
                </Text>
                <TouchableOpacity
                  style={styles.pdfButton}
                  onPress={() => resetForm()}
                >
                  <Text style={styles.pdfButtonText}>Edit your details</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    );
  }
}
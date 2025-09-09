import { Alert, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Header from '../../components/Header';
import { useSelector } from 'react-redux';
import { invitePdf } from '../invitePdf';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import FileViewer from 'react-native-file-viewer';
import Share from 'react-native-share';
import { useNavigation } from '@react-navigation/native';
import { updateCollection } from '../../Services/firestoreServices';
import { EVENT_INFO } from '../../utils/utils';
import NotAttendingComponent from './NotAttendingComponent';

export default function RenderSuccessView({
  userDetail,
  styles,
  getUserData,
  setOpenAllowForm,
}) {
  const navigation = useNavigation();
  const auth = useSelector(state => state.auth);

  const resetForm = async () => {
    await updateCollection('users', auth.user, { attending: '' });
    getUserData(auth.user);
    setErrors({});
  };

  if (userDetail?.attending === '' || !userDetail) return null;
  if (userDetail.attending === false)
    return <NotAttendingComponent resetForm={resetForm} styles={styles} />;

  const handleDownloadPDF = async (type, user) => {
    let pdfPath = null;
    const childrenData = user ? userDetail?.users?.children : userDetail;

    const htmlContent = await invitePdf({
      EVENT_INFO,
      form: user ? { ...user, id: userDetail?.id } : userDetail,
      children: childrenData,
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
      <>
        <ScrollView contentContainerStyle={styles.container}>
          <Header
            title={EVENT_INFO.subtitle}
            navigation={navigation}
            showBack
          />
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
                {userDetail?.children?.length ? (
                  <Text style={styles.infoText}>
                    <Text style={{ fontWeight: '700' }}>Children:</Text>{' '}
                    {userDetail?.children?.length}
                  </Text>
                ) : null}
                <Text style={styles.infoText}>
                  <Text style={{ fontWeight: '700' }}>Total persons:</Text>{' '}
                  {1 + Number(userDetail?.childrenCount)}
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
                  Let's reconnect, relive memories, and celebrate our school
                  bond!
                </Text>
              </View>
              <View style={{ marginTop: 16, width: '100%' }}>
                <TouchableOpacity
                  style={styles.pdfButton}
                  onPress={() => handleDownloadPDF('view')}
                >
                  <Text style={styles.pdfButtonText}>View PDF</Text>
                </TouchableOpacity>
                {userDetail?.isAllowAnother === true && !userDetail?.users ? (
                  <TouchableOpacity
                    style={[
                      styles.pdfButton,
                      { backgroundColor: '#eee', marginTop: 10 },
                    ]}
                    onPress={() => setOpenAllowForm(true)}
                  >
                    <Text style={{ color: '#002b5c', fontWeight: '700' }}>
                      Register Another
                    </Text>
                  </TouchableOpacity>
                ) : null}
              </View>
            </View>
          </View>

          {userDetail?.users ? (
            <View style={[styles.successInner, { marginBottom: 20 }]}>
              <View style={styles.memoryCard}>
                <Text style={styles.bigTitle}>{EVENT_INFO.titleBig}</Text>
                <Text style={styles.subtitle}>{EVENT_INFO.subtitle}</Text>

                <View style={styles.detailBox}>
                  <Text style={styles.detail}>{EVENT_INFO.dateLine}</Text>
                  <Text style={styles.detail}>{EVENT_INFO.timeLine}</Text>
                  <Text style={styles.detail}>{EVENT_INFO.placeLine}</Text>
                </View>

                <View style={{ marginTop: 12 }}>
                  <Text style={styles.infoText}>
                    <Text style={{ fontWeight: '700' }}>Name:</Text>{' '}
                    {userDetail?.users?.fullName ||
                      userDetail?.users?.firstName +
                        ' ' +
                        userDetail?.users?.lastName}
                  </Text>
                  <Text style={styles.infoText}>
                    <Text style={{ fontWeight: '700' }}>DOB:</Text>{' '}
                    {new Date(userDetail?.users?.dob).toLocaleDateString(
                      'en-GB',
                    )}
                  </Text>
                  <Text style={styles.infoText}>
                    <Text style={{ fontWeight: '700' }}>Mobile:</Text>{' '}
                    {userDetail?.users?.mobile || userDetail?.mobile}
                  </Text>
                  <Text style={styles.infoText}>
                    <Text style={{ fontWeight: '700' }}>Village/City:</Text>{' '}
                    {userDetail?.users?.village}
                  </Text>
                  {userDetail?.users?.children?.length ? (
                    <Text style={styles.infoText}>
                      <Text style={{ fontWeight: '700' }}>Children:</Text>{' '}
                      {userDetail?.users?.children?.length}
                    </Text>
                  ) : null}
                  <Text style={styles.infoText}>
                    <Text style={{ fontWeight: '700' }}>Total persons:</Text>{' '}
                    {1 + Number(userDetail?.users?.childrenCount)}
                  </Text>
                </View>

                {userDetail?.children?.length > 0 && (
                  <View style={{ marginTop: 10 }}>
                    <Text style={{ fontWeight: '700', color: '#fff' }}>
                      Children Details:
                    </Text>
                    {userDetail?.users?.children.map((c, i) => (
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
                    Let's reconnect, relive memories, and celebrate our school
                    bond!
                  </Text>
                </View>
                <View style={{ marginTop: 16, width: '100%' }}>
                  <TouchableOpacity
                    style={styles.pdfButton}
                    onPress={() => handleDownloadPDF('view', userDetail?.users)}
                  >
                    <Text style={styles.pdfButtonText}>View PDF</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ) : null}
        </ScrollView>
      </>
    );
  }
}
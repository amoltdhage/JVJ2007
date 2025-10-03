import React, { useState } from 'react';
import {
  View,
  Image,
  TouchableOpacity,
  Dimensions,
  StyleSheet,
  Text,
  SafeAreaView,
} from 'react-native';
import Header from '../../components/Header';
import ZoomImageModal from '../../components/ZoomImageModal';

const { width } = Dimensions.get('window');

export default function ApprovalCertificate({ navigation }) {
  const [visible, setVisible] = useState(false);

  const images = [
    {
      url: '',
      props: {
        source: require('../../assets/images/Approval.jpeg'),
      },
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <Header
        title="Approval Certification"
        onBack={() => navigation.goBack()}
      />

      <View style={styles.content}>
        {/* Top preview of the image */}
        <View style={styles.previewContainer}>
          <Image
            source={require('../../assets/images/Approval.jpeg')}
            style={styles.previewImage}
            resizeMode="cover" // only top part
          />

          {/* Overlay button */}
          <TouchableOpacity
            style={styles.button}
            onPress={() => setVisible(true)}
          >
            <Text style={styles.buttonText}>Click here to view</Text>
          </TouchableOpacity>
        </View>

        {/* Some description or style */}
        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            Permission to organize this event has been officially granted . This certificate is shared for your reference
          </Text>
        </View>
      </View>

      {/* Zoomable full-screen viewer */}
      {visible ? (
        <ZoomImageModal
          visible={visible}
          setVisible={setVisible}
          images={images}
        />
      ) : null}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2', // subtle background instead of plain white
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  previewContainer: {
    width: width - 32,
    height: 250, // preview height
    alignSelf: 'center',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
    marginBottom: 20,
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  button: {
    position: 'absolute',
    bottom: 10,
    alignSelf: 'center',
    backgroundColor: '#000000AA',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  infoContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  infoText: {
    fontSize: 16,
    color: '#333',
    lineHeight: 22,
    textAlign: 'center',
  },
});

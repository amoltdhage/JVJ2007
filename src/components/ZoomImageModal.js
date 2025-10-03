import { Modal, TouchableOpacity, View } from 'react-native';
import ImageViewer from 'react-native-image-zoom-viewer';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function ZoomImageModal({ visible, images, setVisible }) {
  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View style={{ flex: 1, backgroundColor: 'black' }}>
        {/* Close Icon */}
        <TouchableOpacity
          onPress={() => setVisible(false)}
          style={{
            position: 'absolute',
            top: 50, // adjust for status bar
            right: 20,
            zIndex: 10,
            backgroundColor: '#000000AA',
            padding: 10,
            borderRadius: 25,
          }}
        >
          <Ionicons name="close" size={35} color="#fff" />
        </TouchableOpacity>

        <ImageViewer
          imageUrls={images}
          enableSwipeDown={true}
          onSwipeDown={() => setVisible(false)}
          saveToLocalByLongPress={false}
          renderIndicator={() => null}
        />
      </View>
    </Modal>
  );
}

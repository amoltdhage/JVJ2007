import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Alert,
  Modal,
} from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { useSelector } from 'react-redux';
import Header from '../../components/Header';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import commaNumber from 'comma-number';
import Entypo from 'react-native-vector-icons/Entypo';
import { generatePaymentsHTML } from '../../components/GeneratePaymentsHtml';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import FileViewer from 'react-native-file-viewer';

const PaymentDetailsScreen = () => {
  const userId = useSelector(state => state.auth?.user);
  const [userDetail, setUserDetail] = useState(null);
  const [payments, setPayments] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [payee, setPayee] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState('Pending');
  const [received, setReceived] = useState('Not Received');

  useEffect(() => {
    if (userId && !userDetail) getUserDetail(userId);
  }, [userId]);

  const getUserDetail = async id => {
    try {
      const doc = await firestore().collection('users').doc(id).get();
      if (doc.exists) setUserDetail(doc.data());
    } catch (err) {
      console.error('Error fetching user detail:', err);
    }
  };

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('paymentsDetails')
      .orderBy('createdAt', 'asc') // Keep original order
      .onSnapshot(snapshot => {
        const list = snapshot.docs.map((doc, index) => ({
          id: doc.id,
          ...doc.data(),
          rowIndex: index,
        }));
        setPayments(list);
      });
    return () => unsubscribe();
  }, []);

  const openModal = payment => {
    if (payment) {
      setEditingPayment(payment);
      setPayee(payment.payee);
      setAmount(payment.amount.toString());
      setStatus(payment.status);
      setReceived(payment.received || 'Not Received');
    } else {
      setEditingPayment(null);
      setPayee('');
      setAmount('');
      setStatus('Pending');
      setReceived('Not Received');
    }
    setModalVisible(true);
  };

  const handleSavePayment = async () => {
    if (!payee || !amount) {
      Alert.alert('Error', 'Please enter payee and amount');
      return;
    }

    if (!(userDetail?.is_admin || userDetail?.is_cashier)) {
      Alert.alert('Permission Denied', 'Only admin/cashier can save payments');
      return;
    }

    try {
      const id =
        editingPayment?.id ||
        firestore().collection('paymentsDetails').doc().id;

      await firestore()
        .collection('paymentsDetails')
        .doc(id)
        .set({
          id,
          payee,
          amount: parseFloat(amount),
          status,
          received,
          createdAt:
            editingPayment?.createdAt || firestore.FieldValue.serverTimestamp(),
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });

      setModalVisible(false);
      setEditingPayment(null);
      setPayee('');
      setAmount('');
      setStatus('Pending');
      setReceived('Not Received');
    } catch (err) {
      console.error('Error saving payment:', err);
      Alert.alert('Error', 'Failed to save payment');
    }
  };

  const handleDeletePayment = async id => {
    Alert.alert('Delete Payment', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await firestore().collection('paymentsDetails').doc(id).delete();
          } catch (err) {
            console.error('Delete error:', err);
            Alert.alert('Error', 'Failed to delete payment');
          }
        },
      },
    ]);
  };

  // Calculate total amount
  const totalAmount = payments.reduce(
    (sum, item) => sum + (item.amount || 0),
    0,
  );

  const handleDownloadPDF = async () => {
    let pdfPath = null;

    const htmlContent = await generatePaymentsHTML(payments, totalAmount);

    // Generate PDF from HTML
    const generatePDF = async () => {
      try {
        const file = await RNHTMLtoPDF.convert({
          html: htmlContent,
          fileName: 'payment-collection',
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
    await handleViewPDF();
  };

  const renderItem = ({ item }) => (
    <View
      style={[
        styles.cardContainer,
        {
          backgroundColor: item.rowIndex % 2 === 0 ? '#ffffff' : '#f9f9f9',
        },
      ]}
    >
      <Text style={styles.fieldText}>
        <Text style={styles.fieldLabel}>Payee: </Text>
        {item.payee}
      </Text>

      <Text style={styles.fieldText}>
        <Text style={styles.fieldLabel}>Amount: </Text>{' '}
        <Text
          style={{
            color: item.status === 'Paid' ? '#1E90FF' : '#E53935',
            fontWeight: '600',
          }}
        >
          ₹{commaNumber(item.amount)}
        </Text>
      </Text>

      <Text style={styles.fieldText}>
        <Text style={styles.fieldLabel}>Status: </Text>
        <Text
          style={{
            color: item.status === 'Paid' ? '#4CAF50' : '#E53935',
            fontWeight: '600',
          }}
        >
          {item.status}
        </Text>
      </Text>

      <Text style={styles.fieldText}>
        <Text style={styles.fieldLabel}>Receipt Status: </Text>
        <Text
          style={{
            color: item.received === 'Received' ? '#750581ff' : '#B0B0B0',
            fontWeight: '600',
          }}
        >
          {item.received || 'Not Received'}
        </Text>
      </Text>

      {(userDetail?.is_admin || userDetail?.is_cashier) && (
        <View style={styles.actionsRow}>
          <TouchableOpacity
            onPress={() => openModal(item)}
            style={styles.iconButton}
          >
            <FontAwesome name="edit" size={22} color="#1E90FF" />
            {/* <Text style={styles.iconLabel}>Edit</Text> */}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleDeletePayment(item.id)}
            style={styles.iconButton}
          >
            <FontAwesome name="trash" size={22} color="#E53935" />
            {/* <Text style={styles.iconLabel}>Delete</Text> */}
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Header title="Payments Details" />
      {userDetail?.is_admin || userDetail?.is_cashier ? (
        <>
          <View style={styles.totalContainer}>
            <View style={styles.totalBox}>
              <Text style={styles.totalLabel}>
                Total Amount :{' '}
                <Text style={styles.totalValue}>
                  ₹{commaNumber(totalAmount)}
                </Text>
              </Text>
              <TouchableOpacity
                style={{ borderRadius: 6, backgroundColor: '#f5f5f5' }}
                onPress={handleDownloadPDF}
              >
                <Entypo color="#35076dff" size={24} name="export" />
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => openModal()}
          >
            <Text style={styles.addButtonText}>+ Add Payee</Text>
          </TouchableOpacity>
        </>
      ) : null}

      <View style={{ flex: 1 }}>
        <FlatList
          data={payments}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 80 }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No payments yet</Text>
          }
        />
      </View>

      {/* Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              {editingPayment ? 'Edit Payment' : 'Add Payee'}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Payee Name"
              value={payee}
              onChangeText={setPayee}
              placeholderTextColor={'gray'}
            />
            <TextInput
              style={styles.input}
              placeholder="Amount"
              keyboardType="numeric"
              value={amount}
              onChangeText={setAmount}
              placeholderTextColor={'gray'}
            />

            {(userDetail?.is_admin || userDetail?.is_cashier) && (
              <View style={styles.statusRow}>
                <TouchableOpacity
                  style={[
                    styles.statusButton,
                    status === 'Paid' && { backgroundColor: '#4CAF50' },
                  ]}
                  onPress={() => setStatus('Paid')}
                >
                  <Text style={styles.statusText}>Paid</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.statusButton,
                    status === 'Pending' && { backgroundColor: '#F44336' },
                  ]}
                  onPress={() => setStatus('Pending')}
                >
                  <Text style={styles.statusText}>Pending</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.statusButton,
                    received === 'Received' && { backgroundColor: '#1E90FF' },
                  ]}
                  onPress={() => setReceived('Received')}
                >
                  <Text style={styles.statusText}>Received</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.statusButton,
                    received === 'Not Received' && {
                      backgroundColor: '#B0B0B0',
                    },
                  ]}
                  onPress={() => setReceived('Not Received')}
                >
                  <Text style={styles.statusText}>Not Received</Text>
                </TouchableOpacity>
              </View>
            )}

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-end',
                marginTop: 10,
              }}
            >
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              {(userDetail?.is_admin || userDetail?.is_cashier) && (
                <TouchableOpacity
                  style={styles.saveButton}
                  onPress={handleSavePayment}
                >
                  <Text style={styles.saveText}>Save</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default PaymentDetailsScreen;

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#daecf9ff' },
  addButton: {
    backgroundColor: '#040b51ff',
    margin: 15,
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  addButtonText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  tableContainer: { marginHorizontal: 10 },
  tableRow: { flexDirection: 'row', alignItems: 'center' },
  column: { flex: 1, alignItems: 'center', paddingHorizontal: 4 },
  columnTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#000',
    marginBottom: 4,
    textAlign: 'center',
  },
  columnValue: {
    fontSize: 12,
    color: '#222',
    flexWrap: 'wrap',
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#999',
    fontSize: 12,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 20,
  },
  modalContainer: { backgroundColor: '#fff', borderRadius: 10, padding: 15 },
  modalTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginBottom: 10,
    fontSize: 14,
  },
  statusRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  statusButton: {
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: '#ccc',
    margin: 2,
  },
  statusText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  cancelButton: {
    marginRight: 10,
    backgroundColor: '#1E90FF',
    borderRadius: 6,
    paddingHorizontal: 15,
    paddingVertical: 6,
  },
  cancelText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  saveButton: {
    backgroundColor: '#1E90FF',
    borderRadius: 6,
    paddingHorizontal: 15,
    paddingVertical: 6,
  },
  saveText: { color: '#fff', fontWeight: '600', fontSize: 14 },
  cardContainer: {
    marginHorizontal: 20,
    marginTop: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.12,
    shadowRadius: 1.5,
    elevation: 2,
  },
  fieldLabel: {
    fontWeight: '600',
    color: '#333',
    fontSize: 14,
  },
  fieldText: {
    fontSize: 13,
    color: '#444',
    marginBottom: 3, // reduced vertical space
  },
  actionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 4, // tighter layout
    gap: 10,
  },
  iconButton: {
    padding: 5,
    borderRadius: 6,
    backgroundColor: '#f5f5f5',
  },

  totalContainer: {
    marginHorizontal: 20,
    marginTop: 10,
    marginBottom: 15,
  },
  totalBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#f5f7fa',
    borderWidth: 1,
    borderColor: '#dcdcdc',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#750581ff',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1E90FF',
  },
});

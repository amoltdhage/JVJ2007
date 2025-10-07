import { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
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
import { PaymentExpenseStyle } from '../../styles/PaymentExpenseStyle';

export default function ExpenseScreen() {
  const userId = useSelector(state => state.auth?.user);
  const [userDetail, setUserDetail] = useState(null);
  const [payments, setPayments] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [expense, setExpense] = useState('');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState('Pending');

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
    // const unsubscribe = firestore()
    //   .collection('ExpenseDetails')
    //   .orderBy('createdAt', 'asc') // Keep original order
    //   .onSnapshot(snapshot => {
    //     const list = snapshot.docs.map((doc, index) => ({
    //       id: doc.id,
    //       ...doc.data(),
    //       rowIndex: index,
    //     }));
    //     setPayments(list);
    //   });
    // return () => unsubscribe();

    const unsubscribe = firestore()
      .collection('ExpenseDetails')
      .orderBy('createdAt', 'asc')
      .onSnapshot(
        snapshot => {
          if (!snapshot || snapshot.empty) {
            setPayments([]);
            return;
          }

          const list = snapshot.docs.map((doc, index) => ({
            id: doc.id,
            ...doc.data(),
            rowIndex: index,
          }));
          setPayments(list);
        },
        error => {
          console.error('Firestore listener error:', error);
          setPayments([]); // fallback
        },
      );

    return () => unsubscribe();
  }, []);

  const openModal = payment => {
    if (payment) {
      setEditingPayment(payment);
      setExpense(payment.expense);
      setAmount(payment.amount.toString());
      setStatus(payment.status);
    } else {
      setEditingPayment(null);
      setExpense('');
      setAmount('');
      setStatus('Pending');
    }
    setModalVisible(true);
  };

  const handleSavePayment = async () => {
    if (!expense || !amount) {
      Alert.alert('Error', 'Please enter expense and amount');
      return;
    }

    if (!(userDetail?.is_admin || userDetail?.isCashier)) {
      Alert.alert('Permission Denied', 'Only admin/cashier can save payments');
      return;
    }

    try {
      const id =
        editingPayment?.id || firestore().collection('ExpenseDetails').doc().id;

      await firestore()
        .collection('ExpenseDetails')
        .doc(id)
        .set({
          id,
          expense,
          amount: parseFloat(amount),
          status,
          createdAt:
            editingPayment?.createdAt || firestore.FieldValue.serverTimestamp(),
          updatedAt: firestore.FieldValue.serverTimestamp(),
        });

      setModalVisible(false);
      setEditingPayment(null);
      setExpense('');
      setAmount('');
      setStatus('Pending');
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
            await firestore().collection('ExpenseDetails').doc(id).delete();
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

    const htmlContent = await generatePaymentsHTML(
      payments,
      totalAmount,
      'expense',
    );

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
        <Text style={styles.fieldLabel}>Expense: </Text>
        {item.expense}
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

      {(
        // userDetail?.is_admin || 
        userDetail?.isCashier) && (
        <View style={styles.actionsRow}>
          <TouchableOpacity
            onPress={() => openModal(item)}
            style={styles.iconButton}
          >
            <FontAwesome name="edit" size={22} color="#1E90FF" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleDeletePayment(item.id)}
            style={styles.iconButton}
          >
            <FontAwesome name="trash" size={22} color="#E53935" />
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <View style={styles.container}>
      <Header title="Payments Details" />
      <View style={styles.totalContainer}>
        <View style={styles.totalBox}>
          <Text style={styles.totalLabel}>
            Total Amount :{' '}
            <Text style={styles.totalValue}>₹{commaNumber(totalAmount)}</Text>
          </Text>
          {payments?.length ? (
            userDetail?.isCashier ? (
              <TouchableOpacity
                style={{ borderRadius: 6, backgroundColor: '#f5f5f5' }}
                onPress={handleDownloadPDF}
              >
                <Entypo color="#35076dff" size={24} name="export" />
              </TouchableOpacity>
            ) : null
          ) : null}
        </View>
      </View>
      {userDetail?.isCashier ? (
        <TouchableOpacity style={styles.addButton} onPress={() => openModal()}>
          <Text style={styles.addButtonText}>+ Add Expense</Text>
        </TouchableOpacity>
      ) : null}

      <View style={{ flex: 1 }}>
        <FlatList
          data={payments}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 80 }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No expenses yet</Text>
          }
        />
      </View>

      {/* Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              {editingPayment ? 'Edit Payment' : 'Add Expense'}
            </Text>

            <TextInput
              style={styles.input}
              placeholder="Expense Name"
              value={expense}
              onChangeText={setExpense}
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

            {(userDetail?.is_admin || userDetail?.isCashier) && (
              <View
                style={[styles.statusRow, { justifyContent: 'flex-start' }]}
              >
                <TouchableOpacity
                  style={[
                    styles.statusButton,
                    status === 'Paid' && { backgroundColor: '#4CAF50' },
                    { merginHorizontal: 5 },
                  ]}
                  onPress={() => setStatus('Paid')}
                >
                  <Text style={styles.statusText}>Paid</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.statusButton,
                    status === 'Pending' && { backgroundColor: '#F44336' },
                    { merginHorizontal: 5 },
                  ]}
                  onPress={() => setStatus('Pending')}
                >
                  <Text style={styles.statusText}>Pending</Text>
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
              {(userDetail?.is_admin || userDetail?.isCashier) && (
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
}

const styles = PaymentExpenseStyle;
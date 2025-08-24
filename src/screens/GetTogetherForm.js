import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import Header from '../components/Header';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { useSelector } from 'react-redux';
import AuthenticationService from '../Services/authservice';
import {
  fetchCollection,
  updateCollection,
} from '../Services/firestoreServices';
import InputField from '../components/InputField';
import RadioSelectionInputs from '../components/RadioSelectionInputs';
import RenderSuccessView from '../components/GetTogether/RenderSuccessView';
import ChildrenInput from '../components/GetTogether/ChildrenInput';
import DatePickerComponent from '../components/GetTogether/DatePickerComponent';
import { GetTogetherFormStyles } from '../styles/GetTogetherFormStyles';
import { useLoading } from '../../LoadingContext';
import Ionicons from 'react-native-vector-icons/Ionicons';

const GetTogetherForm = ({ navigation }) => {
  const { isLoading, startLoading, stopLoading } = useLoading();
  const auth = useSelector(state => state.auth);
  const { logout } = AuthenticationService();
  const [userDetail, setUserDetail] = useState(null);
  const [openAllowForm, setOpenAllowForm] = useState(false);

  const [form, setForm] = useState({
    fullName: '',
    dob: null,
    mobile: '',
    village: '',
    attending: true,
    childrenCount: '0',
    comments: '',
    updatedAt: null,
    users: null,
    gender: '',
    isTeacher: false,
  });

  // children details array of objects { name:'', age:'' }
  const [children, setChildren] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (auth?.user) getUserData(auth.user);
    else logout('Session expired');
  }, []);

  const getUserData = async id => {
    try {
      startLoading();
      const userData = await fetchCollection('users', id);
      if (openAllowForm !== true) {
        const formData = {
          fullName: userData?.fullNamef
            ? userData.fullName
            : `${userData.firstName} ${userData.lastName}`,
          dob: userData?.dob ? new Date(userData.dob) : null,
          mobile: userData?.mobile || '',
          village: userData?.village || '',
          attending:
            userData?.attending === true
              ? true
              : userData?.attending === false
              ? false
              : true,
          childrenCount: userData?.childrenCount
            ? String(userData.childrenCount)
            : '0',
          comments: userData?.comments || '',
          updatedAt: new Date().toISOString() || null,
          users: userData?.users || null,
          gender: userData?.gender || '',
          isTeacher: userData?.isTeacher || false,
        };
        setForm(formData);
        const childrenData = userData?.children?.length
          ? userData?.children
          : [];
        setChildren(childrenData);
      }
      setUserDetail(userData);
    } catch (error) {
      logout('Not able to get your data. Please login again.');
      console.error('Error fetching user data:', error);
    } finally {
      stopLoading();
    }
  };

  // if (isLoading) {
  //   return (
  //     <View style={styles.container}>
  //       <Ionicons name="school-outline" size={100} color="#4B9CD3" />
  //       <Text style={styles.title}>School Gate</Text>
  //     </View>
  //   );
  // }

  useEffect(() => {
    // if childrenCount changes, prepare children array length
    const count = parseInt(form.childrenCount || 0, 10);
    const arr = [];
    for (let i = 0; i < count; i++) {
      arr.push(children[i] || { name: '', age: '' });
    }
    setChildren(arr);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form.childrenCount]);

  const handleChange = async (name, value) => {
    if (name === 'attending' && value === false) {
      await updateCollection('users', auth.user, { attending: value });
      getUserData(auth.user);
    }
    setForm(prev => ({ ...prev, [name]: value }));
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  useEffect(() => {
    if (form?.gender === 'male') {
      setForm({ ...form, childrenCount: '0' });
      setChildren([]);
    }
  }, [form?.gender]);

  const handleChildChange = (index, field, val) => {
    const cloned = [...children];
    cloned[index] = { ...cloned[index], [field]: val };
    setChildren(cloned);
  };

  const validate = () => {
    const newErr = {};
    if (form?.attending === false)
      newErr.attending = 'Please select if you are attending';
    else if (form?.attending === true) {
      if (!form.fullName.trim()) newErr.fullName = 'Full name is required';
      if (!form.dob) newErr.dob = 'Date of birth is required';
      if (!form.mobile.trim()) newErr.mobile = 'Mobile number required';
      else if (!/^\d{10}$/.test(form.mobile))
        newErr.mobile = 'Mobile must be 10 digits';
      if (!form.village.trim()) newErr.village = 'Village/City required';
      if (!form.gender) newErr.gender = 'Village/City required';
      if (form.isTeacher === '')
        newErr.isTeacher = 'Teacher / Student required';

      // validate children details if any
      const count = parseInt(form.childrenCount || '0', 10);
      for (let i = 0; i < count; i++) {
        if (!children[i] || !children[i].name?.trim()) {
          newErr[`child_name_${i}`] = 'Child name required';
        }
        if (!children[i] || !children[i].age?.trim()) {
          newErr[`child_age_${i}`] = 'Child age required';
        }
      }
    }

    setErrors(newErr);
    return Object.keys(newErr).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) {
      Alert.alert(
        'Please fix errors',
        'Complete required fields highlighted in red.',
      );
      return;
    }

    if (form.attending === false) {
      // Just show thank-you if no
      await updateCollection('users', auth?.user, { attending: false });
      return;
    }

    const totalPersons = 1 + parseInt(form.childrenCount || '0', 10);

    const childrenCnt = Number(form?.childrenCount) > 0;
    const childrenData = childrenCnt ? children : [];
    if (childrenCnt && !children?.length) {
      Alert.alert(
        `Please add ${form?.childrenCount} ${
          Number(form?.childrenCount) > 1 ? 'children' : 'child'
        }`,
        `You have mentioned children count as ${form?.childrenCount}`,
      );
      return;
    }
    const updatedData = {
      ...form,
      dob: form.dob.toISOString(),
      totalPersons,
      children: childrenData,
    };
    if (openAllowForm) {
      await updateCollection('users', auth?.user, {
        ...userDetail,
        users: updatedData,
      });
    } else {
      await updateCollection('users', auth?.user, {
        ...userDetail,
        ...updatedData,
      });
    }
    getUserData(auth.user);
    setOpenAllowForm(false);
  };

  if (
    (userDetail?.attending === true || userDetail?.attending === false) &&
    !openAllowForm
  )
    return (
      <RenderSuccessView
        userDetail={userDetail}
        styles={styles}
        getUserData={getUserData}
        setOpenAllowForm={setOpenAllowForm}
      />
    );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Header title="Get-Together Form" navigation={navigation} showBack />
        <View style={styles.inner}>
          <MaterialIcon
            name="event"
            size={56}
            color="'#002b5c',"
            style={{ marginBottom: 6 }}
          />
          <Text style={styles.title}>Are you attending?</Text>
          {/* Attending radio */}
          <View
            style={{ width: '100%', marginBottom: 16, alignItems: 'center' }}
          >
            {errors.attending ? (
              <Text style={styles.errorText}>{errors.attending}</Text>
            ) : null}
            {!openAllowForm ? (
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity
                  style={
                    form.attending === true
                      ? styles.radioActive
                      : styles.radioBtn
                  }
                  onPress={() => handleChange('attending', true)}
                >
                  <Text
                    style={
                      form.attending === true
                        ? styles.radioTextActive
                        : styles.radioText
                    }
                  >
                    Yes
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={
                    form.attending === false
                      ? styles.radioActive
                      : styles.radioBtn
                  }
                  onPress={() => handleChange('attending', false)}
                >
                  <Text
                    style={
                      form.attending === false
                        ? styles.radioTextActive
                        : styles.radioText
                    }
                  >
                    No
                  </Text>
                </TouchableOpacity>
              </View>
            ) : null}
          </View>
          {/* Show full form only if attending === 'yes' */}
          {form.attending === true ? (
            <>
              {/* Full Name */}
              <InputField
                label="Full Name"
                value={form.fullName}
                onChange={handleChange}
                name="fullName"
                iconName="person"
              />
              <RadioSelectionInputs
                name="gender"
                value1="male"
                value2="female"
                onChange={handleChange}
                errors={errors}
                label="Gender"
                form={form}
                label1="Male"
                label2="Female"
              />
              {/* DOB picker */}
              <DatePickerComponent
                styles={styles}
                form={form}
                onChange={handleChange}
                errors={errors}
              />

              <RadioSelectionInputs
                name="isTeacher"
                value1={true}
                value2={false}
                onChange={handleChange}
                errors={errors}
                label="Teacher / Student"
                form={form}
                label1="Teacher"
                label2="Student"
              />

              {/* Mobile */}
              <InputField
                label="Mobile"
                value={form.mobile}
                onChange={text => {
                  text = text.replace(/[^0-9]/g, '');
                  handleChange('mobile', text);
                }}
                name="mobile"
                iconName="phone"
                keyboardType="numeric"
                maxLength={10}
              />

              {/* Village/City */}
              <InputField
                label="Village / City"
                value={form.village}
                onChange={handleChange}
                name="village"
                iconName="location-city"
              />

              {/* Children Count */}
              {form.gender === 'female' ? (
                <ChildrenInput
                  styles={styles}
                  children={children}
                  onChange={handleChange}
                  handleChildChange={handleChildChange}
                  form={form}
                  errors={errors}
                />
              ) : null}

              {/* Comments */}
              <InputField
                label="Comments (Optional)"
                value={form.comments}
                onChange={handleChange}
                name="comments"
                iconName="edit"
              />

              {/* Submit */}
              <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
                <Text style={styles.submitText}>Submit</Text>
              </TouchableOpacity>
            </>
          ) : null}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default GetTogetherForm;

const styles = GetTogetherFormStyles;

import React, { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import DatePicker from 'react-native-date-picker';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

export default function DatePickerComponent({ styles, form, onChange, errors }) {
  const [dobPickerOpen, setDobPickerOpen] = useState(false);
  return (
    <View style={styles.inputWrapper}>
      <Text style={styles.label}>Date of birth</Text>
      <TouchableOpacity
        style={styles.inputContainer}
        onPress={() => setDobPickerOpen(true)}
      >
        <MaterialIcon name="calendar-today" size={20} style={styles.icon} />
        <Text style={[styles.input, { color: form.dob ? '#fff' : '#999' }]}>
          {form.dob
            ? new Date(form.dob).toLocaleDateString('en-GB')
            : 'Select date of birth (DD/MM/YYYY)'}
        </Text>
      </TouchableOpacity>
      {errors?.dob && <Text style={styles.errorText}>{errors.dob}</Text>}

      <DatePicker
        modal
        mode="date"
        open={dobPickerOpen}
        date={form.dob || new Date(1990, 0, 1)}
        minimumDate={new Date(1989, 0, 1)}
        maximumDate={new Date(1992, 11, 31)}
        locale="en-GB"
        onConfirm={date => {
          setDobPickerOpen(false);
          onChange('dob', date);
        }}
        onCancel={() => setDobPickerOpen(false)}
      />
    </View>
  );
}
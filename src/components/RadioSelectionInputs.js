import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function RadioSelectionInputs({
  name,
  value1,
  value2,
  label1,
  label2,
  onChange,
  errors,
  label,
  form,
}) {
  return (
    <View style={[styles.inputWrapper, { flexDirection: 'column' }]}>
      <Text style={[styles.label]}>{label}</Text>
      <View
        style={{
          flexDirection: 'row',
          gap: 30,
          justifyContent: 'center',
        }}
      >
        <TouchableOpacity
          style={
            form?.[name] === value1
              ? styles.formRadioActive
              : styles.formRadioBtn
          }
          onPress={() => onChange(name, value1)}
        >
          <Text
            style={
              form?.[name] === value1
                ? styles.radioTextActive
                : styles.radioText
            }
          >
            {label1}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={
            form?.[name] === value2
              ? styles.formRadioActive
              : styles.formRadioBtn
          }
          onPress={() => onChange(name, value2)}
        >
          <Text
            style={
              form?.[name] === value2
                ? styles.radioTextActive
                : styles.radioText
            }
          >
            {label2}
          </Text>
        </TouchableOpacity>
      </View>
      {errors?.[name] && <Text style={styles.errorText}>{errors[name]}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  inputWrapper: {
    width: '100%',
    marginBottom: 16,
  },
  errorText: {
    color: '#ff6961',
    marginTop: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
    color: '#333',
  },
  formRadioBtn: {
    borderWidth: 2,
    borderColor: '#002b5c',
    paddingVertical: 8,
    paddingHorizontal: 34,
    borderRadius: 8,
  },
  formRadioActive: {
    backgroundColor: '#002b5c',
    paddingVertical: 8,
    paddingHorizontal: 34,
    borderRadius: 8,
  },
  radioText: {
    color: '#002b5c',
    fontWeight: '600',
  },
  radioTextActive: {
    color: '#fff', //#00172D',
    fontWeight: '600',
  },
});

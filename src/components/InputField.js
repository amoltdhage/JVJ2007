import React from 'react';
import { StyleSheet, Text, TextInput, View } from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

export default function InputField(props) {
    const { label, errors, value, name, iconName, onChange, ...rest } = props;
  return (
    <View style={styles.inputWrapper}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.inputContainer}>
        <MaterialIcon name={iconName} size={20} style={styles.icon} />
        <TextInput
          placeholder={label}
          placeholderTextColor="#999"
          value={value}
          onChangeText={t => onChange(name, t)}
          style={styles.input}
          {...rest}
        />
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
  inputContainer: {
    flexDirection: 'row',
    backgroundColor: '#002b5c',
    borderRadius: 6,
    alignItems: 'center',
    paddingHorizontal: 12,
    height: 44,
  },
  input: {
    flex: 1,
    color: '#fff',
    fontSize: 16,
    paddingLeft: 8,
  },
  icon: {
    color: '#00b4db',
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
});
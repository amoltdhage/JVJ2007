import { Picker } from '@react-native-picker/picker';
import React from 'react';
import { Text, TextInput, View } from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

export default function ChildrenInput({
  styles,
  children,
  onChange,
  handleChildChange,
  form,
  errors
}) {
  return (
    <>
      <View style={styles.inputWrapper}>
        <Text style={styles.label}>Children</Text>
        <View style={styles.inputContainer}>
          <MaterialIcon name="family-restroom" size={20} style={styles.icon} />
          <Picker
            selectedValue={form.childrenCount}
            style={{ flex: 1, color: '#fff' }}
            onValueChange={itemValue => onChange('childrenCount', itemValue)}
            dropdownIconColor="#fff"
          >
            {[...Array(4).keys()].map(v => (
              <Picker.Item key={v} label={`${v}`} value={`${v}`} />
            ))}
          </Picker>
        </View>
      </View>

      {/* Children details */}
      {children.length > 0 && (
        <View style={{ width: '100%', marginTop: 8 }}>
          <Text
            style={{
              fontWeight: '600',
              color: '#000',
              marginBottom: 6,
            }}
          >
            Children Details
          </Text>
          {children.map((child, i) => (
            <View key={i} style={styles.childRow}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <TextInput
                  placeholder="Child name"
                  placeholderTextColor="#999"
                  value={child.name}
                  maxLength={50}
                  onChangeText={t => handleChildChange(i, 'name', t)}
                  style={[styles.input, { color: '#000' }]}
                />
                {errors[`child_name_${i}`] && (
                  <Text style={styles.errorText}>
                    {errors[`child_name_${i}`]}
                  </Text>
                )}
              </View>
              <View style={{ width: 70 }}>
                <TextInput
                  placeholder="Age"
                  placeholderTextColor="#999"
                  value={child.age}
                  keyboardType="numeric"
                  maxLength={2}
                  onChangeText={t => handleChildChange(i, 'age', t)}
                  style={[styles.input, { color: '#000' }]}
                />
                {errors[`child_age_${i}`] && (
                  <Text style={styles.errorText}>
                    {errors[`child_age_${i}`]}
                  </Text>
                )}
              </View>
            </View>
          ))}
        </View>
      )}
    </>
  );
}

import { Picker } from '@react-native-picker/picker';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Text, TextInput, View } from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

export default function ChildrenInput({
  styles,
  children,
  onChange,
  handleChildChange,
  form,
  errors,
}) {
  const { t } = useTranslation();
  return (
    <>
      <View style={styles.inputWrapper}>
        <Text style={styles.label}>{t("getTogether.children")}</Text>
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
            {t('getTogether.ChildrenDetails')}
          </Text>
          {children.map((child, i) => (
            <View key={i} style={[styles.childRow, { marginBottom: 15 }]}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <TextInput
                  placeholder={t("getTogether.childName")}
                  placeholderTextColor="#999"
                  value={child.name}
                  maxLength={50}
                  onChangeText={t => handleChildChange(i, 'name', t)}
                  style={{
                    color: '#000',
                    borderColor: 'gray',
                    borderWidth: 1,
                    borderRadius: 10,
                  }}
                />
                {errors[`child_name_${i}`] && (
                  <Text style={styles.errorText}>
                    {errors[`child_name_${i}`]}
                  </Text>
                )}
              </View>
              <View style={{ width: 70 }}>
                <TextInput
                  placeholder={t("getTogether.age")}
                  placeholderTextColor="#999"
                  value={child.age}
                  keyboardType="numeric"
                  maxLength={2}
                  onChangeText={t => {
                    // Allow only numbers <= 15
                    const num = parseInt(t, 10);
                    if (!isNaN(num) && num <= 15) {
                      handleChildChange(i, 'age', t);
                    } else if (t === '') {
                      handleChildChange(i, 'age', ''); // allow clearing input
                    }
                  }}
                  style={{
                    color: '#000',
                    borderColor: 'gray',
                    borderWidth: 1,
                    borderRadius: 10,
                  }}
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

import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Header from '../../components/Header';
import { EVENT_INFO } from '../../utils/utils';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';

export default function NotAttendingComponent({ resetForm, styles }) {
  const navigation = useNavigation();
  const { t } = useTranslation(); 
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Header title={EVENT_INFO.subtitle} showBack />
      <View style={styles.successInner}>
        <View style={styles.memoryCard}>
          <Text style={styles.bigTitle}>{EVENT_INFO.titleBig}</Text>
          <Text style={styles.subtitle}>{EVENT_INFO.subtitle}</Text>
          <View style={styles.detailBox}>
            <Text style={styles.detail}>{EVENT_INFO.dateLine}</Text>
            <Text style={styles.detail}>{EVENT_INFO.timeLine}</Text>
            <Text style={styles.detail}>{EVENT_INFO.placeLine}</Text>
          </View>
          <View style={{ marginTop: 24 }}>
            <Text
              style={{
                fontSize: 16,
                fontWeight: '700',
                color: '#d7daddff',
                textAlign: 'center',
              }}
            >
             { t("missYouMessage")}
            </Text>
            <TouchableOpacity
              style={[
                styles.pdfButton,
                { backgroundColor: '#eee', marginTop: 30 },
              ]}
              onPress={resetForm}
            >
              <Text style={{ color: '#002b5c', fontWeight: '700' }}>
                {t("goBackToForm")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.pdfButton,
                { backgroundColor: '#f53737ff', marginTop: 30 },
              ]}
              onPress={() => navigation.navigate("Home")}
            >
              <Text style={{ color: '#fff', fontWeight: '700' }}>
                {t("close")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}
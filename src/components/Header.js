// src/components/Header.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';

export default function Header({ title, navigation, showBack }) {
  return (
    <View style={styles.header}>
      {/* Left: Drawer Menu OR Back Button */}
      {showBack ? (
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.leftBtn}>
          <MaterialIcon name="arrow-back" size={26} color="#fff" />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity onPress={() => navigation?.openDrawer()} style={styles.leftBtn}>
          <MaterialIcon name="menu" size={26} color="#fff" />
        </TouchableOpacity>
      )}

      {/* Center: Title */}
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>

      {/* Right: Notification Button */}
      <TouchableOpacity onPress={() => navigation?.navigate('Notifications')} style={styles.rightBtn}>
        <MaterialIcon name="notifications" size={26} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#002b5c',
    paddingHorizontal: 16,
    paddingVertical: 12,
    elevation: 4,
    paddingTop: 30
  },
  leftBtn: {
    padding: 4,
  },
  rightBtn: {
    padding: 4,
  },
  title: {
    flex: 1,
    fontSize: 18,
    color: '#fff',
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

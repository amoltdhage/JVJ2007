import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function ChatMessage({ message, currentUser }) {
  const isMe = message.senderId === currentUser;

  return (
    <View style={[styles.container, isMe ? styles.myMessage : styles.theirMessage]}>
      <Text style={styles.text}>{message.text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    margin: 6,
    padding: 10,
    borderRadius: 8,
    maxWidth: "75%",
  },
  myMessage: {
    backgroundColor: "#0078fe",
    alignSelf: "flex-end",
  },
  theirMessage: {
    backgroundColor: "#e5e5ea",
    alignSelf: "flex-start",
  },
  text: {
    color: "#fff",
  },
});
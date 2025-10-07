import React from "react";
import { View, Text, StyleSheet, Linking, TouchableOpacity, ScrollView } from "react-native";

const ContactUs = () => {
  // Handlers
  const handleEmail = (email) => {
    Linking.openURL(`mailto:${email}`);
  };

  const handleCall = (number) => {
    Linking.openURL(`tel:${number}`);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header */}
      <Text style={styles.title}>📞 Contact Us</Text>

      {/* Official Section */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Official Support</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => handleEmail("zumbaTesting@gmail.com")}
        >
          <Text style={styles.buttonText}>📧 Email: support@zumbaapp.com</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => handleCall("+1234567890")}
        >
          <Text style={styles.buttonText}>📱 Call: +1 234 567 890</Text>
        </TouchableOpacity>
      </View>

      {/* Zumba Teacher Section */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Zumba Teacher</Text>
        <Text style={styles.infoText}>👩‍🏫 Name: Poonam Rathi</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => handleCall("8788287608")}
        >
          <Text style={styles.buttonText}>📱 Contact: +1 987 654 321</Text>
        </TouchableOpacity>
      </View>

      {/* Developer Section */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Developers</Text>
        <Text style={styles.infoText}>👨‍💻 Amol Dhage</Text>
        <TouchableOpacity
          style={styles.buttonSmall}
          onPress={() => handleCall("+9890332831")}
        >
          <Text style={styles.buttonText}>📱 9890332831</Text>
        </TouchableOpacity>

        <Text style={styles.infoText}>👨‍💻 Nishant J</Text>
        <TouchableOpacity
          style={styles.buttonSmall}
          onPress={() => handleCall("9352257062")}
        >
          <Text style={styles.buttonText}>📱 9352257062</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default ContactUs;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 40,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 25,
    color: "#FF4081",
  },
  card: {
    backgroundColor: "#f9f9f9",
    padding: 18,
    borderRadius: 15,
    marginBottom: 20,
    elevation: 3, // Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    marginBottom: 15,
    color: "#333",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingBottom: 5,
  },
  infoText: {
    fontSize: 16,
    marginBottom: 8,
    color: "#444",
  },
  button: {
    backgroundColor: "#FF4081",
    padding: 12,
    borderRadius: 10,
    marginVertical: 8,
  },
  buttonSmall: {
    backgroundColor: "#FF4081",
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    alignSelf: "flex-start",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
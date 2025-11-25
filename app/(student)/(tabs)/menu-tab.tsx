import React from "react";
import { StyleSheet, Text, View } from "react-native";

// This is a placeholder component since the menu functionality
// is handled by the drawer navigation
export default function MenuTabPlaceholder() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Menu Tab Placeholder</Text>
      <Text style={styles.subText}>This tab opens the drawer menu</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
  },
  text: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 10,
  },
  subText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
});

// AccountScreen.tsx
// User account & settings

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function AccountScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Account</Text>
      {/* TODO: display profile info, settings, logout button */}
      <Text style={styles.placeholder}>Profile details go here.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 48,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  placeholder: {
    color: '#888',
  },
});

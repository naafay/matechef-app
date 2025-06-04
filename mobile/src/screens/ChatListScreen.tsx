// mobile/src/screens/ChatListScreen.tsx

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../theme';

export default function ChatListScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Chat list coming soon.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  text: {
    color: Colors.text,
    fontSize: 16,
  },
});

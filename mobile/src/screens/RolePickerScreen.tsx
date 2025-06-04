// mobile/src/screens/RolePickerScreen.tsx

import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { Colors } from '../theme';

export default function RolePickerScreen() {
  const { token, refreshUser } = useContext(AuthContext);

  async function pickRole(role: 'eater' | 'feeder') {
    try {
      const res = await fetch('http://10.0.2.2:8000/users/me/role', {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role }), // Must be { role: ... }
      });
      if (!res.ok) throw new Error('Failed to set role');
      await refreshUser?.();
      // No need to navigate; App.tsx will re-render and show the right screen
    } catch (e: any) {
      Alert.alert('Error', e.message);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>How do you want to use MateChef?</Text>
      <TouchableOpacity style={styles.boxEater} onPress={() => pickRole('eater')}>
        <Text style={styles.roleTitle}>Eater</Text>
        <Text style={styles.roleDesc}>Browse and buy home-cooked food</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.boxFeeder} onPress={() => pickRole('feeder')}>
        <Text style={styles.roleTitle}>Feeder</Text>
        <Text style={styles.roleDesc}>Cook and share food with mates</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 28,
    textAlign: 'center',
  },
  boxEater: {
    backgroundColor: Colors.secondary,
    borderRadius: 14,
    padding: 32,
    marginBottom: 16,
    width: '90%',
    alignItems: 'center',
  },
  boxFeeder: {
    backgroundColor: Colors.accent,
    borderRadius: 14,
    padding: 32,
    width: '90%',
    alignItems: 'center',
  },
  roleTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 6,
  },
  roleDesc: {
    fontSize: 16,
    color: Colors.textMuted,
    textAlign: 'center',
  },
});

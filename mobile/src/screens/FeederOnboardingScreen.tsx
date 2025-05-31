// mobile/src/screens/FeederOnboardingScreen.tsx

import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { Colors } from '../theme';

export default function FeederOnboardingScreen() {
  const { token, refreshUser } = useContext(AuthContext);

  const [address, setAddress] = useState('');
  const [idVerification, setIdVerification] = useState('');
  const [saving, setSaving] = useState(false);

  const saveInfo = async () => {
    if (!address) {
      Alert.alert('Required', 'Please enter your address.');
      return;
    }
    setSaving(true);
    try {
      // Save address
      let res = await fetch('http://10.0.2.2:8000/users/me/address', {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ address }),
      });
      if (!res.ok) throw new Error('Failed to save address.');

      // Save ID verification (optional for now)
      if (idVerification) {
        res = await fetch('http://10.0.2.2:8000/users/me/id-verification', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id_verification: idVerification }),
        });
        if (!res.ok) throw new Error('Failed to save ID verification.');
      }

      await refreshUser();
      // DO NOT NAVIGATE! The root navigator will auto-switch.
      // The user will be taken to the main app (tabs) when address is set.
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to save info');
    }
    setSaving(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Feeder Setup</Text>
      <Text style={styles.label}>Pickup Address *</Text>
      <TextInput
        style={styles.input}
        value={address}
        onChangeText={setAddress}
        placeholder="Your address"
        placeholderTextColor={Colors.textMuted}
      />
      <Text style={styles.label}>ID Verification (optional)</Text>
      <TextInput
        style={styles.input}
        value={idVerification}
        onChangeText={setIdVerification}
        placeholder="Govt ID, Driver License etc."
        placeholderTextColor={Colors.textMuted}
      />
      <TouchableOpacity style={styles.button} onPress={saveInfo} disabled={saving}>
        <Text style={styles.buttonText}>{saving ? 'Saving...' : 'Save & Continue'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, justifyContent: 'center', padding: 24 },
  title: { fontSize: 26, fontWeight: 'bold', color: Colors.primary, marginBottom: 28, textAlign: 'center' },
  label: { fontSize: 16, fontWeight: '500', marginTop: 16, color: Colors.primary },
  input: { borderWidth: 1, borderColor: Colors.primary, borderRadius: 6, padding: 12, marginTop: 8, backgroundColor: '#fff', color: Colors.text },
  button: { marginTop: 32, backgroundColor: Colors.primary, padding: 16, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
});

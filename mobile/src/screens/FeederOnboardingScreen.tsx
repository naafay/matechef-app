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
    if (!token) {
      Alert.alert('Error', 'You must be logged in to save.');
      return;
    }

    setSaving(true);
    try {
      // Build headers using token from context
      const headers = {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      };

      // Save address
      const res = await fetch('http://10.0.2.2:8000/users/me/address', {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ address }),
      });
      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Failed to save address: ${errorText}`);
      }

      // Save ID verification (optional)
      if (idVerification) {
        const res2 = await fetch('http://10.0.2.2:8000/users/me/id-verification', {
          method: 'POST',
          headers,
          body: JSON.stringify({ id_verification: idVerification }),
        });
        if (!res2.ok) {
          const errorText = await res2.text();
          throw new Error(`Failed to save ID verification: ${errorText}`);
        }
      }

      await refreshUser();
      // After this, MyMealsScreen will detect address and show list
    } catch (e: any) {
      Alert.alert('Error', e.message || 'Failed to save info');
    }
    setSaving(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chef Profile Setup</Text>
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
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 28,
    textAlign: 'center',
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 16,
    color: Colors.primary,
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 6,
    padding: 12,
    marginTop: 8,
    backgroundColor: '#fff',
    color: Colors.text,
  },
  button: {
    marginTop: 32,
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
});

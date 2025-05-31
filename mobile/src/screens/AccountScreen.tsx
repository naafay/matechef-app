// mobile/src/screens/AccountScreen.tsx

import React, { useContext } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { Colors } from '../theme';

export default function AccountScreen() {
  const { user, logout } = useContext(AuthContext);
  const navigation = useNavigation<any>();

  // FEEDER DASHBOARD
  if (user?.active_role === 'feeder') {
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Feeder Dashboard</Text>
        <Text style={styles.infoText}>Welcome, {user.first_name}!</Text>
        <TouchableOpacity
          style={styles.bigBtn}
          onPress={() => navigation.navigate('MyMeals')}
        >
          <Text style={styles.bigBtnText}>My Meals</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.outlineBtn}
          onPress={logout}
        >
          <Text style={styles.outlineBtnText}>Logout</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // EATER DASHBOARD
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Account</Text>
      <Text style={styles.infoText}>Hello, {user?.first_name || 'Mate'}!</Text>
      <TouchableOpacity
        style={styles.bigBtn}
        onPress={logout}
      >
        <Text style={styles.bigBtnText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, justifyContent: 'center', alignItems: 'center', padding: 20 },
  header: { fontSize: 28, fontWeight: 'bold', color: Colors.primary, marginBottom: 20 },
  infoText: { fontSize: 18, color: Colors.textMuted, marginBottom: 24 },
  bigBtn: { backgroundColor: Colors.primary, paddingVertical: 18, paddingHorizontal: 36, borderRadius: 8, marginBottom: 18 },
  bigBtnText: { color: '#fff', fontWeight: '600', fontSize: 18 },
  outlineBtn: { borderWidth: 1, borderColor: Colors.primary, paddingVertical: 12, paddingHorizontal: 28, borderRadius: 8, marginTop: 12 },
  outlineBtnText: { color: Colors.primary, fontWeight: '600', fontSize: 16 },
});

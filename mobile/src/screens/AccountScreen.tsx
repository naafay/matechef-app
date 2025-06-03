// mobile/src/screens/AccountScreen.tsx

import React, { useContext, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { useNavigation, NavigationState } from '@react-navigation/native';
import { AuthContext } from '../context/AuthContext';
import { Colors } from '../theme';

export default function AccountScreen() {
  const { user, logout } = useContext(AuthContext);
  const navigation = useNavigation<any>();

  useEffect(() => {
    // Log the navigation state when AccountScreen mounts
    const state: NavigationState | undefined = navigation.getState();
    console.log('[AccountScreen] Mounted. Navigation state:', JSON.stringify(state, null, 2));
  }, [navigation]);

  /**
   * Navigate to the feeder‐only MyMeals stack inside FeederTab:
   *   MainApp → FeederTab → MyMeals
   */
  function goToMyMeals() {
    console.log('[AccountScreen] goToMyMeals called');
    try {
      navigation.navigate('Feeder', { screen: 'MyMeals' });
      console.log('[AccountScreen] Called navigation.navigate("FeederTab", { screen: "MyMeals" })');
    } catch (err: any) {
      console.error('[AccountScreen] Navigation error to FeederTab → MyMeals:', err);
      Alert.alert('Navigation Error', err.message || 'Could not open My Meals');
    }
  }

  // FEEDER DASHBOARD
  if (user?.active_role === 'feeder') {
    console.log('[AccountScreen] Rendering Feeder view for user:', user.id);
    return (
      <View style={styles.container}>
        <Text style={styles.header}>Feeder Dashboard</Text>
        <Text style={styles.infoText}>Welcome, {user.first_name}!</Text>

        <TouchableOpacity style={styles.bigBtn} onPress={goToMyMeals}>
          <Text style={styles.bigBtnText}>My Meals</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.outlineBtn} onPress={logout}>
          <Text style={styles.outlineBtnText}>Logout</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // EATER DASHBOARD
  console.log('[AccountScreen] Rendering Eater view for user:', user?.id);
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Account</Text>
      <Text style={styles.infoText}>Hello, {user?.first_name || 'Mate'}!</Text>

      <TouchableOpacity style={styles.bigBtn} onPress={logout}>
        <Text style={styles.bigBtnText}>Logout</Text>
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
    padding: 20,
  },
  header: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 18,
    color: Colors.textMuted,
    marginBottom: 24,
  },
  bigBtn: {
    backgroundColor: Colors.primary,
    paddingVertical: 18,
    paddingHorizontal: 36,
    borderRadius: 8,
    marginBottom: 18,
  },
  bigBtnText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 18,
  },
  outlineBtn: {
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 8,
    marginTop: 12,
  },
  outlineBtnText: {
    color: Colors.primary,
    fontWeight: '600',
    fontSize: 16,
  },
});

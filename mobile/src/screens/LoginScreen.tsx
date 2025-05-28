// mobile/src/screens/LoginScreen.tsx
// Updated: “New user? Sign Up” now navigates to the Signup screen instead of showing an alert

import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';

type LoginNavProp = NativeStackNavigationProp<RootStackParamList, 'Main'>;

export default function LoginScreen() {
  const { login } = useContext(AuthContext);
  const navigation = useNavigation<LoginNavProp>();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const onSubmit = async () => {
    if (!username || !password) {
      Alert.alert('Error', 'Please enter both username (or email) and password.');
      return;
    }
    try {
      await login(username, password);
    } catch {
      // login() already shows an alert on error
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>MateChef Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Username or Email"
        autoCapitalize="none"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity style={styles.button} onPress={onSubmit}>
        <Text style={styles.buttonText}>Sign In</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Signup')}>
        <Text style={styles.link}>New user? Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#aaa',
    borderRadius: 4,
    padding: 12,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 4,
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
  link: {
    color: '#4CAF50',
    textAlign: 'center',
    marginTop: 8,
  },
});

// mobile/src/screens/SignupScreen.tsx
import React, { useState, useContext } from 'react';
import {
  ScrollView,
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

type NavProp = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export default function SignupScreen() {
  const navigation = useNavigation<NavProp>();
  const { login } = useContext(AuthContext);

  const [firstName, setFirstName] = useState('');
  const [lastName,  setLastName]  = useState('');
  const [username,  setUsername]  = useState('');
  const [email,     setEmail]     = useState('');
  const [password,  setPassword]  = useState('');
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = async () => {
    if (![firstName, lastName, username, email, password].every(Boolean)) {
      Alert.alert('Error', 'All fields are required.');
      return;
    }
    setSubmitting(true);
    try {
      const resp = await fetch('http://10.0.2.2:8000/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: firstName,
          last_name:  lastName,
          username,
          email,
          password,
        }),
      });

      const body = await resp.json().catch(() => ({}));

      if (resp.ok) {
        // Signup succeeded
        Alert.alert('Success', 'Account created! Logging you in…');
        await login(username, password);
        return;
      }

      // Handle known errors
      if (resp.status === 400 && body.detail) {
        Alert.alert(
          'Signup Error',
          `${body.detail}`,
          [
            { text: 'OK' },
            { text: 'Go to Login', onPress: () => navigation.navigate('Login') },
          ]
        );
      } else {
        // Generic error
        Alert.alert('Signup Error', body.detail || 'Something went wrong.');
      }
    } catch (e: any) {
      Alert.alert('Network Error', e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Create Account</Text>

      <TextInput
        style={styles.input}
        placeholder="First Name"
        value={firstName}
        onChangeText={setFirstName}
      />
      <TextInput
        style={styles.input}
        placeholder="Last Name"
        value={lastName}
        onChangeText={setLastName}
      />
      <TextInput
        style={styles.input}
        placeholder="Username"
        autoCapitalize="none"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity
        style={[styles.button, submitting && styles.buttonDisabled]}
        onPress={onSubmit}
        disabled={submitting}
      >
        <Text style={styles.buttonText}>
          {submitting ? 'Signing Up…' : 'Sign Up'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>Have an account? Log In</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    flexGrow: 1,
    justifyContent: 'center',
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
  buttonDisabled: {
    backgroundColor: '#8BC34A',
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

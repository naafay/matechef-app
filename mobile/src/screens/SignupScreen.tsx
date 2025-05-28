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
import { Colors } from '../theme';

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
        Alert.alert('Success', 'Account created! Logging you in…');
        await login(username, password);
        return;
      }
      if (resp.status === 400 && body.detail) {
        Alert.alert(
          'Signup Error',
          body.detail,
          [
            { text: 'OK' },
            { text: 'Go to Login', onPress: () => navigation.navigate('Login') },
          ]
        );
      } else {
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
        placeholderTextColor={Colors.textMuted}
        value={firstName}
        onChangeText={setFirstName}
      />
      <TextInput
        style={styles.input}
        placeholder="Last Name"
        placeholderTextColor={Colors.textMuted}
        value={lastName}
        onChangeText={setLastName}
      />
      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor={Colors.textMuted}
        autoCapitalize="none"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor={Colors.textMuted}
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor={Colors.textMuted}
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
    backgroundColor: Colors.background,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.primary,
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 4,
    padding: 12,
    marginBottom: 16,
    backgroundColor: '#fff',
    color: Colors.text,
  },
  button: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 4,
    marginBottom: 12,
  },
  buttonDisabled: {
    backgroundColor: Colors.secondary,
  },
  buttonText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
  },
  link: {
    color: Colors.primary,
    textAlign: 'center',
    marginTop: 8,
  },
});

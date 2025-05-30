// mobile/src/screens/SignupScreen.tsx
import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
} from 'react-native';
import { AuthContext } from '../context/AuthContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../App';
import { Colors } from '../theme';
import { API_BASE_URL } from '../api/config';

type SignupNavProp = NativeStackNavigationProp<RootStackParamList, 'Main'>;

export default function SignupScreen() {
  const { login } = useContext(AuthContext);
  const navigation = useNavigation<SignupNavProp>();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!firstName || !lastName || !username || !email || !password || !confirm) {
      Alert.alert('Error', 'Please fill all fields.');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          username,
          email,
          password,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        let msg = data.detail || 'Signup failed. Try a different username or email.';
        if (Array.isArray(data.detail)) {
          msg = data.detail.map((d: any) => d.msg).join(', ');
        }
        Alert.alert('Signup Error', msg);
        setLoading(false);
        return;
      }
      // Success! Log in immediately.
      await login(username, password);
    } catch (err: any) {
      Alert.alert('Signup Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('../../assets/mc_logo_header.png')}
        style={styles.logo}
        resizeMode="contain"
      />
      <Text style={styles.title}>Sign Up for MateChef</Text>
      <TextInput
        style={styles.input}
        placeholder="First Name"
        placeholderTextColor="#b5cdb5"
        autoCapitalize="words"
        value={firstName}
        onChangeText={setFirstName}
      />
      <TextInput
        style={styles.input}
        placeholder="Last Name"
        placeholderTextColor="#b5cdb5"
        autoCapitalize="words"
        value={lastName}
        onChangeText={setLastName}
      />
      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor="#b5cdb5"
        autoCapitalize="none"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#b5cdb5"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#b5cdb5"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        placeholderTextColor="#b5cdb5"
        secureTextEntry
        value={confirm}
        onChangeText={setConfirm}
      />
      <TouchableOpacity style={styles.button} onPress={onSubmit} disabled={loading}>
        <Text style={styles.buttonText}>{loading ? 'Signing Up...' : 'Sign Up'}</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={styles.link}>Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  logo: {
    width: 180,
    height: 80,
    marginBottom: 18,
    marginTop: -40,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 24,
    textAlign: 'center',
  },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#fff',
    borderRadius: 4,
    padding: 12,
    marginBottom: 16,
    color: '#fff',
    backgroundColor: '#1e3d2a',
  },
  button: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 4,
    marginBottom: 12,
    width: '100%',
  },
  buttonText: {
    color: Colors.primary,
    textAlign: 'center',
    fontWeight: '600',
  },
  link: {
    color: '#fff',
    textAlign: 'center',
    marginTop: 8,
  },
});

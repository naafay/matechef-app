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

type SignupNavProp = NativeStackNavigationProp<RootStackParamList, 'Main'>;

export default function SignupScreen() {
  const { login } = useContext(AuthContext);
  const navigation = useNavigation<SignupNavProp>();
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');

  const onSubmit = async () => {
    if (!username || !email || !password || !confirm) {
      Alert.alert('Error', 'Please fill all fields.');
      return;
    }
    if (password !== confirm) {
      Alert.alert('Error', 'Passwords do not match.');
      return;
    }
    // TODO: Replace this with your actual signup logic
    try {
      // Example: await api.signup({ username, email, password });
      // Then log in automatically:
      await login(username, password);
    } catch {
      // Show your own error
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
      <TouchableOpacity style={styles.button} onPress={onSubmit}>
        <Text style={styles.buttonText}>Sign Up</Text>
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

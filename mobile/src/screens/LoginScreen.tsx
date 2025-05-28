// mobile/src/screens/LoginScreen.tsx
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
import { Colors } from '../theme';

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
      // login() shows alert on failure
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>MateChef Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Username or Email"
        placeholderTextColor={Colors.textMuted}
        autoCapitalize="none"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor={Colors.textMuted}
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
    backgroundColor: Colors.background,
    justifyContent: 'center',
    padding: 24,
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
    color: Colors.text,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: Colors.primary,
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
    color: Colors.primary,
    textAlign: 'center',
    marginTop: 8,
  },
});

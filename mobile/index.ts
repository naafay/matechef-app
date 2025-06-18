// mobile/index.ts
import 'react-native-get-random-values'; // Polyfill for crypto.getRandomValues
import { registerRootComponent } from 'expo';
import App from './App';

registerRootComponent(App);
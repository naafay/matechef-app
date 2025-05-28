// App.tsx
// Root component setting up the navigation stack for MateChef

import React from 'react';
// Provides the navigation context for the app
import { NavigationContainer } from '@react-navigation/native';
// Stack-based navigator
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import screens
import HomeScreen from './src/screens/HomeScreen';
import BrowseScreen from './src/screens/BrowseScreen';

// Define the available routes and their parameters
export type RootStackParamList = {
  Home: undefined;   // no parameters
  Browse: undefined; // no parameters
};

// Instantiate the stack navigator
const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    // Wrap the app to enable navigation functionality
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false, // hide default headers
        }}
      >
        {/* Register each screen */}
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Browse" component={BrowseScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

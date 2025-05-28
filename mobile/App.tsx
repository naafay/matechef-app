// App.tsx
// Sets up the navigation stack for MateChef

import React from 'react';
// Navigation container provides context & state for navigation
import { NavigationContainer } from '@react-navigation/native';
// Native stack navigator for simple stack-based transitions
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import all screens
import HomeScreen from './src/screens/HomeScreen';
import BrowseScreen from './src/screens/BrowseScreen';
import ChefProfileScreen from './src/screens/ChefProfileScreen';

// Define the app’s route names and their params
export type RootStackParamList = {
  Home: undefined;           // initial landing page
  Browse: undefined;         // browse list of chefs
  Profile: { chefId: string };// profile view for a specific chef
};

// Instantiate the stack navigator
const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false, // we’ll build our own headers later
        }}
      >
        {/* Register each route */}
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Browse" component={BrowseScreen} />
        <Stack.Screen name="Profile" component={ChefProfileScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

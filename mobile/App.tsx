// App.tsx
// Root navigator: a stack that wraps bottom tabs (Main) and ChefProfile & Cart screens

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import {
  createNativeStackNavigator,
  NativeStackScreenProps,
} from '@react-navigation/native-stack';
import { CartProvider } from './src/context/CartContext';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Import screens
import MapScreen from './src/screens/MapScreen';
import FavoriteScreen from './src/screens/FavoriteScreen';
import SearchScreen from './src/screens/SearchScreen';
import OrdersScreen from './src/screens/OrdersScreen';
import AccountScreen from './src/screens/AccountScreen';
import ChefProfileScreen from './src/screens/ChefProfileScreen';
import CartScreen from './src/screens/CartScreen';

// --- 1. Define your root stack’s params ---
export type RootStackParamList = {
  Main: undefined;                    // The bottom tabs
  Profile: { chefId: number };        // ChefProfile, requires chefId
  Cart: undefined;                    // Cart screen
};

const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Map"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#4CAF50',
        tabBarInactiveTintColor: 'gray',
        tabBarIcon: ({ color, size }) => {
          let iconName: React.ComponentProps<typeof Ionicons>['name'] = 'ellipse';
          switch (route.name) {
            case 'Map':
              iconName = 'map-outline';
              break;
            case 'Favorite':
              iconName = 'heart-outline';
              break;
            case 'Search':
              iconName = 'search-outline';
              break;
            case 'Orders':
              iconName = 'list-outline';
              break;
            case 'Account':
              iconName = 'person-outline';
              break;
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Map" component={MapScreen} />
      <Tab.Screen name="Favorite" component={FavoriteScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Orders" component={OrdersScreen} />
      <Tab.Screen name="Account" component={AccountScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <CartProvider>
      <NavigationContainer>
        <RootStack.Navigator screenOptions={{ headerShown: false }}>
          {/* MainTabs holds your bottom-tab UI */}
          <RootStack.Screen name="Main" component={MainTabs} />
          {/* Chef profile, pushed from anywhere with a chefId */}
          <RootStack.Screen name="Profile" component={ChefProfileScreen} />
          {/* Cart screen, pushed when tapping the floating cart button */}
          <RootStack.Screen name="Cart" component={CartScreen} />
        </RootStack.Navigator>
      </NavigationContainer>
    </CartProvider>
  );
}

// App.tsx
// Root navigator: a stack with MainTabs (your five icons) and a Cart screen

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { CartProvider } from './src/context/CartContext';

// Bottom Tabs
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Screens
import MapScreen from './src/screens/MapScreen';
import FavoriteScreen from './src/screens/FavoriteScreen';
import SearchScreen from './src/screens/SearchScreen';
import OrdersScreen from './src/screens/OrdersScreen';
import AccountScreen from './src/screens/AccountScreen';
import CartScreen from './src/screens/CartScreen';

// ----- Type for root stack (MainTabs + Cart) -----
export type RootStackParamList = {
  Main: undefined;
  Cart: undefined;
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
          if (route.name === 'Map') iconName = 'map-outline';
          if (route.name === 'Favorite') iconName = 'heart-outline';
          if (route.name === 'Search') iconName = 'search-outline';
          if (route.name === 'Orders') iconName = 'list-outline';
          if (route.name === 'Account') iconName = 'person-outline';
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
    // Wrap the entire app so any screen can use cart state
    <CartProvider>
      <NavigationContainer>
        <RootStack.Navigator
          initialRouteName="Main"
          screenOptions={{ headerShown: false }}
        >
          {/* MainTabs holds your bottom tab navigator */}
          <RootStack.Screen name="Main" component={MainTabs} />
          {/* Cart is presented modally on top of MainTabs */}
          <RootStack.Screen name="Cart" component={CartScreen} />
        </RootStack.Navigator>
      </NavigationContainer>
    </CartProvider>
  );
}

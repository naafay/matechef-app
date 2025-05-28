// App.tsx
import React, { useContext } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import {
  createNativeStackNavigator,
} from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { AuthProvider, AuthContext } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';
import { Colors } from './src/theme';

// Screens
import MapScreen from './src/screens/MapScreen';
import FavoriteScreen from './src/screens/FavoriteScreen';
import SearchScreen from './src/screens/SearchScreen';
import OrdersScreen from './src/screens/OrdersScreen';
import AccountScreen from './src/screens/AccountScreen';
import ChefProfileScreen from './src/screens/ChefProfileScreen';
import CartScreen from './src/screens/CartScreen';
import DishDetailScreen from './src/screens/DishDetailScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';

export type RootStackParamList = {
  Main: undefined;
  Profile: { chefId: number };
  Cart: undefined;
  DishDetail: { dish: import('./src/api/dishes').Dish };
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
        tabBarActiveTintColor: '#264D3D',    // dark green
        tabBarInactiveTintColor: '#777777',  // muted gray
        tabBarStyle: { 
          backgroundColor: Colors.background, // theme’s light mint-green
        },
        tabBarIcon: ({ color, size }) => {
          let iconName: React.ComponentProps<typeof Ionicons>['name'] = 'ellipse';
          switch (route.name) {
            case 'Map':
              iconName = color === '#264D3D' ? 'location' : 'location-outline';
              break;
            case 'Favorite':
              iconName = color === '#264D3D' ? 'heart' : 'heart-outline';
              break;
            case 'Search':
              iconName = color === '#264D3D' ? 'search' : 'search-outline';
              break;
            case 'Orders':
              iconName = color === '#264D3D' ? 'list' : 'list-outline';
              break;
            case 'Account':
              iconName = color === '#264D3D' ? 'person' : 'person-outline';
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

function AuthStack() {
  const AuthStack = createNativeStackNavigator();
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Signup" component={SignupScreen} />
    </AuthStack.Navigator>
  );
}

function RootNavigator() {
  const { token } = useContext(AuthContext);
  return token ? (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      <RootStack.Screen name="Main" component={MainTabs} />
      <RootStack.Screen name="Profile" component={ChefProfileScreen} />
      <RootStack.Screen name="Cart" component={CartScreen} />
      <RootStack.Screen name="DishDetail" component={DishDetailScreen} />
    </RootStack.Navigator>
  ) : (
    <AuthStack />
  );
}

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <NavigationContainer>
          <RootNavigator />
        </NavigationContainer>
      </CartProvider>
    </AuthProvider>
  );
}

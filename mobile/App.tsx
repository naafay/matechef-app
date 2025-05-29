// App.tsx

import React, { useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import { AuthProvider, AuthContext } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';
import { Colors } from './src/theme';
import Header from './src/components/Header';

import MapScreen from './src/screens/MapScreen';
import FavoriteScreen from './src/screens/FavoriteScreen';
import SearchScreen from './src/screens/SearchScreen';
import OrdersScreen from './src/screens/OrdersScreen';
import ChatListScreen from './src/screens/ChatListScreen';
import AccountScreen from './src/screens/AccountScreen';
import ChefProfileScreen from './src/screens/ChefProfileScreen';
import CartScreen from './src/screens/CartScreen';
import DishDetailScreen from './src/screens/DishDetailScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';

const MapStack = createNativeStackNavigator();
function MapStackScreen() {
  return (
    <MapStack.Navigator screenOptions={{ headerShown: false }}>
      <MapStack.Screen name="Map" component={MapScreen} />
      <MapStack.Screen name="Profile" component={ChefProfileScreen} />
      <MapStack.Screen name="DishDetail" component={DishDetailScreen} />
      <MapStack.Screen name="Cart" component={CartScreen} />
      <MapStack.Screen name="Account" component={AccountScreen} />
    </MapStack.Navigator>
  );
}

const FavoriteStack = createNativeStackNavigator();
function FavoriteStackScreen() {
  return (
    <FavoriteStack.Navigator screenOptions={{ headerShown: false }}>
      <FavoriteStack.Screen name="Favorite" component={FavoriteScreen} />
      <FavoriteStack.Screen name="Profile" component={ChefProfileScreen} />
      <FavoriteStack.Screen name="DishDetail" component={DishDetailScreen} />
      <FavoriteStack.Screen name="Cart" component={CartScreen} />
      <FavoriteStack.Screen name="Account" component={AccountScreen} />
    </FavoriteStack.Navigator>
  );
}

const SearchStack = createNativeStackNavigator();
function SearchStackScreen() {
  return (
    <SearchStack.Navigator screenOptions={{ headerShown: false }}>
      <SearchStack.Screen name="Search" component={SearchScreen} />
      <SearchStack.Screen name="Profile" component={ChefProfileScreen} />
      <SearchStack.Screen name="DishDetail" component={DishDetailScreen} />
      <SearchStack.Screen name="Cart" component={CartScreen} />
      <SearchStack.Screen name="Account" component={AccountScreen} />
    </SearchStack.Navigator>
  );
}

const OrdersStack = createNativeStackNavigator();
function OrdersStackScreen() {
  return (
    <OrdersStack.Navigator screenOptions={{ headerShown: false }}>
      <OrdersStack.Screen name="Orders" component={OrdersScreen} />
      <OrdersStack.Screen name="Cart" component={CartScreen} />
      <OrdersStack.Screen name="Account" component={AccountScreen} />
    </OrdersStack.Navigator>
  );
}

const ChatStack = createNativeStackNavigator();
function ChatStackScreen() {
  return (
    <ChatStack.Navigator screenOptions={{ headerShown: false }}>
      <ChatStack.Screen name="Chat" component={ChatListScreen} />
      <ChatStack.Screen name="Account" component={AccountScreen} />
    </ChatStack.Navigator>
  );
}

const Tab = createBottomTabNavigator();

function getActiveRouteName(state: any): string {
  if (!state || !state.routes || state.routes.length === 0) return '';
  const route = state.routes[state.index];
  if (route.state) {
    return getActiveRouteName(route.state);
  }
  return route.name;
}

function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="MapTab"
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: { backgroundColor: Colors.background },
        tabBarIcon: ({ color, size }) => {
          let iconName: React.ComponentProps<typeof Ionicons>['name'] = 'ellipse';
          switch (route.name) {
            case 'MapTab':
              iconName = color === Colors.primary ? 'location' : 'location-outline';
              break;
            case 'FavoriteTab':
              iconName = color === Colors.primary ? 'heart' : 'heart-outline';
              break;
            case 'SearchTab':
              iconName = color === Colors.primary ? 'search' : 'search-outline';
              break;
            case 'OrdersTab':
              iconName = color === Colors.primary ? 'list' : 'list-outline';
              break;
            case 'ChatTab':
              iconName = color === Colors.primary ? 'chatbubble' : 'chatbubble-outline';
              break;
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="MapTab"      component={MapStackScreen} />
      <Tab.Screen name="FavoriteTab" component={FavoriteStackScreen} />
      <Tab.Screen name="SearchTab"   component={SearchStackScreen} />
      <Tab.Screen name="OrdersTab"   component={OrdersStackScreen} />
      <Tab.Screen name="ChatTab"     component={ChatStackScreen} />
    </Tab.Navigator>
  );
}

const AuthStack = createNativeStackNavigator();

function AuthFlow() {
  return (
    <View style={{ flex: 1, backgroundColor: Colors.primary }}>
      <AuthStack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.primary },
        }}
      >
        <AuthStack.Screen name="Login"  component={LoginScreen}  />
        <AuthStack.Screen name="Signup" component={SignupScreen} />
      </AuthStack.Navigator>
    </View>
  );
}


export default function App() {
  const [currentTab, setCurrentTab] = React.useState<string | null>(null);
  const [currentStack, setCurrentStack] = React.useState<string | null>(null);

  return (
    <AuthProvider>
      <CartProvider>
        <NavigationContainer
          onStateChange={state => {
            if (!state) return;
            const tabRoute = state.routes[state.index];
            setCurrentTab(tabRoute.name);
            if (tabRoute.state) {
              setCurrentStack(getActiveRouteName(tabRoute.state));
            } else {
              setCurrentStack(tabRoute.name);
            }
          }}
        >
          <RootNavigator currentTab={currentTab} currentStack={currentStack} />
        </NavigationContainer>
      </CartProvider>
    </AuthProvider>
  );
}

function RootNavigator({ currentTab, currentStack }: { currentTab: string | null, currentStack: string | null }) {
  const { token } = useContext(AuthContext);
  return token ? (
    <View style={{ flex: 1 }}>
      <Header currentTab={currentTab} currentStack={currentStack} />
      <MainTabs />
    </View>
  ) : (
    <AuthFlow />
  );
}

const styles = StyleSheet.create({
  background: { flex: 1 },
});

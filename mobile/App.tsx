import React, { useContext } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Contexts
import { AuthProvider, AuthContext } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';

// Theme & Header
import { Colors } from './src/theme';
import Header from './src/components/Header';

// Bottom-tab screens (each is itself a stack)
import MapStackNavigator from './src/navigation/MapStackNavigator';
import FavoriteStackNavigator from './src/navigation/FavoriteStackNavigator';
import SearchStackNavigator from './src/navigation/SearchStackNavigator';
import MyMealsStackNavigator from './src/navigation/MyMealsStackNavigator';
import ChatStackNavigator from './src/navigation/ChatStackNavigator';

// Stand-alone screens (not in the tab bar)
import AccountScreen from './src/screens/AccountScreen';
import CartScreen from './src/screens/CartScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';

// Auth flow screens
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';

type RootStackParamList = {
  AuthStack: undefined;
  MainTabs: undefined;
  Cart: undefined;
  Notifications: undefined;
};

const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator();
const AuthStack = createNativeStackNavigator();

/** ─── AuthStack: Login / Signup ───────────────────────────────────────────── **/
function AuthStackNavigator() {
  return (
    <AuthStack.Navigator
      initialRouteName="Login"
      screenOptions={{ headerShown: false }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Signup" component={SignupScreen} />
    </AuthStack.Navigator>
  );
}

/** ─── Bottom Tabs ─────────────────────────────────────────────────────────── **/
function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="Map"
      screenOptions={({ route }) => ({
        header: () => <Header currentTab={route.name} currentStack={null} />,
        tabBarShowLabel: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: {
          backgroundColor: Colors.background,
          borderTopWidth: 0.5,
          borderTopColor: '#eee',
        },
      })}
    >
      {/* Visible Tabs */}
      <Tab.Screen
        name="Map"
        component={MapStackNavigator}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? 'location' : 'location-outline'}
              size={28}
              color={color}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Favorites"
        component={FavoriteStackNavigator}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? 'heart' : 'heart-outline'}
              size={28}
              color={color}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Search"
        component={SearchStackNavigator}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? 'search' : 'search-outline'}
              size={28}
              color={color}
            />
          ),
        }}
      />

      <Tab.Screen
        name="MyMeals"
        component={MyMealsStackNavigator}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? 'fast-food' : 'fast-food-outline'}
              size={28}
              color={color}
            />
          ),
        }}
      />

      <Tab.Screen
        name="Messages"
        component={ChatStackNavigator}
        options={{
          tabBarIcon: ({ focused, color }) => (
            <Ionicons
              name={focused ? 'chatbubble' : 'chatbubble-outline'}
              size={28}
              color={color}
            />
          ),
        }}
      />

      {/* Hidden (not shown in tab bar) */}
      <Tab.Screen
        name="Account"
        component={AccountScreen}
        options={{ tabBarItemStyle: { display: 'none' } }}
      />
    </Tab.Navigator>
  );
}

/** ─── AppInner: chooses Auth vs. Main ─────────────────────────────────────── **/
function AppInner() {
  const { token, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: Colors.background,
        }}
      >
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return token ? (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      <RootStack.Screen name="MainTabs" component={MainTabs} />
      <RootStack.Screen name="Cart" component={CartScreen} />
      <RootStack.Screen name="Notifications" component={NotificationsScreen} />
    </RootStack.Navigator>
  ) : (
    <AuthStackNavigator />
  );
}

/** ─── Root App ───────────────────────────────────────────────────────────── **/
export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <NavigationContainer>
          <AppInner />
        </NavigationContainer>
      </CartProvider>
    </AuthProvider>
  );
}

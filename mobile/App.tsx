// mobile/App.tsx

import React, { useContext, useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import {
  NavigationContainer,
  NavigationState,
  createNavigationContainerRef,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator, BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Contexts
import { AuthProvider, AuthContext } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';

// Theme & Header
import { Colors } from './src/theme';
import Header from './src/components/Header';

// Eater + common screens
import MapScreen from './src/screens/MapScreen';
import FavoriteScreen from './src/screens/FavoriteScreen';
import SearchScreen from './src/screens/SearchScreen';
import OrdersScreen from './src/screens/OrdersScreen';
import ChatListScreen from './src/screens/ChatListScreen';
import CartScreen from './src/screens/CartScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import ChefProfileScreen from './src/screens/ChefProfileScreen';
import DishDetailScreen from './src/screens/DishDetailScreen';

// Account screen
import AccountScreen from './src/screens/AccountScreen';

// Auth flow screens
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import RolePickerScreen from './src/screens/RolePickerScreen';
import FeederOnboardingScreen from './src/screens/FeederOnboardingScreen';

// Feeder flow screens
import MyMealsScreen from './src/screens/MyMealsScreen';
import AddMealScreen from './src/screens/AddMealScreen';
import EditMealScreen from './src/screens/EditMealScreen';

// ─── Navigator definitions ────────────────────────────────────────────────────

const Tab = createBottomTabNavigator();
const RootStack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();
const MapStack = createNativeStackNavigator();
const FavoriteStack = createNativeStackNavigator();
const SearchStack = createNativeStackNavigator();
const OrdersStack = createNativeStackNavigator();
const ChatStack = createNativeStackNavigator();
const FeederStack = createNativeStackNavigator();

// Create a navigation ref so we can “reset” from anywhere:
export const navigationRef = createNavigationContainerRef<any>();
function resetToRoute(name: string, params?: object) {
  if (navigationRef.isReady()) {
    navigationRef.reset({
      index: 0,
      routes: [{ name, params }],
    });
  }
}

/** ─── “Eater” tab stacks ──────────────────────────────────────────────────── **/

function MapStackScreen() {
  return (
    <MapStack.Navigator screenOptions={{ headerShown: false }}>
      <MapStack.Screen name="Map" component={MapScreen} />
      <MapStack.Screen name="Profile" component={ChefProfileScreen} />
      <MapStack.Screen name="DishDetail" component={DishDetailScreen} />
    </MapStack.Navigator>
  );
}

function FavoriteStackScreen() {
  return (
    <FavoriteStack.Navigator screenOptions={{ headerShown: false }}>
      <FavoriteStack.Screen name="Favorite" component={FavoriteScreen} />
      <FavoriteStack.Screen name="Profile" component={ChefProfileScreen} />
      <FavoriteStack.Screen name="DishDetail" component={DishDetailScreen} />
    </FavoriteStack.Navigator>
  );
}

function SearchStackScreen() {
  return (
    <SearchStack.Navigator screenOptions={{ headerShown: false }}>
      <SearchStack.Screen name="Search" component={SearchScreen} />
      <SearchStack.Screen name="Profile" component={ChefProfileScreen} />
      <SearchStack.Screen name="DishDetail" component={DishDetailScreen} />
    </SearchStack.Navigator>
  );
}

function OrdersStackScreen() {
  return (
    <OrdersStack.Navigator screenOptions={{ headerShown: false }}>
      <OrdersStack.Screen name="Orders" component={OrdersScreen} />
    </OrdersStack.Navigator>
  );
}

function ChatStackScreen() {
  return (
    <ChatStack.Navigator screenOptions={{ headerShown: false }}>
      <ChatStack.Screen name="Chat" component={ChatListScreen} />
    </ChatStack.Navigator>
  );
}

/** ─── Feeder flow (MyMeals/Add/Edit) ─────────────────────────────────────── **/

function FeederStackScreen() {
  return (
    <FeederStack.Navigator screenOptions={{ headerShown: false }}>
      <FeederStack.Screen name="MyMeals" component={MyMealsScreen} />
      <FeederStack.Screen name="AddMeal" component={AddMealScreen} />
      <FeederStack.Screen name="EditMeal" component={EditMealScreen} />
    </FeederStack.Navigator>
  );
}

/** ─── Custom Tab Bar: only render visible tabs (no ghost slots) ──────────── **/

const VISIBLE_TABS = ['MapTab', 'FavoriteTab', 'SearchTab', 'OrdersTab', 'ChatTab'];

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    <View style={{ flexDirection: 'row', backgroundColor: Colors.background, borderTopWidth: 0.5, borderTopColor: '#eee', height: 60 }}>
      {state.routes.map((route, index) => {
        if (!VISIBLE_TABS.includes(route.name)) return null;

        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        let iconName: React.ComponentProps<typeof Ionicons>['name'] = 'ellipse';
        switch (route.name) {
          case 'MapTab':
            iconName = isFocused ? 'location' : 'location-outline';
            break;
          case 'FavoriteTab':
            iconName = isFocused ? 'heart' : 'heart-outline';
            break;
          case 'SearchTab':
            iconName = isFocused ? 'search' : 'search-outline';
            break;
          case 'OrdersTab':
            iconName = isFocused ? 'list' : 'list-outline';
            break;
          case 'ChatTab':
            iconName = isFocused ? 'chatbubble' : 'chatbubble-outline';
            break;
        }

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });
          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            onPress={onPress}
            style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 6 }}
            activeOpacity={0.8}
          >
            <Ionicons
              name={iconName}
              size={28}
              color={isFocused ? Colors.primary : Colors.textMuted}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

/** ─── Bottom‐tab navigator (MapTab, FavoriteTab, SearchTab, OrdersTab, ChatTab, Account, Cart, Notifications, Feeder) ────────────────────────────────────── **/

function MainTabs() {
  return (
    <Tab.Navigator
      initialRouteName="MapTab"
      tabBar={props => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textMuted,
        tabBarStyle: { backgroundColor: Colors.background },
      }}
    >
      {/* Visible Tabs */}
      <Tab.Screen name="MapTab">
        {() => (
          <View style={{ flex: 1 }}>
            <Header currentTab="MapTab" currentStack={null} />
            <MapStackScreen />
          </View>
        )}
      </Tab.Screen>
      <Tab.Screen name="FavoriteTab">
        {() => (
          <View style={{ flex: 1 }}>
            <Header currentTab="FavoriteTab" currentStack={null} />
            <FavoriteStackScreen />
          </View>
        )}
      </Tab.Screen>
      <Tab.Screen name="SearchTab">
        {() => (
          <View style={{ flex: 1 }}>
            <Header currentTab="SearchTab" currentStack={null} />
            <SearchStackScreen />
          </View>
        )}
      </Tab.Screen>
      <Tab.Screen name="OrdersTab">
        {() => (
          <View style={{ flex: 1 }}>
            <Header currentTab="OrdersTab" currentStack={null} />
            <OrdersStackScreen />
          </View>
        )}
      </Tab.Screen>
      <Tab.Screen name="ChatTab">
        {() => (
          <View style={{ flex: 1 }}>
            <Header currentTab="ChatTab" currentStack={null} />
            <ChatStackScreen />
          </View>
        )}
      </Tab.Screen>

      {/* Hidden Tabs (no visible buttons, but tab bar stays visible on navigation) */}
      <Tab.Screen name="Account">
        {() => (
          <View style={{ flex: 1 }}>
            <Header currentTab="Account" currentStack={null} />
            <AccountScreen />
          </View>
        )}
      </Tab.Screen>
      <Tab.Screen name="Cart">
        {() => (
          <View style={{ flex: 1 }}>
            <Header currentTab="Cart" currentStack={null} />
            <CartScreen />
          </View>
        )}
      </Tab.Screen>
      <Tab.Screen name="Notifications">
        {() => (
          <View style={{ flex: 1 }}>
            <Header currentTab="Notifications" currentStack={null} />
            <NotificationsScreen />
          </View>
        )}
      </Tab.Screen>
      <Tab.Screen name="Feeder">
        {() => (
          <View style={{ flex: 1 }}>
            <Header currentTab="Feeder" currentStack={null} />
            <FeederStackScreen />
          </View>
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}

/** ─── Auth flow (Login/Signup) ───────────────────────────────────────────── **/

function AuthFlow() {
  return (
    <AuthStack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: Colors.primary },
      }}
    >
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Signup" component={SignupScreen} />
    </AuthStack.Navigator>
  );
}

/** ─── Simple Splash screen while we decide where to send the user ───────── */

function SplashScreen() {
  return (
    <View style={styles.loader}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
}

/** ─── RootStack: Splash → Auth → RolePicker → FeederOnboarding → MainTabs ─ */

function RootStackScreen() {
  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      <RootStack.Screen name="Splash" component={SplashScreen} />
      <RootStack.Screen name="Auth" component={AuthFlow} />
      <RootStack.Screen name="RolePicker" component={RolePickerScreen} />
      <RootStack.Screen
        name="FeederOnboarding"
        component={FeederOnboardingScreen}
      />
      <RootStack.Screen name="MainApp">
        {() => <MainTabs />}
      </RootStack.Screen>
    </RootStack.Navigator>
  );
}

/** ─── NavigationRoot: called inside AuthProvider so useContext(AuthContext) works ───────── **/

function NavigationRoot() {
  const { user, token, loading } = useContext(AuthContext);
  const [isNavigationReady, setIsNavigationReady] = useState(false);

  useEffect(() => {
    if (!navigationRef.isReady()) return;
    console.log('[NavigationRoot] user/token/loading →', { loading, token, user });

    // Figure out the deepest screen name
    const deepest = navigationRef.getCurrentRoute()?.name;
    console.log('[NavigationRoot] Deepest active route:', deepest);

    // If we’re already in one of the feeder screens, do NOT forcibly reset
    if (deepest === 'MyMeals' || deepest === 'AddMeal' || deepest === 'EditMeal') {
      console.log('[NavigationRoot] In feeder flow already; skipping reset.');
      return;
    }

    if (loading) {
      resetToRoute('Splash');
    } else if (!token || !user) {
      resetToRoute('Auth');
    } else if (!user.active_role) {
      resetToRoute('RolePicker');
    } else if (user.active_role === 'feeder' && !user.address) {
      resetToRoute('FeederOnboarding');
    } else {
      resetToRoute('MainApp');
    }
  }, [user, token, loading, isNavigationReady]);

  const handleStateChange = (state: NavigationState | undefined) => {
    console.log('[NavigationRoot] NavigationState changed:', JSON.stringify(state, null, 2));
  };

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={() => {
        setIsNavigationReady(true);
        console.log('[NavigationRoot] Navigation is ready');
      }}
      onStateChange={handleStateChange}
    >
      <RootStackScreen />
    </NavigationContainer>
  );
}

/** ─── “App” only wraps everything in AuthProvider & CartProvider ───────────── */

export default function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <NavigationRoot />
      </CartProvider>
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
});

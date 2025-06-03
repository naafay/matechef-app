// mobile/App.tsx

import React, { useContext, useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
import {
  NavigationContainer,
  NavigationState,
  createNavigationContainerRef,
} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Contexts
import { AuthProvider, AuthContext } from './src/context/AuthContext';
import { CartProvider } from './src/context/CartContext';

// Theme & Header
import { Colors } from './src/theme';
import Header from './src/components/Header';

// Screens: Eater + common
import MapScreen from './src/screens/MapScreen';
import FavoriteScreen from './src/screens/FavoriteScreen';
import SearchScreen from './src/screens/SearchScreen';
import OrdersScreen from './src/screens/OrdersScreen';
import ChatListScreen from './src/screens/ChatListScreen';
import CartScreen from './src/screens/CartScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import ChefProfileScreen from './src/screens/ChefProfileScreen';
import DishDetailScreen from './src/screens/DishDetailScreen';

// Screen: Account
import AccountScreen from './src/screens/AccountScreen';

// Screens: Auth flow
import LoginScreen from './src/screens/LoginScreen';
import SignupScreen from './src/screens/SignupScreen';
import RolePickerScreen from './src/screens/RolePickerScreen';
import FeederOnboardingScreen from './src/screens/FeederOnboardingScreen';

// Screens: Feeder flow
import MyMealsScreen from './src/screens/MyMealsScreen';
import AddMealScreen from './src/screens/AddMealScreen';
import EditMealScreen from './src/screens/EditMealScreen';

// Create navigators
const Tab       = createBottomTabNavigator();
const RootStack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();
const MapStack  = createNativeStackNavigator();
const FavoriteStack = createNativeStackNavigator();
const SearchStack   = createNativeStackNavigator();
const OrdersStack   = createNativeStackNavigator();
const ChatStack     = createNativeStackNavigator();
const FeederStack   = createNativeStackNavigator();

// Create a navigation ref so we can reset from anywhere
export const navigationRef = createNavigationContainerRef<any>();

/** Utility to reset to a given top‐level route name. */
function resetToRoute(name: string, params?: object) {
  if (navigationRef.isReady()) {
    navigationRef.reset({
      index: 0,
      routes: [{ name, params }],
    });
  }
}

/** ----- Tab Stack Screens ----- */

/** Map tab’s stack: Map, Profile, DishDetail. */
function MapStackScreen() {
  return (
    <MapStack.Navigator screenOptions={{ headerShown: false }}>
      <MapStack.Screen name="Map" component={MapScreen} />
      <MapStack.Screen name="Profile" component={ChefProfileScreen} />
      <MapStack.Screen name="DishDetail" component={DishDetailScreen} />
    </MapStack.Navigator>
  );
}

/** Favorite tab’s stack. */
function FavoriteStackScreen() {
  return (
    <FavoriteStack.Navigator screenOptions={{ headerShown: false }}>
      <FavoriteStack.Screen name="Favorite" component={FavoriteScreen} />
      <FavoriteStack.Screen name="Profile" component={ChefProfileScreen} />
      <FavoriteStack.Screen name="DishDetail" component={DishDetailScreen} />
    </FavoriteStack.Navigator>
  );
}

/** Search tab’s stack. */
function SearchStackScreen() {
  return (
    <SearchStack.Navigator screenOptions={{ headerShown: false }}>
      <SearchStack.Screen name="Search" component={SearchScreen} />
      <SearchStack.Screen name="Profile" component={ChefProfileScreen} />
      <SearchStack.Screen name="DishDetail" component={DishDetailScreen} />
    </SearchStack.Navigator>
  );
}

/** Orders tab’s stack. */
function OrdersStackScreen() {
  return (
    <OrdersStack.Navigator screenOptions={{ headerShown: false }}>
      <OrdersStack.Screen name="Orders" component={OrdersScreen} />
    </OrdersStack.Navigator>
  );
}

/** Chat tab’s stack. */
function ChatStackScreen() {
  return (
    <ChatStack.Navigator screenOptions={{ headerShown: false }}>
      <ChatStack.Screen name="Chat" component={ChatListScreen} />
    </ChatStack.Navigator>
  );
}

/** Bottom tabs navigator (eater side). Does NOT include feeder screens. */
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
      <Tab.Screen name="MapTab" component={MapStackScreen} />
      <Tab.Screen name="FavoriteTab" component={FavoriteStackScreen} />
      <Tab.Screen name="SearchTab" component={SearchStackScreen} />
      <Tab.Screen name="OrdersTab" component={OrdersStackScreen} />
      <Tab.Screen name="ChatTab" component={ChatStackScreen} />
    </Tab.Navigator>
  );
}

/** Auth flow: Login & Signup. */
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

/** Feeder flow: MyMeals, AddMeal, EditMeal. */
function FeederStackScreen() {
  return (
    <FeederStack.Navigator screenOptions={{ headerShown: false }}>
      <FeederStack.Screen name="MyMeals" component={MyMealsScreen} />
      <FeederStack.Screen name="AddMeal" component={AddMealScreen} />
      <FeederStack.Screen name="EditMeal" component={EditMealScreen} />
    </FeederStack.Navigator>
  );
}

/** Wraps Header + MainTabs so we can render them inside RootStack when logged in. */
function MainAppContainer({
  currentTab,
  currentStack,
}: {
  currentTab: string | null;
  currentStack: string | null;
}) {
  console.log('[MainAppContainer] currentTab:', currentTab, 'currentStack:', currentStack);
  return (
    <View style={{ flex: 1 }}>
      <Header currentTab={currentTab} currentStack={currentStack} />
      <MainTabs />
    </View>
  );
}

/** A simple splash screen while deciding where to route. */
function SplashScreen() {
  return (
    <View style={styles.loader}>
      <ActivityIndicator size="large" color={Colors.primary} />
    </View>
  );
}

/**
 * RootStack: contains all top-level routes:
 *  1) Splash
 *  2) Auth
 *  3) RolePicker
 *  4) FeederOnboarding
 *  5) MainApp (tabs + header)
 *  6) Account
 *  7) Cart
 *  8) Notifications
 *  9) Feeder (feeder-only stack)
 */
function RootStackScreen({
  currentTab,
  currentStack,
}: {
  currentTab: string | null;
  currentStack: string | null;
}) {
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
        {() => (
          <MainAppContainer
            currentTab={currentTab}
            currentStack={currentStack}
          />
        )}
      </RootStack.Screen>

      {/*
        Account route now wrapped with Header above AccountScreen
      */}
      <RootStack.Screen name="Account">
        {() => (
          <View style={{ flex: 1 }}>
            <Header currentTab={currentTab} currentStack={currentStack} />
            <AccountScreen />
          </View>
        )}
      </RootStack.Screen>

      <RootStack.Screen name="Cart" component={CartScreen} />
      <RootStack.Screen name="Notifications" component={NotificationsScreen} />

      {/*
        Feeder route now also wrapped with Header above the FeederStackScreen.
        That ensures MyMeals, AddMeal, and EditMeal all display the Header.
      */}
      <RootStack.Screen name="Feeder">
        {() => (
          <View style={{ flex: 1 }}>
            <Header currentTab={currentTab} currentStack={currentStack} />
            <FeederStackScreen />
          </View>
        )}
      </RootStack.Screen>
    </RootStack.Navigator>
  );
}

// Refs to hold currentTab/currentStack so Header can read them
const currentTabRef = { current: null as string | null };
const currentStackRef = { current: null as string | null };

/**
 * NavigationRoot is a child of AuthProvider, so useContext(AuthContext) sees real values.
 */
function NavigationRoot() {
  const { user, token, loading } = useContext(AuthContext);
  const [isNavigationReady, setIsNavigationReady] = useState(false);

  /**
   * Once navigation is ready and any time loading/token/user changes,
   * decide whether to reset. But if the current deepest route is one of
   * the feeder screens, skip the reset.
   */
  useEffect(() => {
    if (!navigationRef.isReady()) return;
    console.log('[NavigationRoot] user/token/loading changed →', { loading, token, user });

    // Determine deepest active route name
    const deepest = navigationRef.getCurrentRoute()?.name;
    console.log('[NavigationRoot] deepest active route:', deepest);

    // If we are already inside one of the feeder screens, skip resetting
    if (deepest === 'MyMeals' || deepest === 'AddMeal' || deepest === 'EditMeal') {
      console.log('[NavigationRoot] Already inside feeder flow; skipping reset.');
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
  }, [loading, token, user, isNavigationReady]);

  /**
   * Whenever the navigation state changes, update currentTabRef/currentStackRef.
   */
  const handleStateChange = (state: NavigationState | undefined) => {
    console.log('[NavigationRoot] NavigationState changed:', JSON.stringify(state, null, 2));
    if (!state || !state.routes || state.routes.length === 0) {
      currentTabRef.current = null;
      currentStackRef.current = null;
      return;
    }

    // Top-level route name: Splash, Auth, RolePicker, MainApp, Account, Cart, Notifications, Feeder
    const topRoute = state.routes[state.index];
    console.log('[NavigationRoot] Top-level route:', topRoute.name);

    if (topRoute.name !== 'MainApp') {
      currentTabRef.current = null;
      currentStackRef.current = null;
      return;
    }

    // We are inside MainApp → the Tab navigator
    const tabState = topRoute.state as NavigationState | undefined;
    if (!tabState || !tabState.routes || tabState.routes.length === 0) {
      currentTabRef.current = null;
      currentStackRef.current = null;
      return;
    }

    // Active tab route (MapTab, FavoriteTab, etc.)
    const activeTabRoute = tabState.routes[tabState.index];
    console.log('[NavigationRoot] Active tab route:', activeTabRoute.name);
    currentTabRef.current = activeTabRoute.name;

    // If that tab has nested state, find the deepest nested route
    if (activeTabRoute.state) {
      let nested = activeTabRoute.state as NavigationState;
      while (nested.routes[nested.index].state) {
        nested = nested.routes[nested.index].state as NavigationState;
      }
      console.log(
        '[NavigationRoot] Deepest nested route in tab:',
        nested.routes[nested.index].name
      );
      currentStackRef.current = nested.routes[nested.index].name;
    } else {
      console.log('[NavigationRoot] No nested state. currentStack =', activeTabRoute.name);
      currentStackRef.current = activeTabRoute.name;
    }
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
      <RootStackScreen
        currentTab={currentTabRef.current}
        currentStack={currentStackRef.current}
      />
    </NavigationContainer>
  );
}

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

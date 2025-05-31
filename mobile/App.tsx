// App.tsx

import React, { useContext } from 'react';
import { View, StyleSheet, ActivityIndicator } from 'react-native';
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
import RolePickerScreen from './src/screens/RolePickerScreen';
import FeederOnboardingScreen from './src/screens/FeederOnboardingScreen';
import MyMealsScreen from './src/screens/MyMealsScreen';
import AddMealScreen from './src/screens/AddMealScreen';
import EditMealScreen from './src/screens/EditMealScreen';

const MapStack = createNativeStackNavigator();
function MapStackScreen() {
  return (
    <MapStack.Navigator screenOptions={{ headerShown: false }}>
      <MapStack.Screen name="Map" component={MapScreen} />
      <MapStack.Screen name="Profile" component={ChefProfileScreen} />
      <MapStack.Screen name="DishDetail" component={DishDetailScreen} />
      <MapStack.Screen name="Cart" component={CartScreen} />
      <MapStack.Screen name="Account" component={AccountScreen} />
      <MapStack.Screen name="MyMeals" component={MyMealsScreen} />
      <MapStack.Screen name="AddMeal" component={AddMealScreen} />
      <MapStack.Screen name="EditMeal" component={EditMealScreen} />
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
      <FavoriteStack.Screen name="MyMeals" component={MyMealsScreen} />
      <FavoriteStack.Screen name="AddMeal" component={AddMealScreen} />
      <FavoriteStack.Screen name="EditMeal" component={EditMealScreen} />
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
      <SearchStack.Screen name="MyMeals" component={MyMealsScreen} />
      <SearchStack.Screen name="AddMeal" component={AddMealScreen} />
      <SearchStack.Screen name="EditMeal" component={EditMealScreen} />
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

// RootNavigator with role picker and feeder onboarding logic
function RootNavigator({ currentTab, currentStack }: { currentTab: string | null, currentStack: string | null }) {
  const { user, token, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!token || !user) {
    return <AuthFlow />;
  }

  // If the user hasn't picked a role yet, force them to Role Picker
  if (!user.active_role) {
    const Stack = createNativeStackNavigator();
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="RolePicker" component={RolePickerScreen} />
      </Stack.Navigator>
    );
  }

  // If the user is in feeder mode but hasn't finished onboarding (no address), show onboarding
  if (user.active_role === 'feeder' && !user.address) {
    const Stack = createNativeStackNavigator();
    return (
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="FeederOnboarding" component={FeederOnboardingScreen} />
      </Stack.Navigator>
    );
  }

  // Main app (eater/feeder logic can be added here)
  return (
    <View style={{ flex: 1 }}>
      <Header currentTab={currentTab} currentStack={currentStack} />
      <MainTabs />
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

const styles = StyleSheet.create({
  background: { flex: 1 },
  loader: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: Colors.background },
});

import { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons"; //comes with expo, we didnt install it, just icons
import { SafeAreaProvider } from "react-native-safe-area-context"; //to handle safe areas on different devices
import * as NavigationBar from 'expo-navigation-bar';

// Importing AuthProvider for authentication context
import { AuthProvider } from "./context/AuthContext";

// Importing screens
import HomeScreen from "./screens/HomeScreen";
import SearchScreen from "./screens/SearchScreen";
import Profile from "./screens/Profile";
import MovieDetails from "./screens/MovieDetails"; 


const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

// Bottom tabs navigation THIS IS fin kaynin the icons (home, search, profile)
function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === "Home") iconName = focused ? "home" : "home-outline";
          else if (route.name === "Search") iconName = focused ? "search" : "search-outline";
          else if (route.name === "Profile") iconName = focused ? "person" : "person-outline";
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#e50914",
        tabBarInactiveTintColor: "gray",
        tabBarStyle: { backgroundColor: "#000", borderTopColor: "#333" },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Profile" component={Profile} />
    </Tab.Navigator>
  );
}

// Main App container this is the layout fin kibanou movies and everything bhalla thye canvas
export default function App() {

  useEffect(() => {
    NavigationBar.setBackgroundColorAsync("#000000");
    NavigationBar.setButtonStyleAsync("dark");
  }, []);

  return (
    <SafeAreaProvider>
      <AuthProvider> 
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {/* The Tab navigator is inside the Stack */}
            <Stack.Screen name="MainTabs" component={Tabs} />
            {/* MovieDetails is outside the tabs so it can cover the full screen */}
            <Stack.Screen name="MovieDetails" component={MovieDetails} />
          </Stack.Navigator>
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
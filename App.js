import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import React, { useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";

import WelcomeScreen from "./src/screens/auth/Welcome";
import LoginScreen from "./src/screens/auth/Login";
import ForgotPasswordScreen from "./src/screens/auth/ForgotPassword";
import Register from "./src/screens/auth/Register";
import OTP from "./src/screens/auth/OTP";

import PetOwnerTabs from "./src/navigation/PetOwnerTabs";

const Stack = createNativeStackNavigator();

export default function App() {
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const token = await SecureStore.getItemAsync("token");

        console.log("TOKEN:", token);

        if (token) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        console.log("Check login error:", error);
        setIsLoggedIn(false);
      } finally {
        setLoading(false);
      }
    };

    checkLogin();
  }, []);

  if (loading) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{ headerShown: false }}
        >
          {isLoggedIn ? (
            <Stack.Screen name="PetOwnerTabs">
              {(props) => (
                <PetOwnerTabs
                  {...props}
                  setIsLoggedIn={setIsLoggedIn}
                />
              )}
            </Stack.Screen>
          ) : (
            <>
              <Stack.Screen
                name="Welcome"
                component={WelcomeScreen}
              />

              <Stack.Screen name="Login">
                {(props) => (
                  <LoginScreen
                    {...props}
                    setIsLoggedIn={setIsLoggedIn}
                  />
                )}
              </Stack.Screen>

              <Stack.Screen
                name="Register"
                component={Register}
              />

              <Stack.Screen
                name="OTP"
                component={OTP}
              />

              <Stack.Screen
                name="ForgotPassword"
                component={ForgotPasswordScreen}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
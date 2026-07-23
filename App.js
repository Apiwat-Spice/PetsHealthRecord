import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import WelcomeScreen from "./src/screens/auth/Welcome";
import LoginScreen from "./src/screens/auth/Login";
import ForgotPasswordScreen from "./src/screens/auth/ForgotPassword";
import Register from "./src/screens/auth/Register";
import OTP from "./src/screens/auth/OTP";

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Welcome"
          component={WelcomeScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Login"
          component={LoginScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="ForgotPassword"
          component={ForgotPasswordScreen}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Register"
          component={Register}
        />
        <Stack.Screen
          name="OTP"
          component={OTP}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import WelcomeScreen from "./src/screens/auth/Welcome";
import LoginScreen from "./src/screens/auth/Login";
import ForgotPasswordScreen from "./src/screens/auth/ForgotPassword";
import Register from "./src/screens/auth/Register";
import OTP from "./src/screens/auth/OTP";

import PetOwnerTabs from "./src/navigation/PetOwnerTabs";
import AddPetScreen from "./src/screens/PetOwner/AddPetScreen";
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{ headerShown: false }}
      >
        <Stack.Screen name="Welcome" component={WelcomeScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Register" component={Register} />
        <Stack.Screen name="OTP" component={OTP} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />

        <Stack.Screen
          name="PetOwnerTabs"
          component={PetOwnerTabs}
        />
        <Stack.Screen 
          name="AddPetScreen" 
          component={AddPetScreen} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
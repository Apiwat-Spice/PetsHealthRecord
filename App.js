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

import VetNavigator from "./src/screens/Vet/VetNavigator";

import PetOwnerTabs from "./src/navigation/PetOwnerTabs";

const Stack = createNativeStackNavigator();

export default function App() {
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null); //เพิ่ม State เก็บ Role

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const token = await SecureStore.getItemAsync("token");
        const userStr = await SecureStore.getItemAsync("user"); // ดึงข้อมูล user มาดู Role ด้วย

        if (token && userStr) {
          const user = JSON.parse(userStr);
          setUserRole(user.role); // เซ็ต Role ('pet_owner' หรือ 'vet')
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

  // ฟังก์ชันสำหรับตอน Login เสร็จ (ส่งให้ Login.js ไปเรียกใช้)
  const handleLoginSuccess = (role) => {
    setUserRole(role);
    setIsLoggedIn(true);
  };

  if (loading) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {isLoggedIn ? (
            //ถ้าล็อกอินแล้ว เช็ก Role ว่าให้ไปหน้าไหน
            userRole === "vet" ? (
              <Stack.Screen name="VetNavigator">
                {(props) => <VetNavigator {...props} setIsLoggedIn={setIsLoggedIn} />}
              </Stack.Screen>
            ) : (
              <Stack.Screen name="PetOwnerTabs">
                {(props) => <PetOwnerTabs {...props} setIsLoggedIn={setIsLoggedIn} />}
              </Stack.Screen>
            )
          ) : (
            // ถ้ายังไม่ล็อกอิน ให้แสดงหน้า Auth
            <>
              <Stack.Screen name="Welcome" component={WelcomeScreen} />

              <Stack.Screen name="Login">
                {(props) => (
                  <LoginScreen 
                    {...props} 
                    onLoginSuccess={handleLoginSuccess} //ส่งฟังก์ชันใหม่เข้าไปแทน
                  />
                )}
              </Stack.Screen>

              <Stack.Screen name="Register" component={Register} />
              <Stack.Screen name="OTP" component={OTP} />
              <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
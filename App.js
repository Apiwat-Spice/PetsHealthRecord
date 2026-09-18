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
import ClinicNavigator from "./src/screens/Clinic/ClinicNavigator";
import PetOwnerTabs from "./src/navigation/PetOwnerTabs";

//  อย่าลืม Import StaffNavigator ให้ตรงกับ Path ไฟล์ของคุณด้วยนะครับ
import StaffNavigator from "./src/screens/Staff/StaffNavigator";

const Stack = createNativeStackNavigator();

export default function App() {
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null); // เก็บ Role 

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const token = await SecureStore.getItemAsync("token");
        const userStr = await SecureStore.getItemAsync("user");

        if (token && userStr) {
          const user = JSON.parse(userStr);
          setUserRole(user.role);
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

            //  เช็ก Role ว่าให้ไปหน้าไหน
            userRole === "vet" ? (
              // 1. ฝั่งของสัตวแพทย์ (Vet / Owner) จะมี 2 Navigator ให้สลับไปมาได้
              <>
                <Stack.Screen name="VetNavigator">
                  {(props) => <VetNavigator {...props} setIsLoggedIn={setIsLoggedIn} />}
                </Stack.Screen>

                <Stack.Screen name="ClinicNav">
                  {(props) => <ClinicNavigator {...props} setIsLoggedIn={setIsLoggedIn} />}
                </Stack.Screen>
              </>
            ) : userRole === "clinic_staff" ? (
              //  2. เคสที่เพิ่มใหม่: ฝั่งพนักงาน (Staff) 
              <Stack.Screen name="StaffNavigator">
                {(props) => <StaffNavigator {...props} setIsLoggedIn={setIsLoggedIn} />}
              </Stack.Screen>
            ) : (
              // 3. ฝั่งของเจ้าของสัตว์เลี้ยง (Pet Owner)
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
                    onLoginSuccess={handleLoginSuccess}
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
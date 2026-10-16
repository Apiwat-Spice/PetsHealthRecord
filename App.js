import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import React, { useEffect, useState } from "react";
import * as SecureStore from "expo-secure-store";

import WelcomeScreen from "./src/screens/auth/Welcome";
import LoginScreen from "./src/screens/auth/Login";
import OTP from "./src/screens/auth/OTP";
import PetOwnerTabs from "./src/navigation/PetOwnerTabs";
import BookAppointment from "./src/screens/PetOwner/BookAppointment";
import AppointmentDetail from "./src/screens/PetOwner/AppointmentDetail";

// นำเข้าหน้าจอสัตว์เลี้ยงและประวัติ
import Pets from "./src/screens/PetOwner/Pets";
import PetDetail from "./src/screens/PetOwner/PetDetail";
import AllVisitHistory from "./src/screens/PetOwner/AllVisitHistory";
import VisitDetail from "./src/screens/PetOwner/VisitDetail";

import EditProfile from "./src/screens/PetOwner/EditProfile";
import LoginPassword from "./src/screens/auth/LoginPassword";
import CreatePassword from "./src/screens/auth/CreatePassword";
import ChangePasswordOTP from "./src/screens/PetOwner/ChangePasswordOTP";
import ChangePassword from "./src/screens/PetOwner/ChangePassword";

const Stack = createNativeStackNavigator();

export default function App() {
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const checkLogin = async () => {
      try {
        const token = await SecureStore.getItemAsync("token");
        const userStr = await SecureStore.getItemAsync("user");
        if (token && userStr) {
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } catch (error) {
        setIsLoggedIn(false);
      } finally {
        setLoading(false);
      }
    };
    checkLogin();
  }, []);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  if (loading) return null;

  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {isLoggedIn ? (
            // โซนสำหรับผู้ใช้ที่ล็อกอินแล้ว
            <>
              <Stack.Screen name="PetOwnerTabs">
                {(props) => <PetOwnerTabs {...props} setIsLoggedIn={setIsLoggedIn} />}
              </Stack.Screen>

              <Stack.Screen name="Pets" component={Pets} />
              <Stack.Screen name="PetDetail" component={PetDetail} />
              <Stack.Screen name="AllVisitHistory" component={AllVisitHistory} />
              <Stack.Screen name="VisitDetail" component={VisitDetail} options={{ headerShown: false }} />

              <Stack.Screen name="EditProfile" component={EditProfile} />
              <Stack.Screen name="ChangePasswordOTP" component={ChangePasswordOTP} />
              <Stack.Screen name="ChangePassword" component={ChangePassword} />
              <Stack.Screen name="BookAppointment" component={BookAppointment} />
              <Stack.Screen name="AppointmentDetail" component={AppointmentDetail} />
            </>
          ) : (
            // โซนสำหรับผู้ใช้ที่ยังไม่ล็อกอิน
            <>
              <Stack.Screen name="Welcome" component={WelcomeScreen} />
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="OTP">
                {(props) => <OTP {...props} onLoginSuccess={handleLoginSuccess} />}
              </Stack.Screen>
              <Stack.Screen name="LoginPassword">
                {(props) => <LoginPassword {...props} onLoginSuccess={handleLoginSuccess} />}
              </Stack.Screen>
              <Stack.Screen name="CreatePassword">
                {(props) => <CreatePassword {...props} onLoginSuccess={handleLoginSuccess} />}
              </Stack.Screen>
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
}
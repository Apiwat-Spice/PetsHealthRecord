import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Feather } from "@expo/vector-icons";

import DashboardPetOwner from "../screens/PetOwner/Dashboard";
import Pets from "../screens/PetOwner/Pets";
import ScanQr from "../screens/PetOwner/ScanQr";
import ClinicScreen from "../screens/PetOwner/ClinicScreen";
import Profile from "../screens/PetOwner/Profile";

const Tab = createBottomTabNavigator();

export default function PetOwnerTabs({ setIsLoggedIn }) {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#8EB4D0",
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardPetOwner}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Feather name="home" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="MyPets"
        component={Pets}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Feather name="heart" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Scan QR"
        component={ScanQr}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Feather name="camera" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Clinic"
        component={ClinicScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Feather name="plus-square" size={size} color={color} />
          ),
        }}
      />

      <Tab.Screen
        name="Profile"
        options={{
          tabBarIcon: ({ color, size }) => (
            <Feather name="user" size={size} color={color} />
          ),
        }}
      >
        {(props) => (
          <Profile {...props} setIsLoggedIn={setIsLoggedIn} />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}
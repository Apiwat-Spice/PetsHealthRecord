import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { Feather } from "@expo/vector-icons";

import DashboardPetOwner from "../screens/PetOwner/Dashboard";
import Pets from "../screens/PetOwner/Pets";
import ScanQr from "../screens/PetOwner/ScanQr";
import Search from "../screens/PetOwner/Search";
import Profile from "../screens/PetOwner/Profile";
import PetDetail from "../screens/PetOwner/PetDetail";
import AddPetScreen from "../screens/PetOwner/AddPetScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();
function PetOwnerStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="Pets"
        component={Pets}
      />

      <Stack.Screen
        name="AddPetScreen"
        component={AddPetScreen}
      />

      <Stack.Screen
        name="PetDetail"
        component={PetDetail}
      />
    </Stack.Navigator>
  );
}

export default function PetOwnerTabs({setIsLoggedIn}) {
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
        name="PetOwnerStack"
        component={PetOwnerStack}
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
        name="Search"
        component={Search}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Feather name="search" size={size} color={color} />
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
          <Profile
            {...props}
            setIsLoggedIn={setIsLoggedIn}
          />
        )}
      </Tab.Screen>
    </Tab.Navigator>
  );
}
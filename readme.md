npm init -y
npm install express
npm install cors
npm install dotenv
npm install bcrypt
npm install jsonwebtoken
npm install @supabase/supabase-js
npm install nodemailer
npm install multer
npm install -D nodemon

npm install @expo/vector-icons
npm install @react-native-async-storage/async-storage
npm install @react-navigation/bottom-tabs
npm install @react-navigation/native
npm install @react-navigation/native-stack
npm install dotenv
npm install expo-checkbox
npm install expo-image-picker
npm install react-native-url-polyfill 
npx expo install expo-secure-store
npx expo install react-native-screens react-native-safe-area-context


Logout
await SecureStore.deleteItemAsync("token");
await SecureStore.deleteItemAsync("user");

navigation.replace("Login");

Role
if (result.user.role === "PetOwner") {
  navigation.replace("PetOwnerTabs");
} else if (result.user.role === "Vet") {
  navigation.replace("VetTabs");
} else if (result.user.role === "Admin") {
  navigation.replace("AdminTabs");
}

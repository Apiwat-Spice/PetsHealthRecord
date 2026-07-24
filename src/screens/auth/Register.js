import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";

export default function Register( {navigation} ) {
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone_number, setPhoneNumber] = useState("");

  const handleRegister = async () => {
    const first = firstname.trim();
    const last = lastname.trim();
    const mail = email.trim();
    const phone = phone_number.trim();

    if (!first || !last || !mail || !password || !confirmPassword || !phone) {
      Alert.alert("Error", "Please fill in all fields Thank you");
      return;
    }
    if (password.length < 6) {
      Alert.alert("Error", "Password must be at least 6 characters long");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(mail)) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("Error", "Passwords do not match");
      return;
    }
    if (!/^[A-Za-z]+$/.test(first) || !/^[A-Za-z]+$/.test(last)) {
      Alert.alert("Error", "First name and last name must contain only letters");
      return;
    }
    if (!/^0[0-9]{9}$/.test(phone)) {
      Alert.alert("Error", "Invalid phone number");
      return;
    }
    if (/\s/.test(password)) {
      Alert.alert("Error", "Password cannot contain spaces");
      return;
    }
    if (/\s/.test(confirmPassword)) {
      Alert.alert("Error", "Confirm Password cannot contain spaces");
      return;
    }
    try {
      const response = await fetch("http://10.0.2.2:3000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          firstname: first,
          lastname: last,
          email: mail,
          password,
          phone_number: phone,
        }),
      });

      const result = await response.json();
      console.log(result);
      if (response.ok) {
  
        Alert.alert(
          "Register Success Go to Login",
          result.message,
          [
            {
              text: "OK",
              onPress: () => navigation.navigate("Login"),
            },
          ]
        );
      } else {
        Alert.alert("Error", result.message);
      }
    } catch (error) {
      console.log(error);
      Alert.alert("Error", "Cannot connect to server");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Register</Text>

      <TextInput
        style={styles.input}
        placeholder="First Name"
        value={firstname}
        onChangeText={setFirstname}
      />

      <TextInput
        style={styles.input}
        placeholder="Last Name"
        value={lastname}
        onChangeText={setLastname}
      />

      <TextInput
        style={styles.input}
        placeholder="Email"
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TextInput
        style={styles.input}
        placeholder="Confirm Password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      <TextInput
        style={styles.input}
        placeholder="Phone Number"
        keyboardType="phone-pad"
        value={phone_number}
        onChangeText={setPhoneNumber}
      />



      <TouchableOpacity style={styles.button} onPress={handleRegister}>
        <Text style={styles.buttonText}>Register</Text>
      </TouchableOpacity>

      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginBottom: 30,
    textAlign: "center",
  },

  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    marginBottom: 15,
  },

  button: {
    backgroundColor: "#007AFF",
    padding: 15,
    borderRadius: 8,
  },

  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
});
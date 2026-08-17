import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Pressable,
  Alert,
} from 'react-native';
import { useState } from 'react';
import { Feather } from '@expo/vector-icons';
import { API_URL } from '../../config';

export default function OTP({ navigation, route }) {
  const [otp, setOtp] = useState('');
  const { email } = route.params;
  console.log(email);


  const handleVerify = async () => {
    try {
      console.log("email:", email);
      console.log("otp:", otp);

      const response = await fetch(`${API_URL}/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email,
          otp: otp,
        }),
      });

      const result = await response.json();

      console.log("STATUS:", response.status);
      console.log("RESULT:", result);

      if (response.ok) {
        Alert.alert(
          "Success",
          result.message,
          [
            {
              text: "OK",
              onPress: () => navigation.navigate("Login"),
            },
          ]
        );
      } else {
        Alert.alert(
          `Error ${response.status}`,
          result.message || "เกิดข้อผิดพลาด"
        );
      }
    } catch (error) {
      console.error("VERIFY OTP ERROR:", error);

      Alert.alert(
        "Connection Error",
        error.message
      );
    }
  };

  const resendOTP = async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({
          message: "Email is required",
        });
      }

      // หา User
      const [users] = await db.query(
        "SELECT * FROM users WHERE email = ?",
        [email]
      );

      if (users.length === 0) {
        return res.status(404).json({
          message: "User not found",
        });
      }

      const user = users[0];

      // สร้าง OTP 6 หลัก
      const otp = Math.floor(100000 + Math.random() * 900000).toString();

      // หมดอายุ 5 นาที
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

      // บันทึก OTP
      await db.query(
        `INSERT INTO otp_codes
       (user_id, otp, expires_at, used)
       VALUES (?, ?, ?, 0)`,
        [user.user_id, otp, expiresAt]
      );

      // ส่ง Email
      // await sendOTPEmail(email, otp);

      console.log("New OTP:", otp);

      return res.status(200).json({
        message: "OTP has been sent again",
      });

    } catch (error) {
      console.error(error);

      return res.status(500).json({
        message: "Server error",
      });
    }
  };

  return (
    <View style={styles.container}>

      <Pressable
        style={styles.backButton}
        onPress={() => navigation.goBack()}
      >
        <Feather name="chevron-left" size={24} color="black" />
        <Text style={styles.backText}>Back</Text>
      </Pressable>

      <StatusBar style="dark" />
      <Text style={styles.title}>ยืนยัน OTP</Text>

      <Text style={styles.description}>
        กรุณากรอกรหัส OTP 6 หลักที่ส่งไปยังอีเมลของคุณ
      </Text>

      <TextInput
        style={styles.otpInput}
        value={otp}
        onChangeText={setOtp}
        keyboardType="number-pad"
        maxLength={6}
        placeholder="000000"
        placeholderTextColor="#aaa"
      />

      <TouchableOpacity
        style={styles.button}
        onPress={handleVerify}
      >
        <Text style={styles.buttonText}>ยืนยัน OTP</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={resendOTP}>
        <Text style={styles.resendText}>
          ไม่ได้รับรหัส? ส่ง OTP ใหม่
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },

  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 15,
  },

  description: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },

  otpInput: {
    width: '80%',
    height: 55,
    borderWidth: 1,
    borderColor: '#8EB4D0',
    borderRadius: 10,
    textAlign: 'center',
    fontSize: 24,
    letterSpacing: 10,
    marginBottom: 20,
  },

  button: {
    width: '80%',
    height: 50,
    backgroundColor: '#8EB4D0',
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },

  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  backButton: {
    position: "absolute",
    top: 50,
    left: 20,
    flexDirection: "row",
    alignItems: "center",
  },

  backText: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 5,
  },

  resendText: {
    color: '#8EB4D0',
    fontSize: 15,
  },
});
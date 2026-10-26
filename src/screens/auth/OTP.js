import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Pressable, Alert, ImageBackground, Platform } from 'react-native';
import { useState, useRef, useEffect } from 'react';
import { Feather } from '@expo/vector-icons';
import { API_URL } from '../../config';

export default function OTP({ navigation, route }) {
  const { email, isReset } = route.params || {};

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [timer, setTimer] = useState(60);
  const inputs = useRef([]);

  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => setTimer(prev => prev - 1), 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // รองรับทั้งการพิมพ์ทีละตัวและการ Copy - Paste 6 หลัก
  const handleChange = (text, index) => {
    const cleaned = text.replace(/[^0-9]/g, '');

    if (!cleaned) {
      const newOtp = [...otp];
      newOtp[index] = '';
      setOtp(newOtp);
      return;
    }

    // กรณีคัดลอกรหัสมาวาง (Paste ความยาวมากกว่า 1 ตัว)
    if (cleaned.length > 1) {
      const pastedDigits = cleaned.slice(0, 6).split('');
      const newOtp = [...otp];

      pastedDigits.forEach((char, i) => {
        if (i < 6) {
          newOtp[i] = char;
        }
      });
      setOtp(newOtp);

      const focusIndex = Math.min(pastedDigits.length - 1, 5);
      inputs.current[focusIndex]?.focus();
    } else {
      // พิมพ์ทีละตัวตามปกติ
      const newOtp = [...otp];
      newOtp[index] = cleaned;
      setOtp(newOtp);

      if (cleaned && index < 5) {
        inputs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyPress = ({ nativeEvent }, index) => {
    if (nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      return Alert.alert("แจ้งเตือน", "กรุณากรอก OTP ให้ครบ 6 หลัก");
    }

    try {
      const response = await fetch(`${API_URL}/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email, otp: otpCode }),
      });

      const result = await response.json();

      if (response.ok) {
        navigation.navigate("CreatePassword", { email, isReset });
      } else {
        Alert.alert("ไม่สำเร็จ", result.message || "รหัส OTP ไม่ถูกต้อง");
      }
    } catch (error) {
      Alert.alert("Error", "ไม่สามารถเชื่อมต่อ Server ได้");
    }
  };

  const handleResendOTP = async () => {
    if (timer > 0) return;

    try {
      const response = await fetch(`${API_URL}/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email }),
      });

      if (response.ok) {
        setTimer(60);
        setOtp(['', '', '', '', '', '']);
        inputs.current[0]?.focus();
        Alert.alert("สำเร็จ", "ส่งรหัส OTP ใหม่ไปยังอีเมลของคุณแล้ว");
      } else {
        const result = await response.json();
        Alert.alert("เกิดข้อผิดพลาด", result.message);
      }
    } catch (error) {
      Alert.alert("Error", "ไม่สามารถเชื่อมต่อ Server ได้");
    }
  };

  return (
    <ImageBackground source={require('../../../src/public/pictures/background-welcome.png')} style={styles.background} resizeMode="cover">
      <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
        <Feather name="chevron-left" size={24} color="#1A1A1A" />
        <Text style={styles.backText}>Back</Text>
      </Pressable>

      <View style={styles.bottomSheet}>
        <Text style={styles.titleMain}>Verify OTP</Text>
        <Text style={styles.emailText}>{email}</Text>
        <Text style={styles.subtitle}>Enter the 6-digit OTP sent to your email</Text>

        <View style={styles.otpContainer}>
          {otp.map((digit, index) => (
            <TextInput
              key={index}
              ref={ref => inputs.current[index] = ref}
              style={[styles.otpBox, digit ? styles.otpBoxActive : null]}
              value={digit}
              onChangeText={text => handleChange(text, index)}
              onKeyPress={e => handleKeyPress(e, index)}
              keyboardType={Platform.OS === 'ios' ? 'number-pad' : 'numeric'}
              selectTextOnFocus
              returnKeyType="done"
              onSubmitEditing={handleVerify}
            />
          ))}
        </View>

        <TouchableOpacity
          style={styles.verifyButton}
          onPress={handleVerify}
          activeOpacity={0.85}
        >
          <Text style={styles.verifyButtonText}>Verify OTP</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleResendOTP} disabled={timer > 0}>
          <Text style={[styles.resendText, timer > 0 && { color: '#999' }]}>
            Resend OTP in <Text style={{ fontWeight: 'bold', color: timer > 0 ? '#5A7584' : '#6A899C' }}>{timer > 0 ? `00:${timer.toString().padStart(2, '0')}` : 'Now'}</Text>
          </Text>
        </TouchableOpacity>
      </View>
      <StatusBar style="dark" />
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, width: '100%', justifyContent: 'flex-end' },
  backButton: { position: 'absolute', top: 50, left: 20, flexDirection: 'row', alignItems: 'center' },
  backText: { fontSize: 18, fontWeight: 'bold', marginLeft: 5, color: '#1A1A1A' },
  bottomSheet: { backgroundColor: '#FFFFFF', height: '75%', borderTopLeftRadius: 40, borderTopRightRadius: 40, paddingHorizontal: 30, paddingTop: 45, alignItems: 'center' },
  titleMain: { fontSize: 32, fontWeight: 'bold', color: '#5A7584', marginBottom: 6 },
  emailText: { fontSize: 16, fontWeight: 'bold', color: '#8EB4D0', marginBottom: 6 },
  subtitle: { fontSize: 14, color: '#6A899C', marginBottom: 35, textAlign: 'center' },
  otpContainer: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginBottom: 35 },
  otpBox: { width: 45, height: 52, borderWidth: 1, borderColor: '#D3D3D3', borderRadius: 10, textAlign: 'center', fontSize: 22, fontWeight: 'bold', color: '#333', backgroundColor: '#FFFFFF', paddingVertical: 0 },
  otpBoxActive: { borderColor: '#8EB4D0', borderWidth: 2, backgroundColor: '#FFFFFF' },
  verifyButton: { width: '100%', backgroundColor: '#6A899C', borderRadius: 10, height: 52, justifyContent: 'center', alignItems: 'center', marginBottom: 25 },
  verifyButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
  resendText: { color: '#8EB4D0', fontSize: 15 },
});
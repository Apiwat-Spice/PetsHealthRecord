import { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ImageBackground, Pressable, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { API_URL } from '../../config';

export default function Login({ navigation, route }) { // 💡 เพิ่ม route ใน props
  const [email, setEmail] = useState(route.params?.email || '');
  const [loading, setLoading] = useState(false);

  // 💡 คอยอัปเดตช่องอีเมลทันทีที่มีการส่ง email กลับมาจากหน้าอื่น
  useEffect(() => {
    if (route.params?.email) {
      setEmail(route.params.email);
    }
  }, [route.params?.email]);

  const handleNext = async () => {
    if (!email) return Alert.alert("แจ้งเตือน", "กรุณากรอกอีเมล");
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/check-email`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = await response.json();

      if (!response.ok) return Alert.alert("เกิดข้อผิดพลาด", result.message);

      if (result.hasPassword) {
        navigation.navigate("LoginPassword", { email });
      } else {
        await fetch(`${API_URL}/request-otp`, {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        navigation.navigate("OTP", { email });
      }
    } catch (error) {
      Alert.alert("Error", "ไม่สามารถเชื่อมต่อ Server ได้");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ImageBackground source={require('../../../src/public/pictures/background-welcome.png')} style={styles.background} resizeMode="cover">
      <Pressable style={styles.backButton} onPress={() => navigation.navigate('Welcome')}>
        <Feather name="chevron-left" size={24} color="#1A1A1A" />
        <Text style={styles.backText}>Back</Text>
      </Pressable>

      <View style={styles.bottomSheet}>
        <Text style={styles.titleMain}>Login</Text>
        <Text style={styles.titleSub}>Enter your email to continue</Text>

        <View style={styles.inputWrapper}>
          <Text style={styles.floatingLabel}>Email</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter Email"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            returnKeyType="done"
            onSubmitEditing={handleNext}
          />
        </View>

        <Pressable
          style={({ pressed }) => [styles.signInButton, pressed && styles.signInButtonPressed, loading && styles.signInButtonDisabled]}
          onPress={handleNext}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.signInButtonText}>Next</Text>}
        </Pressable>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, width: '100%', justifyContent: 'flex-end' },
  backButton: { position: 'absolute', top: 50, left: 20, flexDirection: 'row', alignItems: 'center' },
  backText: { fontSize: 18, fontWeight: 'bold', marginLeft: 5, color: '#1A1A1A' },
  bottomSheet: { backgroundColor: '#FFFFFF', height: '75%', borderTopLeftRadius: 40, borderTopRightRadius: 40, paddingHorizontal: 30, paddingTop: 50, paddingBottom: 20 },
  titleMain: { fontSize: 32, fontWeight: 'bold', color: '#5A7584', textAlign: 'center' },
  titleSub: { fontSize: 16, fontWeight: 'bold', color: '#8EB4D0', textAlign: 'center', marginBottom: 40 },
  inputWrapper: { borderWidth: 1, borderColor: '#D3D3D3', borderRadius: 10, marginBottom: 20, paddingHorizontal: 15, height: 52, justifyContent: 'center', backgroundColor: '#FFFFFF', position: 'relative' },
  floatingLabel: { position: 'absolute', top: -10, left: 15, backgroundColor: '#FFFFFF', paddingHorizontal: 5, fontSize: 12, color: '#5A7584', fontWeight: 'bold' },
  input: { fontSize: 16, color: '#333', height: '100%', paddingVertical: 0 },
  signInButton: { backgroundColor: '#6A899C', borderRadius: 10, height: 52, justifyContent: 'center', alignItems: 'center', marginTop: 15 },
  signInButtonPressed: { backgroundColor: '#86A7BD' },
  signInButtonDisabled: { opacity: 0.7 },
  signInButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
});
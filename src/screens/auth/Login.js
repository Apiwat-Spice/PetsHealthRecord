import { useState } from 'react';
import { StyleSheet, Text, View, ImageBackground, Pressable, TextInput, Alert, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { API_URL } from '../../config';


export default function Login({ navigation }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleNext = async () => {
    if (!email) return Alert.alert("แจ้งเตือน", "กรุณากรอกอีเมล");
    setLoading(true);
    try {
      // 1. เช็กอีเมลในระบบ
      const response = await fetch(`${API_URL}/check-email`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const result = await response.json();

      if (!response.ok) return Alert.alert("เกิดข้อผิดพลาด", result.message);

      // 2. ถ้ามีรหัสผ่านแล้ว -> ไปหน้าใส่รหัสผ่าน
      if (result.hasPassword) {
        navigation.navigate("LoginPassword", { email });
      } 
      // 3. ถ้ายังไม่มีรหัสผ่าน -> ขอ OTP แล้วไปหน้า OTP
      else {
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
        <Feather name="chevron-left" size={24} color="black" />
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
            value={email} 
            onChangeText={setEmail} 
            autoCapitalize="none" 
            keyboardType="email-address" 
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

// 🟢 เพิ่มโค้ดส่วน Styles คืนมาให้แล้วครับ
const styles = StyleSheet.create({
  background: { flex: 1, width: '100%', justifyContent: 'flex-end' },
  backButton: { position: 'absolute', top: 50, left: 20, flexDirection: 'row', alignItems: 'center' },
  backText: { fontSize: 18, fontWeight: 'bold', marginLeft: 5 },
  bottomSheet: { backgroundColor: '#FFFFFF', height: '75%', borderTopLeftRadius: 40, borderTopRightRadius: 40, paddingHorizontal: 30, paddingTop: 50, paddingBottom: 20 },
  titleMain: { fontSize: 32, fontWeight: 'bold', color: '#8EB4D0', textAlign: 'center' },
  titleSub: { fontSize: 16, fontWeight: 'bold', color: '#8EB4D0', textAlign: 'center', marginBottom: 40 },
  inputWrapper: { borderWidth: 1, borderColor: '#D3D3D3', borderRadius: 10, marginBottom: 20, paddingHorizontal: 15, paddingVertical: 10, position: 'relative' },
  floatingLabel: { position: 'absolute', top: -10, left: 15, backgroundColor: '#FFFFFF', paddingHorizontal: 5, fontSize: 12, color: '#666', fontWeight: 'bold' },
  input: { fontSize: 16, color: '#333' },
  signInButton: { backgroundColor: '#9FBBD0', borderRadius: 10, paddingVertical: 15, alignItems: 'center', marginTop: 15 },
  signInButtonPressed: { backgroundColor: '#86A7BD' },
  signInButtonDisabled: { opacity: 0.7 },
  signInButtonText: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },
});
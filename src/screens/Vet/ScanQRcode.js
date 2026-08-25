import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  StatusBar,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
export default function ScanQRcode({ navigation }) {

  const clinicInfo = {
    clinicName: 'ชื่อสถานพยาบาลสัตว์',
    vetName: 'น.สพ.สมพง'
  };

  const [petIdInput, setPetIdInput] = useState('');

  // 🟢 State สำหรับระบบกล้อง
  const [permission, requestPermission] = useCameraPermissions();
  const [isScanning, setIsScanning] = useState(false);

  // 🟢 ฟังก์ชันเปิดกล้อง
  const handleOpenCamera = async () => {
    if (!permission?.granted) {
      const result = await requestPermission();
      if (!result.granted) {
        Alert.alert('แจ้งเตือน', 'กรุณาอนุญาตให้แอปเข้าถึงกล้องเพื่อสแกน QR Code');
        return;
      }
    }
    setIsScanning(true); // เปิดหน้าจอกล้อง
  };

  // 🟢 ฟังก์ชันเมื่อสแกนเจอ QR Code
  const handleBarCodeScanned = ({ type, data }) => {
    setIsScanning(false); // ปิดกล้องทันที
    setPetIdInput(data); // เอาข้อความที่สแกนได้มาใส่ในช่องกรอก
    Alert.alert('สแกนสำเร็จ!', `รับข้อมูล: ${data}`);
  };

  const handleConfirmPetId = () => {
    if (!petIdInput.trim()) {
      Alert.alert('แจ้งเตือน', 'กรุณากล้องสแกน QR หรือกรอกรหัสสัตว์เลี้ยงก่อนครับ');
      return;
    }
    Alert.alert('สำเร็จ (โหมดทดสอบ)', `กำลังค้นหาข้อมูลสัตว์เลี้ยงรหัส: ${petIdInput}`, [
      {
        text: 'ดูผลสแกน',
        // onPress: () => navigation.navigate('PetScaned', { petId: petIdInput }),
      },
    ]);
  };

  // 🟢 หากกำลังเปิดกล้อง ให้โชว์หน้าจอสแกน
  if (isScanning) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#000' }}>
        <CameraView
          style={{ flex: 1 }}
          facing="back"
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
          onBarcodeScanned={handleBarCodeScanned}
        >
          {/* ปุ่มกดยกเลิกการสแกน */}
          <View style={styles.cameraOverlay}>
            <TouchableOpacity style={styles.closeCameraBtn} onPress={() => setIsScanning(false)}>
              <Feather name="x" size={30} color="#FFF" />
              <Text style={{ color: '#FFF', marginTop: 5, fontWeight: 'bold' }}>ยกเลิกสแกน</Text>
            </TouchableOpacity>
          </View>
        </CameraView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="#00B862" />

      <View style={styles.headerBar}>
        <Text style={styles.clinicNameText}>{clinicInfo.clinicName}</Text>
        <Text style={styles.vetNameText}>{clinicInfo.vetName}</Text>
      </View>

      <View style={styles.subHeaderBar}>
        <MaterialCommunityIcons name="barcode-scan" size={22} color="#FFFFFF" />
        <Text style={styles.subHeaderText}>สแกน QR code</Text>
      </View>

      <View style={styles.content}>
        <TouchableOpacity
          style={styles.cameraBox}
          activeOpacity={0.8}
          onPress={handleOpenCamera} // 🟢 เรียกฟังก์ชันเปิดกล้อง
        >
          <Feather name="camera" size={70} color="#1A1A1A" />
        </TouchableOpacity>

        <Text style={styles.instructionText}>
          เล็งกล้องไปที่ QR code บน{'\n'}ปลอกคอสัตว์เลี้ยง
        </Text>

        <View style={styles.inputContainer}>
          <MaterialCommunityIcons name="qrcode" size={20} color="#666666" style={styles.inputIcon} />
          <TextInput
            style={styles.textInput}
            placeholder="หรือกรอกรหัสสัตว์เลี้ยง..."
            placeholderTextColor="#888888"
            value={petIdInput}
            onChangeText={setPetIdInput}
          />
        </View>

        <TouchableOpacity
          style={styles.confirmButton}
          activeOpacity={0.8}
          onPress={handleConfirmPetId}
        >
          <Text style={styles.confirmButtonText}>ยืนยันรหัสสัตว์เลี้ยง</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F9FC',
  },
  headerBar: {
    backgroundColor: '#00B862',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 10,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 12 : 14,
  },
  clinicNameText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  vetNameText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  subHeaderBar: {
    backgroundColor: '#00C86F',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  subHeaderText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingBottom: 40,
  },
  cameraBox: {
    width: 180,
    height: 180,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#1A1A1A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  instructionText: {
    fontSize: 15,
    color: '#4A4A4A',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 30,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    width: '100%',
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginBottom: 16,
    elevation: 1,
  },
  inputIcon: {
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#333333',
  },
  confirmButton: {
    backgroundColor: '#00B862',
    width: '100%',
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  cameraOverlay: { // 🟢 กรอบทับกล้อง
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 50,
  },
  closeCameraBtn: { // 🟢 ปุ่มปิดกล้อง
    backgroundColor: 'rgba(0,0,0,0.6)',
    padding: 20,
    borderRadius: 50,
    alignItems: 'center'
  }
});
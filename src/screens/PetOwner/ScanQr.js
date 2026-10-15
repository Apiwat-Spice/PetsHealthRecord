import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Dimensions
} from "react-native";
import { useState, useEffect } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";

// 🟢 คำนวณขนาดกรอบเล็งตายตัว ไม่ให้ยืดหดตาม Flexbox เด็ดขาด
const { width } = Dimensions.get("window");
const SCAN_SIZE = 260; // ขนาดกล่อง 260x260
const SIDE_WIDTH = (width - SCAN_SIZE) / 2; // คำนวณพื้นที่สีดำซ้าย-ขวา

export default function ScanQR() {
  const [qrCode, setQrCode] = useState("");
  const [permission, requestPermission] = useCameraPermissions();

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  const handleBarcodeScanned = ({ type, data }) => {
    setQrCode(data); 
    Alert.alert("สแกนสำเร็จ!", `รหัสสัตว์เลี้ยง: ${data}`);
  };

  const handleManualSubmit = () => {
    if (!qrCode) {
      Alert.alert("แจ้งเตือน", "กรุณากรอกรหัสสัตว์เลี้ยง");
      return;
    }
    Alert.alert("กำลังค้นหาข้อมูล", `รหัส: ${qrCode}`);
  };

  if (!permission) {
    return <View style={styles.container} />; 
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* ==========================================
          1. เลเยอร์กล้อง
          ========================================== */}
      {permission.granted ? (
        <CameraView
          style={StyleSheet.absoluteFillObject}
          onBarcodeScanned={handleBarcodeScanned}
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        />
      ) : (
        <View style={styles.blackBg} />
      )}

      {/* ==========================================
          2. เลเยอร์ Overlay เจาะทะลุ (ล็อกไซส์ด้วย Dimension)
          ========================================== */}
      <View style={styles.overlayContainer} pointerEvents="none">
        
        {/* พื้นที่สีดำด้านบน */}
        <View style={styles.darkTop} />

        {/* ตรงกลาง: ซ้าย(ดำ) -> กลาง(ใส) -> ขวา(ดำ) */}
        <View style={styles.darkMiddleRow}>
          <View style={styles.darkSide} />
          
          {/* กล่องใสที่มีมุมขอบขาว */}
          <View style={styles.scanBox}>
            <View style={styles.cornerTL} />
            <View style={styles.cornerTR} />
            <View style={styles.cornerBL} />
            <View style={styles.cornerBR} />
          </View>

          <View style={styles.darkSide} />
        </View>

        {/* พื้นที่สีดำด้านล่าง */}
        <View style={styles.darkBottom}>
          <MaterialCommunityIcons name="barcode-scan" size={32} color="#FFFFFF" style={{ marginBottom: 12 }} />
          <Text style={styles.scanTitle}>สแกน QR Code</Text>
          <Text style={styles.scanSub}>จัดให้อยู่ในกรอบเพื่อสแกนอัตโนมัติ</Text>
        </View>

      </View>

      {/* ==========================================
          3. เลเยอร์ UI (การ์ดกรอกรหัส)
          ========================================== */}
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardContainer}
        pointerEvents="box-none"
      >
        <View style={styles.card} pointerEvents="auto">
          <Text style={styles.cardTitle}>หรือกรอกรหัสด้วยตนเอง</Text>
          
          <View style={styles.inputWrapper}>
            <MaterialCommunityIcons name="qrcode" size={20} color="#5A7584" style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="กรอกรหัสสัตว์เลี้ยง..."
              placeholderTextColor="#888"
              value={qrCode}
              onChangeText={setQrCode}
              autoCapitalize="characters"
            />
          </View>

          <TouchableOpacity style={styles.submitBtn} onPress={handleManualSubmit}>
            <Text style={styles.submitText}>ยืนยันรหัสสัตว์เลี้ยง</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  blackBg: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000",
  },

  /* --- Overlay หน้ากากสีดำ --- */
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1,
  },
  darkTop: {
    height: 180, // 🟢 บังคับความสูงขอบบนคงที่
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  darkMiddleRow: {
    flexDirection: "row",
    height: SCAN_SIZE, // 🟢 บังคับความสูง 260
    width: "100%",
  },
  darkSide: {
    width: SIDE_WIDTH, // 🟢 บังคับความกว้างคำนวณซ้ายขวา
    height: SCAN_SIZE, 
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  scanBox: {
    width: SCAN_SIZE, // 🟢 บังคับกว้าง 260
    height: SCAN_SIZE, // 🟢 บังคับสูง 260
    backgroundColor: "transparent",
    position: "relative",
  },
  darkBottom: {
    flex: 1, // ปล่อยให้พื้นที่เหลือด้านล่างยืดเต็มจอไปเลย
    width: "100%",
    backgroundColor: "rgba(0,0,0,0.6)",
    alignItems: "center",
    paddingTop: 30,
  },

  /* --- มุมสีขาว 4 ด้าน --- */
  cornerTL: { position: "absolute", top: 0, left: 0, width: 40, height: 40, borderTopWidth: 4, borderLeftWidth: 4, borderColor: "#FFF", borderTopLeftRadius: 15 },
  cornerTR: { position: "absolute", top: 0, right: 0, width: 40, height: 40, borderTopWidth: 4, borderRightWidth: 4, borderColor: "#FFF", borderTopRightRadius: 15 },
  cornerBL: { position: "absolute", bottom: 0, left: 0, width: 40, height: 40, borderBottomWidth: 4, borderLeftWidth: 4, borderColor: "#FFF", borderBottomLeftRadius: 15 },
  cornerBR: { position: "absolute", bottom: 0, right: 0, width: 40, height: 40, borderBottomWidth: 4, borderRightWidth: 4, borderColor: "#FFF", borderBottomRightRadius: 15 },

  /* --- ข้อความกลางจอ --- */
  scanTitle: { color: "#FFF", fontSize: 20, fontWeight: "bold", marginBottom: 8 },
  scanSub: { color: "rgba(255,255,255,0.8)", fontSize: 13, fontWeight: "500" },

  /* --- การ์ดพิมพ์รหัส --- */
  keyboardContainer: {
    ...StyleSheet.absoluteFillObject, // ครอบทับลงไป
    zIndex: 2, // ให้อยู่เหนือหน้ากากสีดำ
    justifyContent: "flex-end", // ดันไปชิดขอบล่าง
    paddingHorizontal: 20,
    paddingBottom: 110, // เว้นที่ล่างให้ Tab Bar
  },
  card: {
    backgroundColor: "rgba(255, 255, 255, 0.98)",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#2C3E50",
    marginBottom: 16,
    textAlign: "center",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderWidth: 1,
    borderColor: "#D1C4E9",
    borderRadius: 12,
    height: 50,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 14, color: "#1A1A1A" },
  submitBtn: {
    backgroundColor: "#8FA3C8",
    height: 50,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  submitText: { color: "#FFF", fontWeight: "bold", fontSize: 15 },
});
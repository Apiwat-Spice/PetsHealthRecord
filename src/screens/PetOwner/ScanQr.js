import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  Alert,
  Dimensions,
  Linking
} from "react-native";
import { useState, useEffect } from "react";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { CameraView, useCameraPermissions } from "expo-camera";

const { width } = Dimensions.get("window");
const SCAN_SIZE = 260;
const SIDE_WIDTH = (width - SCAN_SIZE) / 2;

export default function ScanQR() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false); // ป้องกันการสแกนซ้ำรัวๆ

  useEffect(() => {
    if (!permission?.granted) {
      requestPermission();
    }
  }, [permission]);

  // ฟังก์ชันจัดการเมื่อสแกน QR Code สำเร็จ
  const handleBarcodeScanned = async ({ type, data }) => {
    if (scanned) return;
    setScanned(true);

    try {
      let targetUrl = data.trim();
      if (!targetUrl.startsWith("http://") && !targetUrl.startsWith("https://")) {
        targetUrl = `http://localhost:3001/guest/pet/${targetUrl}`;
      }

      const supported = await Linking.canOpenURL(targetUrl);
      if (supported) {
        await Linking.openURL(targetUrl);
      } else {
        Alert.alert("ไม่สามารถเปิดลิงก์ได้", `ข้อมูลใน QR Code: ${data}`);
      }
    } catch (error) {
      console.error("Open URL Error:", error);
      Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถเปิดเว็บเพจได้");
    } finally {
      // รีเซ็ตสถานะให้สามารถสแกนใหม่ได้หลังผ่านไป 3 วินาที
      setTimeout(() => setScanned(false), 3000);
    }
  };

  if (!permission) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {/* เลเยอร์กล้อง */}
      {permission.granted ? (
        <CameraView
          style={StyleSheet.absoluteFillObject}
          onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
          barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        />
      ) : (
        <View style={styles.blackBg} />
      )}

      {/* เลเยอร์ Overlay กรอบสแกน */}
      <View style={styles.overlayContainer} pointerEvents="none">
        <View style={styles.darkTop} />
        <View style={styles.darkMiddleRow}>
          <View style={styles.darkSide} />
          <View style={styles.scanBox}>
            <View style={styles.cornerTL} />
            <View style={styles.cornerTR} />
            <View style={styles.cornerBL} />
            <View style={styles.cornerBR} />
          </View>
          <View style={styles.darkSide} />
        </View>
        <View style={styles.darkBottom}>
          <MaterialCommunityIcons name="barcode-scan" size={32} color="#FFFFFF" style={{ marginBottom: 12 }} />
          <Text style={styles.scanTitle}>สแกน QR Code</Text>
          <Text style={styles.scanSub}>จัดให้อยู่ในกรอบเพื่อเปิดหน้าเว็บข้อมูลสัตว์เลี้ยง</Text>
        </View>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  blackBg: { ...StyleSheet.absoluteFillObject, backgroundColor: "#000" },

  overlayContainer: { ...StyleSheet.absoluteFillObject, zIndex: 1 },
  darkTop: { height: 180, width: "100%", backgroundColor: "rgba(0,0,0,0.6)" },
  darkMiddleRow: { flexDirection: "row", height: SCAN_SIZE, width: "100%" },
  darkSide: { width: SIDE_WIDTH, height: SCAN_SIZE, backgroundColor: "rgba(0,0,0,0.6)" },
  scanBox: { width: SCAN_SIZE, height: SCAN_SIZE, backgroundColor: "transparent", position: "relative" },
  darkBottom: { flex: 1, width: "100%", backgroundColor: "rgba(0,0,0,0.6)", alignItems: "center", paddingTop: 30 },

  cornerTL: { position: "absolute", top: 0, left: 0, width: 40, height: 40, borderTopWidth: 4, borderLeftWidth: 4, borderColor: "#FFF", borderTopLeftRadius: 15 },
  cornerTR: { position: "absolute", top: 0, right: 0, width: 40, height: 40, borderTopWidth: 4, borderRightWidth: 4, borderColor: "#FFF", borderTopRightRadius: 15 },
  cornerBL: { position: "absolute", bottom: 0, left: 0, width: 40, height: 40, borderBottomWidth: 4, borderLeftWidth: 4, borderColor: "#FFF", borderBottomLeftRadius: 15 },
  cornerBR: { position: "absolute", bottom: 0, right: 0, width: 40, height: 40, borderBottomWidth: 4, borderRightWidth: 4, borderColor: "#FFF", borderBottomRightRadius: 15 },

  scanTitle: { color: "#FFF", fontSize: 20, fontWeight: "bold", marginBottom: 8 },
  scanSub: { color: "rgba(255,255,255,0.8)", fontSize: 13, fontWeight: "500" },
});
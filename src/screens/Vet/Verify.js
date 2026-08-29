import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, Alert, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { API_URL } from '../../config';

export default function Verify({ vetProfile, verificationStatus, setVerificationStatus, verificationDetail }) {
  const [licenseFile, setLicenseFile] = useState(null);
  const [idCardFile, setIdCardFile] = useState(null);

  const handleSelectFile = async (docType) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets.length > 0) {
        const fileData = result.assets[0];
        if (docType === 'ใบอนุญาตวิชาชีพ') setLicenseFile(fileData);
        else if (docType === 'บัตรประจำตัว') setIdCardFile(fileData);
      }
    } catch (error) {
      console.log('Error selecting file:', error);
      Alert.alert("ข้อผิดพลาด", "ไม่สามารถเลือกไฟล์ได้");
    }
  };

  const handleSubmitDocuments = async () => {
    if (!licenseFile || !idCardFile) {
      Alert.alert("แจ้งเตือน", "กรุณาอัปโหลดเอกสารให้ครบทั้ง 2 รายการครับ");
      return;
    }

    try {
      const formData = new FormData();
      const licenseRes = await fetch(licenseFile.uri);
      const licenseBlob = await licenseRes.blob();
      formData.append('vet_license_pdf', licenseBlob, licenseFile.name || 'vet_license.pdf');

      const idCardRes = await fetch(idCardFile.uri);
      const idCardBlob = await idCardRes.blob();
      formData.append('vet_id_card_pdf', idCardBlob, idCardFile.name || 'vet_id_card.pdf');

      formData.append('vet_id', String(vetProfile.vet_id));

      const response = await fetch(`${API_URL}/upload-vet-license`, {
        method: 'POST',
        body: formData,
      });

      const responseText = await response.text();
      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        console.error("🚨 Backend Crash Report:\n", responseText);
        Alert.alert('Server Error', 'เซิร์ฟเวอร์ตอบกลับผิดพลาด กรุณาเช็ก Terminal ของ Backend');
        return;
      }

      if (response.ok) {
        Alert.alert('ส่งเอกสารสำเร็จ!', 'ระบบได้รับเอกสารของคุณแล้ว โปรดรอผู้ดูแลระบบตรวจสอบครับ');
        setVerificationStatus('pending');
      } else {
        Alert.alert('เกิดข้อผิดพลาดจากเซิร์ฟเวอร์', result.message || 'อัปโหลดไม่สำเร็จ');
      }
    } catch (error) {
      console.error("Upload error details:", error);
      Alert.alert('การเชื่อมต่อขัดข้อง', error.message || 'เกิดปัญหาในการแพ็คไฟล์หรือเชื่อมต่อเซิร์ฟเวอร์');
    }
  };

  if (verificationStatus === 'pass') {
    return (
      <View style={styles.verifiedBox}>
        <MaterialCommunityIcons name="shield-check" size={42} color="#00C853" style={{ marginRight: 16 }} />
        <View style={{ flex: 1 }}>
          <Text style={styles.verifiedTitle}>ยืนยันตัวตนแล้ว</Text>
          <Text style={styles.verifiedDesc}>เอกสารของคุณผ่านการตรวจสอบเรียบร้อยแล้ว สามารถเข้าใช้งานได้ทุกฟังก์ชัน</Text>
        </View>
      </View>
    );
  }

  // สถานะรอแอดมินตรวจ
  if (verificationStatus === 'pending') {
    return (
      <View style={styles.pendingBox}>
        <MaterialCommunityIcons name="clock-outline" size={42} color="#EF6C00" style={{ marginRight: 16 }} />
        <View style={{ flex: 1 }}>
          <Text style={styles.pendingTitle}>กำลังตรวจสอบเอกสาร...</Text>
          <Text style={styles.pendingDesc}>เอกสารของคุณถูกส่งเข้าระบบแล้ว แอดมินจะทำการตรวจสอบและอัปเดตสถานะให้ทราบในภายหลัง</Text>
        </View>
      </View>
    );
  }

  // ไม่ผ่าน (notpass) เผื่อแอดมินตีกลับ
  if (verificationStatus === 'notpass') {
    return (
      <View style={[styles.pendingBox, { backgroundColor: '#FFEBEE', borderColor: '#FFCDD2', flexDirection: 'column', alignItems: 'flex-start' }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <MaterialCommunityIcons name="close-circle-outline" size={42} color="#D32F2F" style={{ marginRight: 16 }} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.pendingTitle, { color: '#C62828' }]}>การตรวจสอบไม่ผ่าน</Text>
            <Text style={[styles.pendingDesc, { color: '#D32F2F' }]}>เอกสารของคุณอาจไม่ชัดเจนหรือไม่ถูกต้อง กรุณาแก้ไขและส่งเอกสารใหม่อีกครั้ง</Text>
          </View>
        </View>

        {/* 🟢 แสดงเหตุผล (Detail) จากแอดมินตรงนี้ */}
        <View style={{ backgroundColor: '#FFF', padding: 12, borderRadius: 8, marginTop: 12, width: '100%', borderWidth: 1, borderColor: '#FFCDD2' }}>
          <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#C62828', marginBottom: 4 }}>หมายเหตุจากแอดมิน:</Text>
          <Text style={{ fontSize: 13, color: '#333' }}>
            {verificationDetail ? verificationDetail : "ไม่ได้ระบุเหตุผล กรุณาติดต่อแอดมิน"}
          </Text>
        </View>

        {/* ปุ่มให้กดอัปโหลดใหม่ */}
        <TouchableOpacity
          style={{ marginTop: 16, alignSelf: 'flex-start', paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#D32F2F', borderRadius: 8 }}
          onPress={() => setVerificationStatus('unsubmitted')} // เปลี่ยนกลับไปหน้าอัปโหลด
        >
          <Text style={{ color: '#FFF', fontWeight: 'bold' }}>ส่งเอกสารใหม่</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.uploadDocContainer}>
      <Text style={styles.sectionHeading}>อัปโหลดเอกสารยืนยันตัวตน</Text>
      <Text style={styles.infoSubText}>กรุณาอัปโหลดเอกสารรูปแบบ PDF, JPG หรือ PNG ให้ครบถ้วน เพื่อให้แอดมินตรวจสอบก่อนเข้าใช้งานฟังก์ชันต่างๆ</Text>

      <Text style={styles.inputLabel}>ใบอนุญาตประกอบวิชาชีพการสัตวแพทย์</Text>
      <View style={styles.uploadRow}>
        <TextInput style={[styles.uploadInput, licenseFile && { color: '#00C853', fontWeight: 'bold' }]} placeholder="ยังไม่ได้เลือกไฟล์" value={licenseFile ? licenseFile.name : ''} editable={false} />
        <TouchableOpacity style={[styles.uploadBtn, { backgroundColor: '#00C853' }]} onPress={() => handleSelectFile('ใบอนุญาตวิชาชีพ')}>
          <Text style={styles.uploadBtnText}>เลือกไฟล์</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.inputLabel}>บัตรประจำตัวสัตวแพทย์</Text>
      <View style={styles.uploadRow}>
        <TextInput style={[styles.uploadInput, idCardFile && { color: '#00C853', fontWeight: 'bold' }]} placeholder="ยังไม่ได้เลือกไฟล์" value={idCardFile ? idCardFile.name : ''} editable={false} />
        <TouchableOpacity style={[styles.uploadBtn, { backgroundColor: '#00C853' }]} onPress={() => handleSelectFile('บัตรประจำตัว')}>
          <Text style={styles.uploadBtnText}>เลือกไฟล์</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={[styles.submitFormButton, { backgroundColor: '#00C853' }]} onPress={handleSubmitDocuments}>
        <Text style={styles.submitFormText}>ส่งเอกสารให้ตรวจสอบ</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  sectionHeading: { fontSize: 14, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 10 },
  infoSubText: { fontSize: 11, color: '#999', marginBottom: 12 },
  inputLabel: { fontSize: 12, fontWeight: 'bold', color: '#333', marginTop: 12, marginBottom: 6 },
  uploadDocContainer: { backgroundColor: '#FFF', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#EAEAEC' },
  uploadRow: { flexDirection: 'row', alignItems: 'center' },
  uploadInput: { flex: 1, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#D1C4E9', borderRightWidth: 0, borderTopLeftRadius: 8, borderBottomLeftRadius: 8, height: 42, paddingHorizontal: 12, fontSize: 13, color: '#888' },
  uploadBtn: { backgroundColor: '#9C64A6', height: 42, paddingHorizontal: 16, justifyContent: 'center', borderTopRightRadius: 8, borderBottomRightRadius: 8 },
  uploadBtnText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  submitFormButton: { backgroundColor: '#9C64A6', alignSelf: 'flex-end', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8, marginTop: 24 },
  submitFormText: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },
  pendingBox: { flexDirection: 'row', backgroundColor: '#FFF8E1', borderWidth: 1, borderColor: '#FFE082', borderRadius: 12, padding: 20, alignItems: 'center', marginTop: 10 },
  pendingTitle: { color: '#EF6C00', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  pendingDesc: { color: '#F57C00', fontSize: 12 },
  verifiedBox: { flexDirection: 'row', backgroundColor: '#E8F5E9', borderWidth: 1, borderColor: '#A5D6A7', borderRadius: 12, padding: 20, alignItems: 'center', marginTop: 10 },
  verifiedTitle: { color: '#00C853', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  verifiedDesc: { color: '#4CAF50', fontSize: 12 },
});
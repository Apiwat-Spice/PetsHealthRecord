import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, Alert, Image } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import ImageView from "react-native-image-viewing";
import { API_URL } from '../../config';

export default function Verify({ vetProfile, verificationStatus, setVerificationStatus, verificationDetail, submittedDocs }) {
  const [isSelecting, setIsSelecting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [fullScreenImage, setFullScreenImage] = useState(null);

  // Form States
  const [vetClass, setVetClass] = useState('1'); // สัตวแพทย์ชั้น 1 หรือ 2
  const [licenseFile, setLicenseFile] = useState(null);
  const [idCardFile, setIdCardFile] = useState(null);
  const [licenseExpiry, setLicenseExpiry] = useState(null);
  const [idCardExpiry, setIdCardExpiry] = useState(null);
  const [pickerConfig, setPickerConfig] = useState({ visible: false, target: '' });

  const handleSelectFile = async (docType) => {
    if (isSelecting) return;
    try {
      setIsSelecting(true);
      const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf', copyToCacheDirectory: true });
      if (!result.canceled && result.assets.length > 0) {
        const fileData = result.assets[0];
        if (!fileData.name.toLowerCase().endsWith('.pdf') && fileData.mimeType !== 'application/pdf') {
          Alert.alert("ไฟล์ไม่ถูกต้อง", "กรุณาอัปโหลดเฉพาะไฟล์ PDF เท่านั้นครับ");
          return;
        }
        if (docType === 'license') setLicenseFile(fileData);
        else if (docType === 'idcard') setIdCardFile(fileData);
      }
    } catch (error) {
      Alert.alert("ข้อผิดพลาด", "ไม่สามารถเลือกไฟล์ได้");
    } finally {
      setTimeout(() => setIsSelecting(false), 500);
    }
  };

  const handlePickerChange = (event, selectedValue) => {
    const { target } = pickerConfig;
    setPickerConfig({ visible: false, target: '' });
    if (event.type === 'set' && selectedValue) {
      if (target === 'license') setLicenseExpiry(selectedValue);
      else if (target === 'idcard') setIdCardExpiry(selectedValue);
    }
  };

  const formatDate = (date) => {
    if (!date) return "ไม่ระบุ";
    const d = new Date(date);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  };

  const getDbFormattedDate = (date) => {
    if (!date) return null;
    const d = new Date(date);
    return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
  };

  const handleSubmitVerification = async () => {
    if (!licenseFile || !idCardFile) {
      Alert.alert("แจ้งเตือน", "กรุณาแนบไฟล์เอกสารให้ครบถ้วน");
      return;
    }
    if (!licenseExpiry || !idCardExpiry) {
      Alert.alert("แจ้งเตือน", "กรุณาระบุวันที่หมดอายุของเอกสารให้ครบถ้วน");
      return;
    }

    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append('vet_id', String(vetProfile.vet_id || ''));
      formData.append('vet_class', vetClass);
      formData.append('vet_license_expired', getDbFormattedDate(licenseExpiry));
      formData.append('vet_id_card_expired', getDbFormattedDate(idCardExpiry));

      const licenseRes = await fetch(licenseFile.uri);
      const licenseBlob = await licenseRes.blob();
      formData.append('vet_license_pdf', licenseBlob, licenseFile.name || 'license.pdf');

      const idCardRes = await fetch(idCardFile.uri);
      const idCardBlob = await idCardRes.blob();
      formData.append('vet_id_card_pdf', idCardBlob, idCardFile.name || 'idcard.pdf');

      const response = await fetch(`${API_URL}/upload-vet-license`, { method: 'POST', body: formData });
      const responseText = await response.text();
      let result;
      try { result = JSON.parse(responseText); } catch (e) {
        Alert.alert('Server Error', 'เซิร์ฟเวอร์ตอบกลับผิดพลาด');
        return;
      }

      if (response.ok) {
        setVerificationStatus('pending');
        Alert.alert('สำเร็จ', 'ส่งเอกสารยืนยันตัวตนเรียบร้อยแล้ว');
      } else {
        Alert.alert('เกิดข้อผิดพลาด', result.message || 'ไม่สามารถส่งเอกสารได้');
      }
    } catch (error) {
      Alert.alert('การเชื่อมต่อขัดข้อง', 'เกิดปัญหาในการแพ็คไฟล์ หรือเซิร์ฟเวอร์ไม่ตอบสนอง');
    } finally {
      setIsLoading(false);
    }
  };

  //  แสดงรายละเอียดเอกสารแบบ Inline (ไม่ต้องกดปุ่มดูประวัติ)
  const renderSubmittedDocs = () => {
    if (!submittedDocs) return null;

    return (
      <View style={styles.submittedInfoContainer}>
        <Text style={styles.inlineSectionHeading}>ข้อมูลเอกสารที่ส่งตรวจสอบ</Text>

        <View style={styles.historyItem}>
          <Text style={styles.historyLabel}>1. ใบอนุญาตประกอบวิชาชีพการสัตวแพทย์</Text>
          <Text style={styles.historySubText}>สัตวแพทย์ชั้น: {submittedDocs.vet_class || '-'}  |  หมดอายุ: {formatDate(submittedDocs.vet_license_expired)}</Text>
          {submittedDocs.vet_license_pdf_url ? (
            <TouchableOpacity onPress={() => setFullScreenImage(submittedDocs.vet_license_pdf_url)}>
              <Image source={{ uri: submittedDocs.vet_license_pdf_url }} style={styles.previewImage} resizeMode="cover" />
              <View style={styles.previewOverlay}><Feather name="zoom-in" size={20} color="#FFF" /><Text style={styles.previewText}>ดูรูปเต็ม</Text></View>
            </TouchableOpacity>
          ) : <Text style={styles.noDocText}>ไม่พบไฟล์เอกสาร</Text>}
        </View>

        <View style={[styles.historyItem, { borderBottomWidth: 0, paddingBottom: 0 }]}>
          <Text style={styles.historyLabel}>2. บัตรประจำตัวประชาชน / บัตรเจ้าหน้าที่รัฐ</Text>
          <Text style={styles.historySubText}>หมดอายุ: {formatDate(submittedDocs.vet_id_card_expired)}</Text>
          {submittedDocs.vet_id_card_pdf_url ? (
            <TouchableOpacity onPress={() => setFullScreenImage(submittedDocs.vet_id_card_pdf_url)}>
              <Image source={{ uri: submittedDocs.vet_id_card_pdf_url }} style={styles.previewImage} resizeMode="cover" />
              <View style={styles.previewOverlay}><Feather name="zoom-in" size={20} color="#FFF" /><Text style={styles.previewText}>ดูรูปเต็ม</Text></View>
            </TouchableOpacity>
          ) : <Text style={styles.noDocText}>ไม่พบไฟล์เอกสาร</Text>}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/*  สถานะ: ผ่านแล้ว */}
      {verificationStatus === 'pass' && (
        <View>
          <View style={styles.verifiedBox}>
            <MaterialCommunityIcons name="shield-check" size={42} color="#00C853" style={{ marginRight: 16 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.verifiedTitle}>ยืนยันตัวตนเรียบร้อย</Text>
              <Text style={styles.verifiedDesc}>เอกสารผ่านการตรวจสอบ สามารถเข้าใช้งานได้ทุกฟังก์ชัน</Text>
            </View>
          </View>
          {renderSubmittedDocs()}
        </View>
      )}

      {/*  สถานะ: รอตรวจสอบ */}
      {verificationStatus === 'pending' && (
        <View>
          <View style={styles.pendingBox}>
            <MaterialCommunityIcons name="clock-outline" size={42} color="#EF6C00" style={{ marginRight: 16 }} />
            <View style={{ flex: 1 }}>
              <Text style={styles.pendingTitle}>กำลังตรวจสอบเอกสาร...</Text>
              <Text style={styles.pendingDesc}>เอกสารถูกส่งเข้าระบบแล้ว แอดมินจะตรวจสอบและแจ้งให้ทราบภายหลัง</Text>
            </View>
          </View>
          {renderSubmittedDocs()}
        </View>
      )}

      {/*  สถานะ: ไม่ผ่าน */}
      {verificationStatus === 'notpass' && (
        <View>
          <View style={[styles.pendingBox, { backgroundColor: '#FFEBEE', borderColor: '#FFCDD2', flexDirection: 'column', alignItems: 'flex-start' }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MaterialCommunityIcons name="close-circle-outline" size={42} color="#D32F2F" style={{ marginRight: 16 }} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.pendingTitle, { color: '#C62828' }]}>การตรวจสอบไม่ผ่าน</Text>
                <Text style={[styles.pendingDesc, { color: '#D32F2F' }]}>เอกสารของคุณไม่ชัดเจนหรือไม่ถูกต้อง กรุณาตรวจสอบแล้วส่งใหม่</Text>
              </View>
            </View>
            <View style={styles.detailBox}>
              <Text style={styles.detailLabel}>หมายเหตุจากแอดมิน:</Text>
              <Text style={styles.detailText}>{verificationDetail || "ไม่ได้ระบุเหตุผล"}</Text>
            </View>
            <TouchableOpacity style={styles.reSubmitBtn} onPress={() => setVerificationStatus('unsubmitted')}>
              <Text style={{ color: '#FFF', fontWeight: 'bold' }}>ส่งเอกสารใหม่</Text>
            </TouchableOpacity>
          </View>
          {renderSubmittedDocs()}
        </View>
      )}

      {/*  สถานะ: ยังไม่ได้ส่ง (โชว์ฟอร์ม) */}
      {verificationStatus === 'unsubmitted' && (
        <View style={styles.formContainer}>
          <Text style={styles.sectionHeading}>ส่งเอกสารยืนยันตัวตนสัตวแพทย์</Text>
          <View style={styles.warningBox}>
            <Text style={styles.warningText}>การยืนยันตัวตน</Text>
            <Text style={styles.warningSubText}>เพื่อความปลอดภัย โปรดอัปโหลดเอกสารที่เป็นความจริงเท่านั้น</Text>
          </View>

          <Text style={styles.inputLabel}>ระดับชั้นสัตวแพทย์</Text>
          <View style={styles.classRow}>
            <TouchableOpacity
              style={[styles.classBtn, vetClass === '1' ? styles.classBtnActive : null]}
              onPress={() => setVetClass('1')}
            >
              <Text style={[styles.classBtnText, vetClass === '1' ? styles.classBtnTextActive : null]}>ชั้น 1</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.classBtn, vetClass === '2' ? styles.classBtnActive : null]}
              onPress={() => setVetClass('2')}
            >
              <Text style={[styles.classBtnText, vetClass === '2' ? styles.classBtnTextActive : null]}>ชั้น 2</Text>
            </TouchableOpacity>
          </View>

          {/* อัปโหลดใบประกอบวิชาชีพ */}
          <View style={styles.docSection}>
            <Text style={styles.inputLabel}>ใบอนุญาตประกอบวิชาชีพการสัตวแพทย์</Text>
            <Text style={styles.subLabel}>วันที่หมดอายุ</Text>
            <TouchableOpacity style={styles.datePickerBtn} onPress={() => setPickerConfig({ visible: true, target: 'license' })}>
              <Feather name="calendar" size={16} color="#666" style={{ marginRight: 8 }} />
              <Text style={licenseExpiry ? styles.dateTextSelected : styles.dateTextPlaceholder}>{formatDate(licenseExpiry)}</Text>
            </TouchableOpacity>
            <Text style={styles.subLabel}>ไฟล์เอกสาร (PDF)</Text>
            <View style={styles.uploadRow}>
              <TextInput style={[styles.uploadInput, licenseFile && { color: '#00B862', fontWeight: 'bold' }]} placeholder="ยังไม่ได้เลือกไฟล์" value={licenseFile ? licenseFile.name : ''} editable={false} />
              <TouchableOpacity style={[styles.uploadBtn, { backgroundColor: isSelecting ? '#999' : '#00B862' }]} onPress={() => handleSelectFile('license')} disabled={isSelecting}>
                <Text style={styles.uploadBtnText}>{isSelecting ? 'รอสักครู่...' : 'เลือกไฟล์'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* อัปโหลดบัตรประชาชน */}
          <View style={styles.docSection}>
            <Text style={styles.inputLabel}>บัตรประจำตัวประชาชน / บัตรเจ้าหน้าที่รัฐ</Text>
            <Text style={styles.subLabel}>วันที่หมดอายุ</Text>
            <TouchableOpacity style={styles.datePickerBtn} onPress={() => setPickerConfig({ visible: true, target: 'idcard' })}>
              <Feather name="calendar" size={16} color="#666" style={{ marginRight: 8 }} />
              <Text style={idCardExpiry ? styles.dateTextSelected : styles.dateTextPlaceholder}>{formatDate(idCardExpiry)}</Text>
            </TouchableOpacity>
            <Text style={styles.subLabel}>ไฟล์เอกสาร (PDF)</Text>
            <View style={styles.uploadRow}>
              <TextInput style={[styles.uploadInput, idCardFile && { color: '#00B862', fontWeight: 'bold' }]} placeholder="ยังไม่ได้เลือกไฟล์" value={idCardFile ? idCardFile.name : ''} editable={false} />
              <TouchableOpacity style={[styles.uploadBtn, { backgroundColor: isSelecting ? '#999' : '#00B862' }]} onPress={() => handleSelectFile('idcard')} disabled={isSelecting}>
                <Text style={styles.uploadBtnText}>{isSelecting ? 'รอสักครู่...' : 'เลือกไฟล์'}</Text>
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity style={[styles.submitFormButton, { backgroundColor: isLoading ? '#999' : '#00B862' }]} onPress={handleSubmitVerification} disabled={isLoading}>
            <Text style={styles.submitFormText}>{isLoading ? "กำลังอัปโหลดเอกสาร..." : "ส่งเอกสารยืนยันตัวตน"}</Text>
          </TouchableOpacity>
        </View>
      )}

      {pickerConfig.visible && (
        <DateTimePicker
          value={pickerConfig.target === 'license' ? (licenseExpiry || new Date()) : (idCardExpiry || new Date())}
          mode="date"
          display="default"
          minimumDate={new Date()}
          onChange={handlePickerChange}
        />
      )}

      {/* แสดงภาพเต็มจอ */}
      <ImageView
        images={fullScreenImage ? [{ uri: fullScreenImage }] : []}
        imageIndex={0}
        visible={!!fullScreenImage}
        onRequestClose={() => setFullScreenImage(null)}
        swipeToCloseEnabled={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 20 },
  sectionHeading: { fontSize: 14, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 10 },
  warningBox: { backgroundColor: '#E3F2FD', padding: 12, borderRadius: 8, marginBottom: 16 },
  warningText: { color: '#1565C0', fontSize: 13, fontWeight: 'bold', textAlign: 'center' },
  warningSubText: { color: '#1565C0', fontSize: 11, textAlign: 'center', marginTop: 2 },
  formContainer: { marginTop: 10 },

  inputLabel: { fontSize: 13, fontWeight: 'bold', color: '#333', marginTop: 12, marginBottom: 6 },
  subLabel: { fontSize: 12, color: '#555', marginBottom: 6, fontWeight: '500' },

  // Vet Class Row
  classRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  classBtn: { flex: 0.48, height: 42, borderRadius: 8, borderWidth: 1, borderColor: '#D1C4E9', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF' },
  classBtnActive: { backgroundColor: '#E8F5E9', borderColor: '#00C853', borderWidth: 2 },
  classBtnText: { color: '#666', fontWeight: 'bold', fontSize: 13 },
  classBtnTextActive: { color: '#00C853' },

  datePickerBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderWidth: 1, borderColor: '#D1C4E9', borderRadius: 8, height: 42, paddingHorizontal: 12, marginBottom: 12 },
  dateTextPlaceholder: { color: '#999', fontSize: 13 },
  dateTextSelected: { color: '#333', fontSize: 13, fontWeight: 'bold' },
  docSection: { marginTop: 12, backgroundColor: '#FAFAFA', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#F0F0F0' },

  uploadRow: { flexDirection: 'row', alignItems: 'center' },
  uploadInput: { flex: 1, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#D1C4E9', borderRightWidth: 0, borderTopLeftRadius: 8, borderBottomLeftRadius: 8, height: 42, paddingHorizontal: 12, fontSize: 13, color: '#888' },
  uploadBtn: { height: 42, paddingHorizontal: 16, justifyContent: 'center', borderTopRightRadius: 8, borderBottomRightRadius: 8 },
  uploadBtnText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  submitFormButton: { alignItems: 'center', paddingVertical: 14, borderRadius: 8, marginTop: 24, width: '100%' },
  submitFormText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },

  // Status Boxes
  pendingBox: { flexDirection: 'row', backgroundColor: '#FFF8E1', borderWidth: 1, borderColor: '#FFE082', borderRadius: 12, padding: 20, alignItems: 'center', marginTop: 10 },
  pendingTitle: { color: '#EF6C00', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  pendingDesc: { color: '#F57C00', fontSize: 12 },
  verifiedBox: { flexDirection: 'row', backgroundColor: '#E8F5E9', borderWidth: 1, borderColor: '#A5D6A7', borderRadius: 12, padding: 20, alignItems: 'center', marginTop: 10 },
  verifiedTitle: { color: '#00C853', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  verifiedDesc: { color: '#4CAF50', fontSize: 12 },
  detailBox: { backgroundColor: '#FFF', padding: 12, borderRadius: 8, marginTop: 12, width: '100%', borderWidth: 1, borderColor: '#FFCDD2' },
  detailLabel: { fontSize: 12, fontWeight: 'bold', color: '#C62828', marginBottom: 4 },
  detailText: { fontSize: 13, color: '#333' },
  reSubmitBtn: { marginTop: 16, alignSelf: 'flex-start', paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#D32F2F', borderRadius: 8 },

  // Inline Preview
  submittedInfoContainer: { marginTop: 16, padding: 16, backgroundColor: '#FFF', borderRadius: 12, borderWidth: 1, borderColor: '#EAEAEC' },
  inlineSectionHeading: { fontSize: 14, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 16, textAlign: 'center' },
  historyItem: { marginBottom: 20, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  historyLabel: { fontSize: 13, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 4 },
  historySubText: { fontSize: 12, color: '#666', marginBottom: 10 },
  previewImage: { width: '100%', height: 160, borderRadius: 8, borderWidth: 1, borderColor: '#EAEAEC', backgroundColor: '#F0F0F0' },
  previewOverlay: { position: 'absolute', bottom: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, flexDirection: 'row', alignItems: 'center' },
  previewText: { color: '#FFF', fontSize: 12, marginLeft: 6, fontWeight: 'bold' },
  noDocText: { fontSize: 13, color: '#999', fontStyle: 'italic', marginTop: 8 },
});
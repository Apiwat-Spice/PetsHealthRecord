import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, Alert, ScrollView, Modal, Linking, Image } from 'react-native';
import { MaterialCommunityIcons, Feather } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { API_URL } from '../../config';
import ImageView from "react-native-image-viewing";

export default function Verify({ vetProfile, verificationStatus, setVerificationStatus, verificationDetail, submittedDocs }) {
  const [licenseFile, setLicenseFile] = useState(null);
  const [idCardFile, setIdCardFile] = useState(null);

  const [licenseExpiryDate, setLicenseExpiryDate] = useState(null);
  const [idCardExpiryDate, setIdCardExpiryDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState({ visible: false, type: '' });
  const [vetClass, setVetClass] = useState("1");
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // 🟢 State สำหรับจัดการการแสดงรูปภาพแบบเต็มจอ
  const [fullScreenImage, setFullScreenImage] = useState(null);

  const handleSelectFile = async (docType) => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets.length > 0) {
        const fileData = result.assets[0];
        if (!fileData.name.toLowerCase().endsWith('.pdf') && fileData.mimeType !== 'application/pdf') {
          Alert.alert("ไฟล์ไม่ถูกต้อง", "กรุณาอัปโหลดเฉพาะไฟล์ PDF เท่านั้นครับ");
          return;
        }

        if (docType === 'ใบอนุญาตวิชาชีพ') setLicenseFile(fileData);
        else if (docType === 'บัตรประจำตัว') setIdCardFile(fileData);
      }
    } catch (error) {
      console.log('Error selecting file:', error);
      Alert.alert("ข้อผิดพลาด", "ไม่สามารถเลือกไฟล์ได้");
    }
  };

  const handleDateChange = (event, selectedDate) => {
    const { type } = showDatePicker;
    setShowDatePicker({ visible: false, type: '' });
    if (event.type === 'set' && selectedDate) {
      if (type === 'license') setLicenseExpiryDate(selectedDate);
      else if (type === 'idCard') setIdCardExpiryDate(selectedDate);
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

  const handleSubmitDocuments = async () => {
    if (!licenseFile || !idCardFile) {
      Alert.alert("แจ้งเตือน", "กรุณาอัปโหลดเอกสารให้ครบทั้ง 2 รายการครับ");
      return;
    }
    if (!licenseExpiryDate || !idCardExpiryDate) {
      Alert.alert("แจ้งเตือน", "กรุณาระบุวันที่หมดอายุของเอกสารให้ครบถ้วน");
      return;
    }
    if (!vetClass) {
      Alert.alert("แจ้งเตือน", "กรุณาเลือกระดับชั้นของสัตวแพทย์");
      return;
    }

    try {
      setIsLoading(true);
      const formData = new FormData();
      const licenseRes = await fetch(licenseFile.uri);
      const licenseBlob = await licenseRes.blob();
      formData.append('vet_license_pdf', licenseBlob, licenseFile.name || 'vet_license.pdf');

      const idCardRes = await fetch(idCardFile.uri);
      const idCardBlob = await idCardRes.blob();
      formData.append('vet_id_card_pdf', idCardBlob, idCardFile.name || 'vet_id_card.pdf');

      formData.append('vet_id', String(vetProfile.vet_id));
      formData.append('vet_license_expired', getDbFormattedDate(licenseExpiryDate));
      formData.append('vet_id_card_expired', getDbFormattedDate(idCardExpiryDate));
      formData.append('vet_class', vetClass);

      const response = await fetch(`${API_URL}/upload-vet-license`, {
        method: 'POST',
        body: formData,
      });

      const responseText = await response.text();
      let result;
      try { result = JSON.parse(responseText); } catch (e) {
        Alert.alert('Server Error', 'เซิร์ฟเวอร์ตอบกลับผิดพลาด');
        return;
      }

      if (response.ok) {
        Alert.alert('ส่งเอกสารสำเร็จ!', 'ระบบได้รับเอกสารของคุณแล้ว โปรดรอตรวจสอบครับ');
        setVerificationStatus('pending');
      } else {
        Alert.alert('เกิดข้อผิดพลาดจากเซิร์ฟเวอร์', result.message || 'อัปโหลดไม่สำเร็จ');
      }
    } catch (error) {
      Alert.alert('การเชื่อมต่อขัดข้อง', error.message);
    } finally {
      setIsLoading(false);
    }
  };



  // Component ประวัติการส่งเอกสาร
  const HistoryModal = () => (
    <Modal visible={showHistoryModal} transparent={true} animationType="fade">
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>ข้อมูลที่ส่งตรวจสอบล่าสุด</Text>
            <TouchableOpacity onPress={() => setShowHistoryModal(false)}>
              <Feather name="x" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {verificationDetail && (
              <View style={[styles.detailBox, { marginTop: 0, marginBottom: 16 }]}>
                <Text style={styles.detailLabel}>หมายเหตุจากแอดมิน:</Text>
                <Text style={styles.detailText}>{verificationDetail}</Text>
              </View>
            )}

            <View style={styles.historyItem}>
              <Text style={styles.historyLabel}>ระดับชั้นของสัตวแพทย์</Text>
              <Text style={styles.historySubText}>
                {submittedDocs?.vet_class === 1 || vetProfile?.vet_class === 1 ? 'สัตวแพทย์ชั้น 1 (ปริญญาตรีขึ้นไป)'
                  : submittedDocs?.vet_class === 2 || vetProfile?.vet_class === 2 ? 'สัตวแพทย์ชั้น 2 (ประกาศนียบัตร)'
                    : 'ไม่ระบุ'}
              </Text>
            </View>

            <View style={styles.historyItem}>
              <Text style={styles.historyLabel}>1. ใบอนุญาตประกอบวิชาชีพ</Text>
              <Text style={styles.historySubText}>หมดอายุ: {formatDate(submittedDocs?.vet_license_expired)}</Text>

              {/* 🟢 ส่วนแสดง Preview รูปภาพ แทนที่ปุ่มกดเดิม */}
              {submittedDocs?.vet_license_pdf_url ? (
                <TouchableOpacity onPress={() => setFullScreenImage(submittedDocs.vet_license_pdf_url)}>
                  <Image
                    source={{ uri: submittedDocs.vet_license_pdf_url }}
                    style={styles.previewImage}
                    resizeMode="cover"
                  />
                  <View style={styles.previewOverlay}>
                    <Feather name="zoom-in" size={20} color="#FFF" />
                    <Text style={styles.previewText}>กดเพื่อดูรูปเต็ม</Text>
                  </View>
                </TouchableOpacity>
              ) : (
                <Text style={styles.noDocText}>ไม่พบไฟล์เอกสาร</Text>
              )}
            </View>

            <View style={[styles.historyItem, { borderBottomWidth: 0, paddingBottom: 0 }]}>
              <Text style={styles.historyLabel}>2. บัตรประจำตัวสัตวแพทย์</Text>
              <Text style={styles.historySubText}>หมดอายุ: {formatDate(submittedDocs?.vet_id_card_expired)}</Text>

              {/* 🟢 ส่วนแสดง Preview รูปภาพ */}
              {submittedDocs?.vet_id_card_pdf_url ? (
                <TouchableOpacity onPress={() => setFullScreenImage(submittedDocs.vet_id_card_pdf_url)}>
                  <Image
                    source={{ uri: submittedDocs.vet_id_card_pdf_url }}
                    style={styles.previewImage}
                    resizeMode="cover"
                  />
                  <View style={styles.previewOverlay}>
                    <Feather name="zoom-in" size={20} color="#FFF" />
                    <Text style={styles.previewText}>กดเพื่อดูรูปเต็ม</Text>
                  </View>
                </TouchableOpacity>
              ) : (
                <Text style={styles.noDocText}>ไม่พบไฟล์เอกสาร</Text>
              )}
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );

  // สถานะ ผ่านแล้ว
  if (verificationStatus === 'pass') {
    return (
      <View style={[styles.verifiedBox, { flexDirection: 'column', alignItems: 'flex-start' }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <MaterialCommunityIcons name="shield-check" size={42} color="#00C853" style={{ marginRight: 16 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.verifiedTitle}>ยืนยันตัวตนเรียบร้อย</Text>
            <Text style={styles.verifiedDesc}>เอกสารผ่านการตรวจสอบ สามารถเข้าใช้งานได้ทุกฟังก์ชัน</Text>
          </View>
        </View>

        <TouchableOpacity style={[styles.historyBtnOutline, { borderColor: '#00C853', marginTop: 16, width: '100%' }]} onPress={() => setShowHistoryModal(true)}>
          <Text style={[styles.historyBtnTextOutline, { color: '#00C853', textAlign: 'center' }]}>ดูข้อมูลและเอกสารที่ใช้ยืนยันตัวตน</Text>
        </TouchableOpacity>
        <HistoryModal />

        {/* 🟢 นำ ImageView มาแทนที่ ImageViewer */}
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

  // สถานะรอตรวจ
  if (verificationStatus === 'pending') {
    return (
      <View style={[styles.pendingBox, { flexDirection: 'column', alignItems: 'flex-start' }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <MaterialCommunityIcons name="clock-outline" size={42} color="#EF6C00" style={{ marginRight: 16 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.pendingTitle}>กำลังตรวจสอบเอกสาร...</Text>
            <Text style={styles.pendingDesc}>เอกสารถูกส่งเข้าระบบแล้ว แอดมินจะตรวจสอบและแจ้งให้ทราบภายหลัง</Text>
          </View>
        </View>
        <TouchableOpacity style={[styles.historyBtnOutline, { borderColor: '#EF6C00', marginTop: 16, width: '100%', backgroundColor: '#FFF' }]} onPress={() => setShowHistoryModal(true)}>
          <Text style={[styles.historyBtnTextOutline, { color: '#EF6C00', textAlign: 'center' }]}>ตรวจสอบข้อมูลที่ส่งไป</Text>
        </TouchableOpacity>
        <HistoryModal />

        {/* 🟢 นำ ImageView มาแทนที่ ImageViewer */}
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

  // สถานะไม่ผ่าน
  if (verificationStatus === 'notpass') {
    return (
      <View style={[styles.pendingBox, { backgroundColor: '#FFEBEE', borderColor: '#FFCDD2', flexDirection: 'column', alignItems: 'flex-start' }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <MaterialCommunityIcons name="close-circle-outline" size={42} color="#D32F2F" style={{ marginRight: 16 }} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.pendingTitle, { color: '#C62828' }]}>การตรวจสอบไม่ผ่าน</Text>
            <Text style={[styles.pendingDesc, { color: '#D32F2F' }]}>เอกสารของคุณไม่ชัดเจนหรือไม่ถูกต้อง กรุณาดูหมายเหตุแล้วส่งใหม่</Text>
          </View>
        </View>
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.reSubmitBtn} onPress={() => setVerificationStatus('unsubmitted')}>
            <Text style={styles.reSubmitText}>กรอกฟอร์มส่งใหม่</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.historyBtnOutline} onPress={() => setShowHistoryModal(true)}>
            <Text style={styles.historyBtnTextOutline}>ดูข้อมูลที่ผิดพลาด</Text>
          </TouchableOpacity>
        </View>
        <HistoryModal />

        {/* 🟢 นำ ImageView มาแทนที่ ImageViewer */}
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

  return (
    <ScrollView style={styles.uploadDocContainer} showsVerticalScrollIndicator={false}>
      <Text style={styles.sectionHeading}>อัปโหลดเอกสารยืนยันตัวตน</Text>
      <Text style={styles.infoSubText}>กรุณาอัปโหลดเอกสารรูปแบบ PDF เท่านั้น พร้อมระบุวันที่หมดอายุให้ครบถ้วน เพื่อให้แอดมินตรวจสอบ</Text>

      <View style={styles.docSection}>
        <Text style={styles.inputLabel}>ระดับชั้นของสัตวแพทย์</Text>
        <View style={styles.pickerContainer}>
          <Picker selectedValue={vetClass} onValueChange={(itemValue) => setVetClass(itemValue)} style={styles.picker}>
            <Picker.Item label="สัตวแพทย์ชั้น 1 (ปริญญาตรีขึ้นไป)" value="1" />
            <Picker.Item label="สัตวแพทย์ชั้น 2 (ประกาศนียบัตร)" value="2" />
          </Picker>
        </View>
      </View>

      <View style={styles.docSection}>
        <Text style={styles.inputLabel}>1. ใบอนุญาตประกอบวิชาชีพการสัตวแพทย์</Text>
        <Text style={styles.subLabel}>วันที่หมดอายุ</Text>
        <TouchableOpacity style={styles.datePickerBtn} onPress={() => setShowDatePicker({ visible: true, type: 'license' })}>
          <Feather name="calendar" size={16} color="#666" style={{ marginRight: 8 }} />
          <Text style={licenseExpiryDate ? styles.dateTextSelected : styles.dateTextPlaceholder}>{formatDate(licenseExpiryDate)}</Text>
        </TouchableOpacity>
        <Text style={styles.subLabel}>ไฟล์เอกสาร</Text>
        <View style={styles.uploadRow}>
          <TextInput style={[styles.uploadInput, licenseFile && { color: '#00C853', fontWeight: 'bold' }]} placeholder="ยังไม่ได้เลือกไฟล์" value={licenseFile ? licenseFile.name : ''} editable={false} />
          <TouchableOpacity style={[styles.uploadBtn, { backgroundColor: '#00C853' }]} onPress={() => handleSelectFile('ใบอนุญาตวิชาชีพ')}>
            <Text style={styles.uploadBtnText}>เลือกไฟล์</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.docSection}>
        <Text style={styles.inputLabel}>2. บัตรประจำตัวสัตวแพทย์</Text>
        <Text style={styles.subLabel}>วันที่หมดอายุ</Text>
        <TouchableOpacity style={styles.datePickerBtn} onPress={() => setShowDatePicker({ visible: true, type: 'idCard' })}>
          <Feather name="calendar" size={16} color="#666" style={{ marginRight: 8 }} />
          <Text style={idCardExpiryDate ? styles.dateTextSelected : styles.dateTextPlaceholder}>{formatDate(idCardExpiryDate)}</Text>
        </TouchableOpacity>
        <Text style={styles.subLabel}>ไฟล์เอกสาร</Text>
        <View style={styles.uploadRow}>
          <TextInput style={[styles.uploadInput, idCardFile && { color: '#00C853', fontWeight: 'bold' }]} placeholder="ยังไม่ได้เลือกไฟล์" value={idCardFile ? idCardFile.name : ''} editable={false} />
          <TouchableOpacity style={[styles.uploadBtn, { backgroundColor: '#00C853' }]} onPress={() => handleSelectFile('บัตรประจำตัว')}>
            <Text style={styles.uploadBtnText}>เลือกไฟล์</Text>
          </TouchableOpacity>
        </View>
      </View>

      <TouchableOpacity style={[styles.submitFormButton, { backgroundColor: isLoading ? '#999' : '#00C853' }]} onPress={handleSubmitDocuments} disabled={isLoading}>
        <Text style={styles.submitFormText}>{isLoading ? "กำลังอัปโหลดเอกสาร..." : "ส่งเอกสารให้ตรวจสอบ"}</Text>
      </TouchableOpacity>

      {showDatePicker.visible && (
        <DateTimePicker
          value={showDatePicker.type === 'license' ? (licenseExpiryDate || new Date()) : showDatePicker.type === 'idCard' ? (idCardExpiryDate || new Date()) : new Date()}
          mode="date" display="default" onChange={handleDateChange} minimumDate={new Date()}
        />
      )}
      <View style={{ height: 20 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  sectionHeading: { fontSize: 14, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 6 },
  infoSubText: { fontSize: 11, color: '#999', marginBottom: 16 },
  uploadDocContainer: { backgroundColor: '#FFF', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#EAEAEC' },

  docSection: { marginBottom: 20, backgroundColor: '#FAFAFA', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#F0F0F0' },
  inputLabel: { fontSize: 13, fontWeight: 'bold', color: '#0055B3', marginBottom: 12 },
  subLabel: { fontSize: 12, color: '#555', marginBottom: 6, fontWeight: '500' },

  pickerContainer: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#D1C4E9', borderRadius: 8, overflow: 'hidden', marginTop: 4 },
  picker: { height: 50, width: '100%', color: '#333' },

  datePickerBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderWidth: 1, borderColor: '#D1C4E9', borderRadius: 8, height: 42, paddingHorizontal: 12, marginBottom: 12 },
  dateTextPlaceholder: { color: '#999', fontSize: 13 },
  dateTextSelected: { color: '#333', fontSize: 13, fontWeight: 'bold' },

  uploadRow: { flexDirection: 'row', alignItems: 'center' },
  uploadInput: { flex: 1, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#D1C4E9', borderRightWidth: 0, borderTopLeftRadius: 8, borderBottomLeftRadius: 8, height: 42, paddingHorizontal: 12, fontSize: 13, color: '#888' },
  uploadBtn: { backgroundColor: '#9C64A6', height: 42, paddingHorizontal: 16, justifyContent: 'center', borderTopRightRadius: 8, borderBottomRightRadius: 8 },
  uploadBtnText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },

  submitFormButton: { alignSelf: 'center', width: '100%', alignItems: 'center', paddingVertical: 14, borderRadius: 8, marginTop: 10 },
  submitFormText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },

  pendingBox: { backgroundColor: '#FFF8E1', borderWidth: 1, borderColor: '#FFE082', borderRadius: 12, padding: 20, marginTop: 10 },
  pendingTitle: { color: '#EF6C00', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  pendingDesc: { color: '#F57C00', fontSize: 12, lineHeight: 18 },

  verifiedBox: { backgroundColor: '#E8F5E9', borderWidth: 1, borderColor: '#A5D6A7', borderRadius: 12, padding: 20, marginTop: 10 },
  verifiedTitle: { color: '#00C853', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  verifiedDesc: { color: '#4CAF50', fontSize: 12 },

  detailBox: { backgroundColor: '#FFF', padding: 12, borderRadius: 8, width: '100%', borderWidth: 1, borderColor: '#FFCDD2' },
  detailLabel: { fontSize: 12, fontWeight: 'bold', color: '#C62828', marginBottom: 4 },
  detailText: { fontSize: 13, color: '#333', lineHeight: 20 },

  actionRow: { flexDirection: 'row', marginTop: 16, width: '100%', gap: 10 },
  reSubmitBtn: { flex: 1, alignItems: 'center', paddingVertical: 12, backgroundColor: '#D32F2F', borderRadius: 8 },
  reSubmitText: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },
  historyBtnOutline: { flex: 1, alignItems: 'center', paddingVertical: 12, backgroundColor: '#FFF', borderRadius: 8, borderWidth: 1, borderColor: '#D32F2F' },
  historyBtnTextOutline: { color: '#D32F2F', fontWeight: 'bold', fontSize: 13 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { width: '100%', backgroundColor: '#FFF', borderRadius: 16, padding: 20, elevation: 5, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  historyItem: { marginBottom: 20, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  historyLabel: { fontSize: 14, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 4 },
  historySubText: { fontSize: 12, color: '#666', marginBottom: 10 },

  // Styles สำหรับรูปภาพ Preview
  previewImage: { width: '100%', height: 160, borderRadius: 8, borderWidth: 1, borderColor: '#EAEAEC', backgroundColor: '#F0F0F0' },
  previewOverlay: { position: 'absolute', bottom: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, flexDirection: 'row', alignItems: 'center' },
  previewText: { color: '#FFF', fontSize: 12, marginLeft: 6, fontWeight: 'bold' },
  noDocText: { fontSize: 13, color: '#999', fontStyle: 'italic', marginTop: 8 },

  // Styles สำหรับหน้าจอ Full Screen 
  viewerContainer: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center', alignItems: 'center' },
  viewerCloseBtn: { position: 'absolute', top: 50, right: 20, zIndex: 10, padding: 10 },
  viewerImage: { width: '100%', height: '80%' }
});
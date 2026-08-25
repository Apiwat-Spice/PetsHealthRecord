import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, StatusBar, Platform, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import * as DocumentPicker from 'expo-document-picker'; // 🟢 ดึงระบบเลือกไฟล์มาใช้
import { API_URL } from '../../config';

export default function ProfileVET({ setIsLoggedIn }) {
  const [vetProfile, setVetProfile] = useState({
    name: 'สัตวแพทย์',
    email: '',
    phone: '',
    roleLevel: 'สัตวแพทย์',
    clinicOwnerTitle: '',
  });

  const [activeTab, setActiveTab] = useState('info');
  const [clinicSubView, setClinicSubView] = useState('list');
  const [joinModalVisible, setJoinModalVisible] = useState(false);
  const [joinCodeInput, setJoinCodeInput] = useState('');

  // สถานะการส่งเอกสารและการยืนยันตัวตน
  const [verificationStatus, setVerificationStatus] = useState('unsubmitted');

  // 🟢 State สำหรับเก็บไฟล์เอกสาร (เก็บชื่อไฟล์ไว้แสดงผล)
  const [licenseFile, setLicenseFile] = useState(null);
  const [idCardFile, setIdCardFile] = useState(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const profileStr = await SecureStore.getItemAsync('vet_profile');
        const userStr = await SecureStore.getItemAsync('user');

        if (profileStr && userStr) {
          const profile = JSON.parse(profileStr);
          const user = JSON.parse(userStr);

          setVetProfile({
            user_id: user.user_id, //ดึงไอดีส่งให้เซิร์ฟเวอร์
            name: `${profile.firstname} ${profile.lastname}`,
            email: user.email || 'ไม่ระบุ',
            phone: profile.phone || 'ไม่ระบุ',
            roleLevel: profile.vet_class ? `สัตวแพทย์ขั้น ${profile.vet_class}` : 'สัตวแพทย์',
          });

          if (user.verified) {
            setVerificationStatus('verified');
          } else if (profile.vet_license_document_id) {
            setVerificationStatus('pending');
          } else {
            setVerificationStatus('unsubmitted');
          }
        }
      } catch (error) {
        console.log("Load profile error:", error);
      }
    };
    loadProfile();
  }, []);

  const handleLogout = () => {
    Alert.alert("ออกจากระบบ", "คุณต้องการออกจากระบบหรือไม่?", [
      { text: "ยกเลิก", style: "cancel" },
      {
        text: "Logout", style: "destructive",
        onPress: async () => {
          try {
            await SecureStore.deleteItemAsync("token");
            await SecureStore.deleteItemAsync("user");
            await SecureStore.deleteItemAsync("vet_profile");
            setIsLoggedIn(false);
          } catch (error) {
            console.error("Logout Error:", error);
            Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถออกจากระบบได้");
          }
        },
      },
    ]);
  };

  // 🟢 ฟังก์ชันสำหรับเปิดเครื่องมือเลือกไฟล์จากในเครื่อง
  const handleSelectFile = async (docType) => {
    try {
      // ให้เลือกเฉพาะไฟล์ PDF เท่านั้น
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/pdf',
        copyToCacheDirectory: true,
      });

      if (!result.canceled && result.assets.length > 0) {
        const fileData = result.assets[0]; // ดึงข้อมูลไฟล์แรกที่เลือกมา

        // แยกเก็บไฟล์ตามประเภท
        if (docType === 'ใบอนุญาตวิชาชีพ') {
          setLicenseFile(fileData);
        } else if (docType === 'บัตรประจำตัว') {
          setIdCardFile(fileData);
        }
        Alert.alert("สำเร็จ", `เลือกไฟล์: ${fileData.name}`);
      }
    } catch (error) {
      console.log('Error selecting file:', error);
      Alert.alert("ข้อผิดพลาด", "ไม่สามารถเลือกไฟล์ได้");
    }
  };

 // 🟢 ตรวจสอบก่อนส่ง และส่งข้อมูลไป Server
  const handleSubmitDocuments = async () => {
    if (!licenseFile || !idCardFile) {
      Alert.alert("แจ้งเตือน", "กรุณาอัปโหลดเอกสารให้ครบทั้ง 2 รายการครับ");
      return;
    }

    if (!licenseFile.uri || !idCardFile.uri) {
       Alert.alert("ข้อผิดพลาด", "ไม่สามารถดึงที่อยู่ไฟล์ได้ กรุณากดเลือกไฟล์ใหม่อีกครั้งครับ");
       return;
    }

    Alert.alert('กำลังส่งเอกสาร...', 'กรุณารอสักครู่...');

    try {
      const formData = new FormData();

      // 🟢 1. ใบอนุญาตวิชาชีพ (เขียน Object สดๆ เข้าไปเลย ห้ามมีคำสั่งอื่นครอบ)
      formData.append('vet_license_pdf', {
        uri: Platform.OS === 'ios' ? licenseFile.uri.replace('file://', '') : licenseFile.uri,
        name: 'vet_license.pdf', 
        type: 'application/pdf',
      });

      // 🟢 2. บัตรประจำตัวสัตวแพทย์ (เขียน Object สดๆ เข้าไปเลย)
      formData.append('vet_id_card_pdf', {
        uri: Platform.OS === 'ios' ? idCardFile.uri.replace('file://', '') : idCardFile.uri,
        name: 'vet_id_card.pdf', 
        type: 'application/pdf',
      });

      // 🟢 3. ใส่ user_id (บังคับแปลงเป็นตัวอักษร String เสมอ ป้องกัน React Native งง)
      formData.append('user_id', String(vetProfile.user_id));

      console.log("==== กำลังยิง API ====");
      console.log("1. License URI:", licenseFile.uri);
      console.log("2. ID Card URI:", idCardFile.uri);
      console.log("3. User ID:", String(vetProfile.user_id));

      // ยิง API ไปหา Backend
      const response = await fetch(`${API_URL}/upload-vet-license`, {
        method: 'POST',
        // ⚠️ ไม่ต้องใส่ headers อะไรเลย ปล่อยให้ระบบมันจัดการเอง
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        Alert.alert('ส่งเอกสารสำเร็จ!', 'ระบบได้รับเอกสารของคุณแล้ว โปรดรอผู้ดูแลระบบตรวจสอบครับ');
        setVerificationStatus('pending'); // เปลี่ยนสถานะหน้าจอเป็นรอตรวจ
      } else {
        Alert.alert('เกิดข้อผิดพลาดจากเซิร์ฟเวอร์', result.message || 'อัปโหลดไม่สำเร็จ');
      }
    } catch (error) {
      console.error("Upload error details:", error);
      Alert.alert('การเชื่อมต่อขัดข้อง', error.message || 'เกิดปัญหาในการแพ็คไฟล์หรือเชื่อมต่อเซิร์ฟเวอร์');
    }
  };

  const handleClinicAction = (action) => {
    if (verificationStatus !== 'verified') {
      Alert.alert('จำกัดสิทธิ์', 'คุณต้องผ่านการตรวจสอบเอกสารและได้รับการยืนยันตัวตนก่อน จึงจะสามารถสมัครหรือสร้างสถานพยาบาลสัตว์ได้ครับ');
      return;
    }

    if (action === 'join') {
      if (clinicSubView === 'list') {
        setJoinModalVisible(true);
      } else {
        setClinicSubView('list');
      }
    } else if (action === 'create') {
      setClinicSubView('create');
    }
  };


  const renderClinicList = () => (
    <View>
      <Text style={styles.sectionHeading}>สถานพยาบาลที่สังกัด</Text>
      <View style={styles.warningBox}>
        <Text style={styles.warningText}>ยังไม่มีสถานพยาบาลที่สังกัด</Text>
      </View>
      <TouchableOpacity style={[styles.fabAddButton, verificationStatus !== 'verified' && { backgroundColor: '#A9A9A9' }]} onPress={() => handleClinicAction('join')}>
        <Feather name="plus" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );

  const renderCreateClinicForm = () => (
    <View style={styles.createFormContainer}>
      <Text style={styles.sectionHeading}>ส่งคำขอสร้างสถานพยาบาลสัตว์</Text>

      <View style={styles.warningBox}>
        <Text style={styles.warningText}>การส่งคำขอสร้างสถานพยาบาล</Text>
        <Text style={styles.warningSubText}>เอกสารจะถูกส่งให้ผู้ดูแลระบบตรวจสอบ</Text>
        <Text style={styles.warningSubText}>และสร้างบัญชีคลินิกให้หลังอนุมัติ</Text>
      </View>

      <Text style={styles.inputLabel}>ชื่อสถานพยาบาลสัตว์</Text>
      <TextInput style={styles.textInputOutline} placeholder="กรอกชื่อสถานพยาบาลสัตว์" />

      <Text style={styles.inputLabel}>รายละเอียดอื่นๆ (ตามของเดิม)</Text>
      <TextInput style={styles.textInputOutline} placeholder="..." />

      <TouchableOpacity style={styles.submitFormButton} onPress={() => setClinicSubView('success')}>
        <Text style={styles.submitFormText}>ส่งคำขอ</Text>
      </TouchableOpacity>
    </View>
  );

  const renderCreateClinicSuccess = () => (
    <View style={styles.createFormContainer}>
      <Text style={styles.sectionHeading}>ส่งคำขอสร้างสถานพยาบาลสัตว์</Text>
      <View style={styles.successBox}>
        <MaterialCommunityIcons name="check-circle" size={90} color="#9C64A6" style={{ marginBottom: 16 }} />
        <Text style={styles.successTitleText}>ส่งคำขอเรียบร้อย</Text>
        <TouchableOpacity style={styles.successBtn} onPress={() => setClinicSubView('list')}>
          <Text style={styles.successBtnText}>เรียบร้อย</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="#00B862" />

      <View style={styles.headerBar}>
        <View style={styles.headerLeft}>
          <Text style={styles.clinicNameText}>Vet Profile</Text>
        </View>
        <Text style={styles.vetNameText}>{vetProfile.name}</Text>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

        {/* Profile Card */}
        <View style={styles.profileHeaderCard}>
          <View style={styles.avatarCircle}><Feather name="user" size={42} color="#1A1A1A" /></View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{vetProfile.name}</Text>
            <Text style={styles.profileEmail}>{vetProfile.email}</Text>

            {/* Badges ด้านล่างชื่อ */}
            {verificationStatus === 'verified' ? (
              <View style={styles.badgeRow}>
                <View style={styles.badgeGreen}><Text style={styles.badgeGreenText}>{vetProfile.roleLevel}</Text></View>
                <View style={[styles.badgeGreen, { marginLeft: 6 }]}><Text style={styles.badgeGreenText}>ยืนยันแล้ว</Text></View>
              </View>
            ) : verificationStatus === 'pending' ? (
              <View style={styles.badgeRow}>
                <View style={styles.badgeOrange}><Text style={styles.badgeOrangeText}>รอแอดมินยืนยันตัวตน</Text></View>
              </View>
            ) : (
              <View style={styles.badgeRow}>
                <View style={[styles.badgeOrange, { backgroundColor: '#FFEBEB' }]}><Text style={[styles.badgeOrangeText, { color: '#D32F2F' }]}>ยังไม่ได้ส่งเอกสารยืนยันตัวตน</Text></View>
              </View>
            )}

            {verificationStatus === 'verified' && vetProfile.clinicOwnerTitle ? (
              <View style={styles.badgePurple}><Text style={styles.badgePurpleText}>{vetProfile.clinicOwnerTitle}</Text></View>
            ) : null}
          </View>
        </View>

        {/* Tab Switcher */}
        <View style={styles.tabSwitcher}>
          <TouchableOpacity style={[styles.tabItem, activeTab === 'info' && styles.tabItemActive]} onPress={() => setActiveTab('info')}>
            <Text style={[styles.tabText, activeTab === 'info' && styles.tabTextActive]}>ข้อมูลผู้ใช้</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tabItem, activeTab === 'clinic' && styles.tabItemActive]} onPress={() => setActiveTab('clinic')}>
            <Text style={[styles.tabText, activeTab === 'clinic' && styles.tabTextActive]}>คลินิก</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tabItem, activeTab === 'verification' && styles.tabItemActive]} onPress={() => setActiveTab('verification')}>
            <Text style={[styles.tabText, activeTab === 'verification' && styles.tabTextActive]}>ยืนยันตัวตน</Text>
          </TouchableOpacity>
        </View>

        {/* ข้อมูลผู้ใช้ */}
        {activeTab === 'info' && (
          <View style={styles.tabContent}>
            <View style={styles.cardBox}>
              <Text style={styles.infoLabel}>ชื่อ-นามสกุล</Text>
              <Text style={styles.infoValue}>{vetProfile.name}</Text>
              <Text style={styles.infoLabel}>อีเมล</Text>
              <Text style={styles.infoValue}>{vetProfile.email}</Text>
              <Text style={styles.infoLabel}>เบอร์โทร</Text>
              <Text style={styles.infoValue}>{vetProfile.phone}</Text>
            </View>

            <TouchableOpacity style={styles.outlineButton} onPress={() => Alert.alert('เปลี่ยนรหัสผ่าน', 'เข้าสู่หน้าเปลี่ยนรหัสผ่าน')}>
              <Text style={styles.outlineButtonText}>เปลี่ยนรหัสผ่าน</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.outlineButton} onPress={handleLogout}>
              <Text style={styles.outlineButtonText}>ออกจากระบบ</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Tab คลินิก */}
        {activeTab === 'clinic' && (
          <View style={styles.tabContent}>
            <View style={styles.actionRow}>
              {/* ปุ่มสมัคร */}
              <TouchableOpacity
                style={[styles.actionBtn, clinicSubView === 'list' ? styles.btnGreen : styles.btnGray]}
                onPress={() => handleClinicAction('join')}
              >
                <Text style={[styles.actionBtnText, clinicSubView === 'list' ? styles.textWhite : styles.textGray]}>
                  สมัครเข้าสถานพยาบาล
                </Text>
              </TouchableOpacity>

              {/* ปุ่มสร้าง */}
              <TouchableOpacity
                style={[styles.actionBtn, (clinicSubView === 'create' || clinicSubView === 'success') ? styles.btnPurple : styles.btnGray]}
                onPress={() => handleClinicAction('create')}
              >
                <Text style={[styles.actionBtnText, (clinicSubView === 'create' || clinicSubView === 'success') ? styles.textWhite : styles.textGray]}>
                  สร้างสถานพยาบาล
                </Text>
              </TouchableOpacity>
            </View>

            {clinicSubView === 'list' && renderClinicList()}
            {clinicSubView === 'create' && renderCreateClinicForm()}
            {clinicSubView === 'success' && renderCreateClinicSuccess()}
          </View>
        )}

        {/* 🟢 Tab ยืนยันตัวตน */}
        {activeTab === 'verification' && (
          <View style={styles.tabContent}>
            {verificationStatus === 'unsubmitted' ? (
              <View style={styles.uploadDocContainer}>
                <Text style={styles.sectionHeading}>อัปโหลดเอกสารยืนยันตัวตน</Text>
                <Text style={styles.infoSubText}>กรุณาอัปโหลดเอกสารรูปแบบ PDF ให้ครบถ้วน เพื่อให้แอดมินตรวจสอบก่อนเข้าใช้งานฟังก์ชันต่างๆ</Text>

                {/* 🟢 ส่วนอัปโหลดเอกสารที่ 1 */}
                <Text style={styles.inputLabel}>ใบอนุญาตประกอบวิชาชีพการสัตวแพทย์(PDF)</Text>
                <View style={styles.uploadRow}>
                  {/* เปลี่ยน Placeholder ให้โชว์ชื่อไฟล์ถ้ามีการเลือกไฟล์มาแล้ว */}
                  <TextInput
                    style={[styles.uploadInput, licenseFile && { color: '#00C853', fontWeight: 'bold' }]}
                    placeholder="ยังไม่ได้เลือกไฟล์"
                    value={licenseFile ? licenseFile.name : ''}
                    editable={false}
                  />
                  <TouchableOpacity style={styles.uploadBtn} onPress={() => handleSelectFile('ใบอนุญาตวิชาชีพ')}>
                    <Text style={styles.uploadBtnText}>เลือกไฟล์</Text>
                  </TouchableOpacity>
                </View>

                {/* 🟢 ส่วนอัปโหลดเอกสารที่ 2 */}
                <Text style={styles.inputLabel}>บัตรประจำตัวสัตวแพทย์(PDF)</Text>
                <View style={styles.uploadRow}>
                  <TextInput
                    style={[styles.uploadInput, idCardFile && { color: '#00C853', fontWeight: 'bold' }]}
                    placeholder="ยังไม่ได้เลือกไฟล์"
                    value={idCardFile ? idCardFile.name : ''}
                    editable={false}
                  />
                  <TouchableOpacity style={styles.uploadBtn} onPress={() => handleSelectFile('บัตรประจำตัว')}>
                    <Text style={styles.uploadBtnText}>เลือกไฟล์</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity style={styles.submitFormButton} onPress={handleSubmitDocuments}>
                  <Text style={styles.submitFormText}>ส่งเอกสารให้ตรวจสอบ</Text>
                </TouchableOpacity>
              </View>

            ) : verificationStatus === 'pending' ? (
              <View style={styles.pendingBox}>
                <MaterialCommunityIcons name="clock-outline" size={42} color="#EF6C00" style={{ marginRight: 16 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.pendingTitle}>กำลังตรวจสอบเอกสาร...</Text>
                  <Text style={styles.pendingDesc}>เอกสารของคุณถูกส่งเข้าระบบแล้ว แอดมินจะทำการตรวจสอบและอัปเดตสถานะให้ทราบในภายหลัง</Text>
                </View>
              </View>
            ) : (
              <View style={styles.verifiedBox}>
                <MaterialCommunityIcons name="shield-check" size={42} color="#00C853" style={{ marginRight: 16 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.verifiedTitle}>ยืนยันตัวตนแล้ว</Text>
                  <Text style={styles.verifiedDesc}>บัญชีของคุณผ่านการตรวจสอบแล้ว สามารถเข้าใช้งานได้ทุกฟังก์ชัน</Text>
                </View>
              </View>
            )}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Modal สมัครเข้าคลินิก */}
      <Modal visible={joinModalVisible} transparent={true} animationType="fade" onRequestClose={() => setJoinModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeaderGreen}>
              <Text style={styles.modalHeaderTitle}>สมัครเข้าสถานพยาบาลสัตว์</Text>
            </View>
            <View style={styles.modalBody}>
              <Text style={styles.modalLabelCenter}>รหัสผ่านเข้าสถานพยาบาลสัตว์</Text>
              <TextInput style={styles.modalInputOutline} placeholder="กรอกรหัส" value={joinCodeInput} onChangeText={setJoinCodeInput} textAlign="center" />
              <View style={styles.modalBtnRow}>
                <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setJoinModalVisible(false)}><Text style={styles.modalCancelText}>ยกเลิก</Text></TouchableOpacity>
                <TouchableOpacity style={styles.modalConfirmBtn} onPress={() => { Alert.alert('สำเร็จ', 'ส่งคำขอสมัครเรียบร้อยแล้ว'); setJoinModalVisible(false); }}><Text style={styles.modalConfirmText}>ยืนยัน</Text></TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  headerBar: { backgroundColor: '#00B862', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12, paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 12 : 14 },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  clinicNameText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', marginLeft: 6 },
  vetNameText: { color: '#FFFFFF', fontSize: 14, fontWeight: '500' },
  scrollView: { flex: 1 },
  profileHeaderCard: { backgroundColor: '#FFFFFF', flexDirection: 'row', padding: 20, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#EAEAEC' },
  avatarCircle: { width: 70, height: 70, borderRadius: 35, borderWidth: 3, borderColor: '#1A1A1A', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
  profileInfo: { flex: 1 },
  profileName: { fontSize: 20, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 2 },
  profileEmail: { fontSize: 12, color: '#888', marginBottom: 8 },
  badgeRow: { flexDirection: 'row', marginBottom: 6 },
  badgeGreen: { backgroundColor: '#E8F5E9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeGreenText: { color: '#00C853', fontSize: 10, fontWeight: 'bold' },
  badgeOrange: { backgroundColor: '#FFF3E0', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeOrangeText: { color: '#EF6C00', fontSize: 10, fontWeight: 'bold' },
  badgePurple: { backgroundColor: '#F3E5F5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-start' },
  badgePurpleText: { color: '#9C64A6', fontSize: 10, fontWeight: 'bold' },
  tabSwitcher: { flexDirection: 'row', backgroundColor: '#F5F5F5', margin: 16, borderRadius: 10, padding: 4 },
  tabItem: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  tabItemActive: { backgroundColor: '#FFFFFF', elevation: 1 },
  tabText: { fontSize: 13, color: '#888', fontWeight: 'bold' },
  tabTextActive: { color: '#00B862' },
  tabContent: { paddingHorizontal: 16 },
  cardBox: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#EAEAEC' },
  infoLabel: { fontSize: 13, fontWeight: 'bold', color: '#1A1A1A', marginTop: 10 },
  infoValue: { fontSize: 12, color: '#666', marginTop: 4 },
  infoSubText: { fontSize: 11, color: '#999', marginBottom: 12 },
  outlineButton: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EAEAEC', height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  outlineButtonText: { fontSize: 14, color: '#1A1A1A', fontWeight: 'bold' },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  actionBtn: { flex: 0.48, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  btnGreen: { backgroundColor: '#00C853' },
  btnPurple: { backgroundColor: '#C084C9' },
  btnGray: { backgroundColor: '#EAEAEC' },
  actionBtnText: { fontSize: 12, fontWeight: 'bold' },
  textWhite: { color: '#FFFFFF' },
  textGray: { color: '#888888' },
  sectionHeading: { fontSize: 14, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 10 },
  createFormContainer: { paddingBottom: 20 },
  warningBox: { backgroundColor: '#FFF3CD', padding: 12, borderRadius: 8, marginBottom: 16 },
  warningText: { color: '#D97706', fontSize: 13, fontWeight: 'bold', textAlign: 'center' },
  warningSubText: { color: '#D97706', fontSize: 11, textAlign: 'center', marginTop: 2 },
  inputLabel: { fontSize: 12, fontWeight: 'bold', color: '#333', marginTop: 12, marginBottom: 6 },
  textInputOutline: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#D1C4E9', borderRadius: 8, height: 42, paddingHorizontal: 12, fontSize: 13 },
  uploadDocContainer: { backgroundColor: '#FFF', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#EAEAEC' },
  uploadRow: { flexDirection: 'row', alignItems: 'center' },
  uploadInput: { flex: 1, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#D1C4E9', borderRightWidth: 0, borderTopLeftRadius: 8, borderBottomLeftRadius: 8, height: 42, paddingHorizontal: 12, fontSize: 13, color: '#888' },
  uploadBtn: { backgroundColor: '#9C64A6', height: 42, paddingHorizontal: 16, justifyContent: 'center', borderTopRightRadius: 8, borderBottomRightRadius: 8 },
  uploadBtnText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  submitFormButton: { backgroundColor: '#9C64A6', alignSelf: 'flex-end', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8, marginTop: 24 },
  submitFormText: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },
  successBox: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E1BEE7', borderRadius: 16, padding: 40, alignItems: 'center', justifyContent: 'center', marginTop: 20 },
  successTitleText: { fontSize: 18, fontWeight: 'bold', color: '#9C64A6', marginBottom: 20 },
  successBtn: { backgroundColor: '#BA8ECA', paddingHorizontal: 30, paddingVertical: 10, borderRadius: 20 },
  successBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
  pendingBox: { flexDirection: 'row', backgroundColor: '#FFF8E1', borderWidth: 1, borderColor: '#FFE082', borderRadius: 12, padding: 20, alignItems: 'center', marginTop: 10 },
  pendingTitle: { color: '#EF6C00', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  pendingDesc: { color: '#F57C00', fontSize: 12 },
  verifiedBox: { flexDirection: 'row', backgroundColor: '#E8F5E9', borderWidth: 1, borderColor: '#A5D6A7', borderRadius: 12, padding: 20, alignItems: 'center', marginTop: 10 },
  verifiedTitle: { color: '#00C853', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  verifiedDesc: { color: '#4CAF50', fontSize: 12 },
  fabAddButton: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#00C853', alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginTop: 20, elevation: 4 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalBox: { width: '100%', backgroundColor: '#FFF', borderRadius: 16, overflow: 'hidden' },
  modalHeaderGreen: { backgroundColor: '#00C853', paddingVertical: 16, alignItems: 'center' },
  modalHeaderTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
  modalBody: { padding: 24 },
  modalLabelCenter: { fontSize: 14, fontWeight: 'bold', color: '#333', textAlign: 'center', marginBottom: 16 },
  modalInputOutline: { borderWidth: 1, borderColor: '#EAEAEC', borderRadius: 8, height: 46, fontSize: 14, marginBottom: 24 },
  modalBtnRow: { flexDirection: 'row', justifyContent: 'flex-end' },
  modalCancelBtn: { borderWidth: 1, borderColor: '#EAEAEC', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, marginRight: 12 },
  modalCancelText: { color: '#666', fontWeight: 'bold', fontSize: 14 },
  modalConfirmBtn: { backgroundColor: '#00C853', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  modalConfirmText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
});
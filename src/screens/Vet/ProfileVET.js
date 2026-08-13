import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, StatusBar, Platform, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

export default function ProfileVET() {
  const vetProfile = {
    name: 'น.สพ.สมพง',
    email: 'vetsompong@gmail.com',
    roleLevel: 'สัตวแพทย์ขั้น 1',
    clinicOwnerTitle: 'เจ้าของ คลินิกรักษาสัตว์ HappyPet',
    phone: '08X-XXX-XXXX',
    vetLicense: 'VL-2020-5521',
    vetLicenseExpire: '24-07-2029',
    proLicense: '01-XXXX/XXXX',
    proLicenseExpire: '24-07-2029',
  };

  const [activeTab, setActiveTab] = useState('info'); // หน้าข้อมูลผู้ใช้

  // true = ยืนยันตัวตนแล้ว (ป้ายสีเขียว), false = กำลังรอยืนยัน (ป้ายสีส้ม)
  const [isVerified, setIsVerified] = useState(true);

  const [joinModalVisible, setJoinModalVisible] = useState(false);
  const [joinCodeInput, setJoinCodeInput] = useState('');

  // แท็บคลินิก: 'list' (หน้ารายชื่อ), 'create' (หน้าฟอร์มสร้าง), 'success' (หน้าส่งคำขอเรียบร้อย)
  const [clinicSubView, setClinicSubView] = useState('list');


  // รายชื่อคลินิก
  const renderClinicList = () => (
    <View>
      <Text style={styles.sectionHeading}>สถานพยาบาลที่สังกัด</Text>
      <View style={styles.clinicCard}>
        <View style={styles.clinicIconBox}></View>
        <View style={styles.clinicDetail}>
          <Text style={styles.clinicName}>ชื่อสถานพยาบาลสัตว์</Text>
          <Text style={styles.clinicSub}>เบอร์โทร 061-555-5555</Text>
          <Text style={styles.clinicSub}>ที่อยู่ XXXXXXXXXXX</Text>
          <Text style={styles.clinicSub}>วันที่ทำงาน จันทร์,อังคาร,พุธ เวลา 08:00น.-16:00น.</Text>
        </View>
      </View>
      <View style={styles.clinicCard}>
        <View style={styles.clinicIconBox}></View>
        <View style={styles.clinicDetail}>
          <Text style={styles.clinicName}>ชื่อสถานพยาบาลสัตว์</Text>
          <Text style={styles.clinicSub}>เบอร์โทร 061-555-5555</Text>
          <Text style={styles.clinicSub}>ที่อยู่ XXXXXXXXXXX</Text>
          <Text style={styles.clinicSub}>วันที่ทำงาน พฤหัสบดี,ศุกร์,เสาร์ เวลา 08:00น.-16:00น.</Text>
        </View>
      </View>
      <TouchableOpacity style={styles.fabAddButton} onPress={() => setJoinModalVisible(true)}>
        <Feather name="plus" size={28} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );

  // ฟอร์มสร้างคลินิก
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

      <Text style={styles.inputLabel}>เวลาเปิด-ปิด</Text>
      <TextInput style={styles.textInputOutline} placeholder="กรอกเวลาเปิด-ปิด" />

      <Text style={styles.inputLabel}>ที่อยู่</Text>
      <TextInput style={styles.textInputOutline} placeholder="กรอกที่อยู่" />

      <View style={styles.rowForm}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={styles.inputLabel}>ตำบล</Text>
          <TextInput style={styles.textInputOutline} placeholder="กรอกตำบล" />
        </View>
        <View style={{ flex: 1 }}></View>
      </View>

      <View style={styles.rowForm}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={styles.inputLabel}>อำเภอ</Text>
          <TextInput style={styles.textInputOutline} placeholder="กรอกอำเภอ" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.inputLabel}>จังหวัด</Text>
          <TextInput style={styles.textInputOutline} placeholder="กรอกจังหวัด" />
        </View>
      </View>

      <View style={styles.rowForm}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={styles.inputLabel}>รหัสไปรษณีย์</Text>
          <TextInput style={styles.textInputOutline} placeholder="กรอกรหัสไปรษณีย์" />
        </View>
        <View style={{ flex: 1 }}></View>
      </View>

      <View style={styles.rowForm}>
        <View style={{ flex: 1, marginRight: 8 }}>
          <Text style={styles.inputLabel}>ละติจูด</Text>
          <TextInput style={styles.textInputOutline} placeholder="กรอกละติจูด" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.inputLabel}>ลองติจูด</Text>
          <TextInput style={styles.textInputOutline} placeholder="กรอกลองติจูด" />
        </View>
      </View>

      <Text style={styles.inputLabel}>ลิ้ง google map</Text>
      <TextInput style={styles.textInputOutline} placeholder="กรอกลิ้ง google map" />

      <Text style={styles.inputLabel}>ใบอนุญาตให้ตั้งสถานพยาบาลสัตว์(PDF)</Text>
      <View style={styles.uploadRow}>
        <TextInput style={styles.uploadInput} placeholder="กรอกไฟล์" editable={false} />
        <TouchableOpacity style={styles.uploadBtn}><Text style={styles.uploadBtnText}>อัปโหลด</Text></TouchableOpacity>
      </View>

      <Text style={styles.inputLabel}>ใบอนุญาตดำเนินการสถานพยาบาลสัตว์(PDF)</Text>
      <View style={styles.uploadRow}>
        <TextInput style={styles.uploadInput} placeholder="กรอกไฟล์" editable={false} />
        <TouchableOpacity style={styles.uploadBtn}><Text style={styles.uploadBtnText}>อัปโหลด</Text></TouchableOpacity>
      </View>

      <Text style={styles.inputLabel}>ใบอนุญาตประกอบวิชาชีพการสัตวแพทย์(PDF)</Text>
      <View style={styles.uploadRow}>
        <TextInput style={styles.uploadInput} placeholder="กรอกไฟล์" editable={false} />
        <TouchableOpacity style={styles.uploadBtn}><Text style={styles.uploadBtnText}>อัปโหลด</Text></TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.submitFormButton} onPress={() => setClinicSubView('success')}>
        <Text style={styles.submitFormText}>ส่งคำขอ</Text>
      </TouchableOpacity>
    </View>
  );

  // สร้างสำเร็จ
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
          <MaterialCommunityIcons name="plus-box" size={20} color="#FFFFFF" />
          <Text style={styles.clinicNameText}>คลินิกรักษาสัตว์ HappyPet</Text>
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
            {isVerified ? (
              <View style={styles.badgeRow}>
                <View style={styles.badgeGreen}><Text style={styles.badgeGreenText}>{vetProfile.roleLevel}</Text></View>
                <View style={[styles.badgeGreen, { marginLeft: 6 }]}><Text style={styles.badgeGreenText}>ยืนยันแล้ว</Text></View>
              </View>
            ) : (
              <View style={styles.badgeRow}>
                <View style={styles.badgeOrange}><Text style={styles.badgeOrangeText}>กำลังรอยืนยันตัวตน</Text></View>
              </View>
            )}

            {isVerified && (
              <View style={styles.badgePurple}><Text style={styles.badgePurpleText}>{vetProfile.clinicOwnerTitle}</Text></View>
            )}
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
              <Text style={styles.infoLabel}>ใบอนุญาตประกอบวิชาชีพ</Text>
              <View style={styles.rowBetween}><Text style={styles.infoValue}>{vetProfile.vetLicense}</Text><Text style={styles.infoSubText}>หมดอายุวันที่ {vetProfile.vetLicenseExpire}</Text></View>
              <Text style={styles.infoLabel}>บัตรประจำตัวสัตวแพทย์</Text>
              <View style={styles.rowBetween}><Text style={styles.infoValue}>{vetProfile.proLicense}</Text><Text style={styles.infoSubText}>หมดอายุวันที่ {vetProfile.proLicenseExpire}</Text></View>
            </View>

            {/* ปุ่มเปลี่ยนรหัสผ่าน */}
            <TouchableOpacity
              style={styles.outlineButton}
              onPress={() => Alert.alert('เปลี่ยนรหัสผ่าน', 'เข้าสู่หน้าเปลี่ยนรหัสผ่าน')}
            >
              <Text style={styles.outlineButtonText}>เปลี่ยนรหัสผ่าน</Text>
            </TouchableOpacity>

            {/* ปุ่มออกจากระบบ */}
            <TouchableOpacity
              style={styles.outlineButton}
              onPress={() => Alert.alert('ออกจากระบบ', 'คุณต้องการออกจากระบบหรือไม่?', [{ text: 'ยกเลิก', style: 'cancel' }, { text: 'ตกลง' }])}
            >
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
                onPress={() => {
                  if (clinicSubView === 'list') {
                    setJoinModalVisible(true);
                  } else {
                    setClinicSubView('list');
                  }
                }}
              >
                <Text style={[styles.actionBtnText, clinicSubView === 'list' ? styles.textWhite : styles.textGray]}>
                  สมัครเข้าสถานพยาบาลสัตว์
                </Text>
              </TouchableOpacity>

              {/* ปุ่มสร้าง */}
              <TouchableOpacity
                style={[styles.actionBtn, (clinicSubView === 'create' || clinicSubView === 'success') ? styles.btnPurple : styles.btnGray]}
                onPress={() => setClinicSubView('create')}
              >
                <Text style={[styles.actionBtnText, (clinicSubView === 'create' || clinicSubView === 'success') ? styles.textWhite : styles.textGray]}>
                  สร้างสถานพยาบาลสัตว์
                </Text>
              </TouchableOpacity>
            </View>

            {clinicSubView === 'list' && renderClinicList()}
            {clinicSubView === 'create' && renderCreateClinicForm()}
            {clinicSubView === 'success' && renderCreateClinicSuccess()}
          </View>
        )}

        {/* Tab ยืนยันตัวตน */}
        {activeTab === 'verification' && (
          <View style={styles.tabContent}>
            {isVerified ? (
              <View style={styles.verifiedBox}>
                <MaterialCommunityIcons name="shield-check" size={42} color="#00C853" style={{ marginRight: 16 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.verifiedTitle}>ยืนยันตัวตนแล้ว</Text>
                  <Text style={styles.verifiedDesc}>บัญชีของคุณผ่านการตรวจสอบแล้ว</Text>
                </View>
              </View>
            ) : (
              <View style={styles.pendingBox}>
                <MaterialCommunityIcons name="shield-check" size={42} color="#EF6C00" style={{ marginRight: 16 }} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.pendingTitle}>กำลังรอยืนยันตัวตน...</Text>
                  <Text style={styles.pendingDesc}>หากพบปัญหา ทางแอดมินจะแจ้งในทันที</Text>
                </View>
              </View>
            )}
          </View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* กรอกรหัส สมัครเข้าสถานพยาบาลสัตว์ */}
      <Modal visible={joinModalVisible} transparent={true} animationType="fade" onRequestClose={() => setJoinModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <View style={styles.modalHeaderGreen}>
              <Text style={styles.modalHeaderTitle}>สมัครเข้าสถานพยาบาลสัตว์</Text>
            </View>
            <View style={styles.modalBody}>
              <Text style={styles.modalLabelCenter}>รหัสผ่านเข้าสถานพยาบาลสัตว์</Text>
              <TextInput
                style={styles.modalInputOutline}
                placeholder="กรอกรหัสเข้าสถานพยาบาลสัตว์"
                value={joinCodeInput}
                onChangeText={setJoinCodeInput}
                textAlign="center"
              />
              <View style={styles.modalBtnRow}>
                <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setJoinModalVisible(false)}>
                  <Text style={styles.modalCancelText}>ยกเลิก</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.modalConfirmBtn} onPress={() => {
                  Alert.alert('สำเร็จ', 'ส่งคำขอสมัครเรียบร้อยแล้ว');
                  setJoinCodeInput('');
                  setJoinModalVisible(false);
                }}>
                  <Text style={styles.modalConfirmText}>ยืนยัน</Text>
                </TouchableOpacity>
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

  // โปรไฟล์ และ Tab
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

  // ข้อมูลผู้ใช้
  cardBox: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#EAEAEC' },
  infoLabel: { fontSize: 13, fontWeight: 'bold', color: '#1A1A1A', marginTop: 10 },
  infoValue: { fontSize: 12, color: '#666', marginTop: 4 },
  infoSubText: { fontSize: 11, color: '#999' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },

  // สไตล์ปุ่ม เปลี่ยนรหัสผ่าน / ออกจากระบบ
  outlineButton: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EAEAEC', height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  outlineButtonText: { fontSize: 14, color: '#1A1A1A', fontWeight: 'bold' },

  // ปุ่มแอคชัน (สมัคร/สร้าง)
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  actionBtn: { flex: 0.48, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  btnGreen: { backgroundColor: '#00C853' },
  btnPurple: { backgroundColor: '#C084C9' },
  btnGray: { backgroundColor: '#EAEAEC' },
  actionBtnText: { fontSize: 12, fontWeight: 'bold' },
  textWhite: { color: '#FFFFFF' },
  textGray: { color: '#888888' },

  // คลินิก List View
  sectionHeading: { fontSize: 14, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 10 },
  clinicCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 14, flexDirection: 'row', marginBottom: 10, borderWidth: 1, borderColor: '#EAEAEC' },
  clinicIconBox: { width: 40, height: 40, borderRadius: 8, backgroundColor: '#EAEAEC', marginRight: 12 },
  clinicDetail: { flex: 1 },
  clinicName: { fontSize: 14, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 2 },
  clinicSub: { fontSize: 11, color: '#888' },
  fabAddButton: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#00C853', alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginTop: 20, elevation: 4 },

  // คลินิก Create Form
  createFormContainer: { paddingBottom: 20 },
  warningBox: { backgroundColor: '#FFF3CD', padding: 12, borderRadius: 8, marginBottom: 16 },
  warningText: { color: '#D97706', fontSize: 13, fontWeight: 'bold', textAlign: 'center' },
  warningSubText: { color: '#D97706', fontSize: 11, textAlign: 'center', marginTop: 2 },
  inputLabel: { fontSize: 12, fontWeight: 'bold', color: '#333', marginTop: 12, marginBottom: 6 },
  textInputOutline: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#D1C4E9', borderRadius: 8, height: 42, paddingHorizontal: 12, fontSize: 13 },
  rowForm: { flexDirection: 'row', justifyContent: 'space-between' },
  uploadRow: { flexDirection: 'row', alignItems: 'center' },
  uploadInput: { flex: 1, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#D1C4E9', borderRightWidth: 0, borderTopLeftRadius: 8, borderBottomLeftRadius: 8, height: 42, paddingHorizontal: 12, fontSize: 13, color: '#888' },
  uploadBtn: { backgroundColor: '#9C64A6', height: 42, paddingHorizontal: 16, justifyContent: 'center', borderTopRightRadius: 8, borderBottomRightRadius: 8 },
  uploadBtnText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  submitFormButton: { backgroundColor: '#9C64A6', alignSelf: 'flex-end', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8, marginTop: 24 },
  submitFormText: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },

  // สร้างสำเร็จ
  successBox: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E1BEE7', borderRadius: 16, padding: 40, alignItems: 'center', justifyContent: 'center', marginTop: 20 },
  successTitleText: { fontSize: 18, fontWeight: 'bold', color: '#9C64A6', marginBottom: 20 },
  successBtn: { backgroundColor: '#BA8ECA', paddingHorizontal: 30, paddingVertical: 10, borderRadius: 20 },
  successBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },

  // ยืนยันตัวตน
  pendingBox: { flexDirection: 'row', backgroundColor: '#FFF8E1', borderWidth: 1, borderColor: '#FFE082', borderRadius: 12, padding: 20, alignItems: 'center', marginTop: 10 },
  pendingTitle: { color: '#EF6C00', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  pendingDesc: { color: '#F57C00', fontSize: 12 },

  verifiedBox: { flexDirection: 'row', backgroundColor: '#E8F5E9', borderWidth: 1, borderColor: '#A5D6A7', borderRadius: 12, padding: 20, alignItems: 'center', marginTop: 10 },
  verifiedTitle: { color: '#00C853', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  verifiedDesc: { color: '#4CAF50', fontSize: 12 },

  // สมัครเข้าสถานพยาบาล
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
import React, { useState, useEffect, useCallback } from 'react'; // 🟢 1. Import useCallback
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, StatusBar, Platform, Alert, RefreshControl } from 'react-native'; // 🟢 2. Import RefreshControl
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { useNavigation } from '@react-navigation/native';

import { API_URL } from '../../config';
import Verify from './Verify';
import Clinic from './Clinic';

export default function ProfileVET({ setIsLoggedIn }) {
  const navigation = useNavigation();

  const [vetProfile, setVetProfile] = useState({
    user_id: '',
    vet_id: '',
    name: 'สัตวแพทย์',
    email: '',
    phone: '',
    roleLevel: 'สัตวแพทย์',
    clinicOwnerTitle: '',
  });

  const [activeTab, setActiveTab] = useState('info');
  const [verificationStatus, setVerificationStatus] = useState('unsubmitted');
  const [verificationDetail, setVerificationDetail] = useState('');
  const [submittedDocs, setSubmittedDocs] = useState(null);

  const [clinicStatus, setClinicStatus] = useState('unsubmitted');
  const [clinicDetail, setClinicDetail] = useState('');
  const [clinicSubmittedDocs, setClinicSubmittedDocs] = useState(null);

  const [clinicName, setClinicName] = useState('กำลังโหลด...');
  const [clinicRole, setClinicRole] = useState('');

  // 🟢 3. State สำหรับจัดการสถานะการ Refresh
  const [refreshing, setRefreshing] = useState(false);

  const isFullyVerified = verificationStatus === 'pass' && clinicStatus === 'pass';

  // 🟢 4. แยกฟังก์ชันดึงข้อมูลออกมา เพื่อให้เรียกใช้ได้ทั้งตอนเข้าหน้าเว็บและตอน Pull-to-refresh
  const loadProfile = async () => {
    try {
      const profileStr = await SecureStore.getItemAsync('vet_profile');
      const userStr = await SecureStore.getItemAsync('user');

      if (profileStr && userStr) {
        const profile = JSON.parse(profileStr);
        const user = JSON.parse(userStr);

        setVetProfile({
          user_id: user.user_id,
          vet_id: profile.vet_id,
          name: `${profile.firstname} ${profile.lastname}`,
          email: user.email || 'ไม่ระบุ',
          phone: profile.phone || 'ไม่ระบุ',
          roleLevel: profile.vet_class ? `สัตวแพทย์ชั้น ${profile.vet_class}` : 'สัตวแพทย์',
        });

        // ดึงสถานะยืนยันตัวตน
        try {
          const response = await fetch(`${API_URL}/check-vet-status/${profile.vet_id}`);
          const data = await response.json();
          if (response.ok && data.status) {
            setVerificationStatus(data.status);
            setVerificationDetail(data.detail || '');
            setSubmittedDocs(data.submittedDocs || null);
          } else {
            setVerificationStatus('unsubmitted');
            setSubmittedDocs(null);
          }
        } catch (fetchError) {
          setVerificationStatus('unsubmitted');
          setSubmittedDocs(null);
        }

        // ดึงสถานะคลินิก
        try {
          const clinicRes = await fetch(`${API_URL}/check-clinic-status/${profile.vet_id}`);
          const clinicData = await clinicRes.json();
          if (clinicRes.ok && clinicData.status) {
            setClinicStatus(clinicData.status);
            setClinicDetail(clinicData.detail || '');
            setClinicSubmittedDocs(clinicData.submittedDocs || null);

            if (clinicData.submittedDocs && clinicData.submittedDocs.clinic_name) {
              setClinicName(clinicData.submittedDocs.clinic_name);
            } else {
              setClinicName('คลินิก (ไม่มีชื่อ)');
            }

            if (clinicData.role === 'staff') {
              setClinicRole('staff');
            } else {
              setClinicRole('owner');
            }
          } else {
            setClinicStatus('unsubmitted');
            setClinicSubmittedDocs(null);
          }
        } catch (error) {
          setClinicStatus('unsubmitted');
          setClinicSubmittedDocs(null);
        }
      }
    } catch (error) {
      console.log("Load profile error:", error);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  // 🟢 5. ฟังก์ชันเมื่อผู้ใช้ลากหน้าจอลงมา
  const onRefresh = useCallback(() => {
    setRefreshing(true); // แสดงไอคอนหมุนๆ
    loadProfile().then(() => {
      setRefreshing(false); // ซ่อนไอคอนเมื่อโหลดเสร็จ
    });
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

            if (setIsLoggedIn) {
              setIsLoggedIn(false);
            }
          } catch (error) {
            console.error("Logout Error:", error);
            Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถออกจากระบบได้");
          }
        },
      },
    ]);
  };

  const switchToClinicMode = () => {
    navigation.navigate("ClinicNav");
  };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="#00B862" />

      <View style={styles.headerBar}>
        <View style={styles.headerLeft}><Text style={styles.clinicNameText}>Vet Profile</Text></View>
        <Text style={styles.vetNameText}>{vetProfile.name}</Text>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        // 🟢 6. แนบ RefreshControl เข้าไปใน ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#00B862']} // สีของวงกลมหมุนๆ (Android)
            tintColor="#00B862"   // สีของวงกลมหมุนๆ (iOS)
          />
        }
      >
        <View style={styles.profileHeaderCard}>
          <View style={styles.avatarCircle}><Feather name="user" size={42} color="#1A1A1A" /></View>
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{vetProfile.name}</Text>
            <Text style={styles.profileEmail}>{vetProfile.email}</Text>

            {verificationStatus === 'pass' ? (
              <View style={styles.badgeRow}>
                <View style={styles.badgeGreen}><Text style={styles.badgeGreenText}>{vetProfile.roleLevel}</Text></View>
                <View style={[styles.badgeGreen, { marginLeft: 6 }]}><Text style={styles.badgeGreenText}>ยืนยันตัวตนแล้ว</Text></View>
              </View>
            ) : verificationStatus === 'pending' ? (
              <View style={styles.badgeRow}>
                <View style={styles.badgeOrange}><Text style={styles.badgeOrangeText}>รอแอดมินยืนยันตัวตน</Text></View>
              </View>
            ) : verificationStatus === 'notpass' ? (
              <View style={styles.badgeRow}>
                <View style={[styles.badgeOrange, { backgroundColor: '#FFEBEE' }]}><Text style={[styles.badgeOrangeText, { color: '#D32F2F' }]}>การตรวจสอบไม่ผ่าน</Text></View>
              </View>
            ) : (
              <View style={styles.badgeRow}>
                <View style={[styles.badgeOrange, { backgroundColor: '#F5F5F5' }]}><Text style={[styles.badgeOrangeText, { color: '#666' }]}>ยังไม่ได้ส่งเอกสาร</Text></View>
              </View>
            )}

            {clinicStatus === 'pass' && (
              <View style={styles.badgeRow}>
                <View style={styles.badgePurple}>
                  <Text style={styles.badgePurpleText}>
                    {clinicRole === 'owner' ? `เป็นเจ้าของ${clinicName}` : `เป็นสัตวแพทย์ประจำ${clinicName}`}
                  </Text>
                </View>
              </View>
            )}
          </View>
        </View>

        {isFullyVerified && clinicRole === 'owner' && (
          <View style={styles.switchModeContainer}>
            <TouchableOpacity style={styles.switchModeBtn} onPress={switchToClinicMode}>
              <View style={styles.switchIconBg}>
                <MaterialCommunityIcons name="domain" size={24} color="#FFF" />
              </View>
              <View style={styles.switchTextContainer}>
                <Text style={styles.switchModeTitle}>สลับเป็นโหมดสถานพยาบาล</Text>
                <Text style={styles.switchModeSub}>เปลี่ยนไปจัดการข้อมูลและนัดหมายคลินิก</Text>
              </View>
              <Feather name="chevron-right" size={24} color="#0055B3" />
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.tabSwitcher}>
          <TouchableOpacity style={[styles.tabItem, activeTab === 'info' && styles.tabItemActive]} onPress={() => setActiveTab('info')}>
            <Text style={[styles.tabText, activeTab === 'info' && styles.tabTextActive]}>ข้อมูลผู้ใช้</Text>
          </TouchableOpacity>

          {clinicRole !== 'staff' && (
            <TouchableOpacity style={[styles.tabItem, activeTab === 'clinic' && styles.tabItemActive]} onPress={() => setActiveTab('clinic')}>
              <Text style={[styles.tabText, activeTab === 'clinic' && styles.tabTextActive]}>คลินิก</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity style={[styles.tabItem, activeTab === 'verification' && styles.tabItemActive]} onPress={() => setActiveTab('verification')}>
            <Text style={[styles.tabText, activeTab === 'verification' && styles.tabTextActive]}>ยืนยันตัวตน</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.tabContent}>
          {activeTab === 'info' && (
            <View>
              <View style={styles.cardBox}>
                <Text style={styles.infoLabel}>ชื่อ-นามสกุล</Text><Text style={styles.infoValue}>{vetProfile.name}</Text>
                <Text style={styles.infoLabel}>อีเมล</Text><Text style={styles.infoValue}>{vetProfile.email}</Text>
                <Text style={styles.infoLabel}>เบอร์โทร</Text><Text style={styles.infoValue}>{vetProfile.phone}</Text>
              </View>
              <TouchableOpacity style={styles.outlineButton} onPress={() => Alert.alert('เปลี่ยนรหัสผ่าน', 'เข้าสู่หน้าเปลี่ยนรหัสผ่าน')}><Text style={styles.outlineButtonText}>เปลี่ยนรหัสผ่าน</Text></TouchableOpacity>
              <TouchableOpacity style={styles.outlineButton} onPress={handleLogout}><Text style={styles.outlineButtonText}>ออกจากระบบ</Text></TouchableOpacity>
            </View>
          )}

          {activeTab === 'clinic' && clinicRole !== 'staff' && (
            <Clinic
              vetProfile={vetProfile}
              verificationStatus={verificationStatus}
              clinicStatus={clinicStatus}
              setClinicStatus={setClinicStatus}
              clinicDetail={clinicDetail}
              clinicSubmittedDocs={clinicSubmittedDocs}
            />
          )}

          {activeTab === 'verification' && (
            <Verify
              vetProfile={vetProfile}
              verificationStatus={verificationStatus}
              setVerificationStatus={setVerificationStatus}
              verificationDetail={verificationDetail}
              submittedDocs={submittedDocs}
            />
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
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

  switchModeContainer: { paddingHorizontal: 16, marginTop: 20 },
  switchModeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E3F2FD',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#90CAF9',
  },
  switchIconBg: {
    backgroundColor: '#0055B3',
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  switchTextContainer: { flex: 1 },
  switchModeTitle: { fontSize: 16, fontWeight: 'bold', color: '#0055B3', marginBottom: 4 },
  switchModeSub: { fontSize: 12, color: '#5A7584' },

  tabSwitcher: { flexDirection: 'row', backgroundColor: '#F5F5F5', marginHorizontal: 16, marginTop: 20, marginBottom: 16, borderRadius: 10, padding: 4 },
  tabItem: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 8 },
  tabItemActive: { backgroundColor: '#FFFFFF', elevation: 1 },
  tabText: { fontSize: 13, color: '#888', fontWeight: 'bold' },
  tabTextActive: { color: '#00B862' },

  tabContent: { paddingHorizontal: 16 },
  cardBox: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#EAEAEC' },
  infoLabel: { fontSize: 13, fontWeight: 'bold', color: '#1A1A1A', marginTop: 10 },
  infoValue: { fontSize: 12, color: '#666', marginTop: 4 },
  outlineButton: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EAEAEC', height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  outlineButtonText: { fontSize: 14, color: '#1A1A1A', fontWeight: 'bold' },
});
import React, { useState, useCallback } from 'react';
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, Alert, RefreshControl, ActivityIndicator } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as SecureStore from "expo-secure-store";
import { useFocusEffect } from '@react-navigation/native';
import { API_URL } from '../../config';

export default function Profile({ navigation, setIsLoggedIn }) {
  const [userData, setUserData] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  // ดึงข้อมูลโปรไฟล์สดจาก Backend Database
  const fetchLatestProfile = async () => {
    try {
      const userStr = await SecureStore.getItemAsync("user");
      const profileStr = await SecureStore.getItemAsync("pet_owners");

      if (userStr) setUserData(JSON.parse(userStr));

      if (profileStr) {
        const localProfile = JSON.parse(profileStr);
        const ownerId = localProfile.pet_owner_id ?? localProfile.pet_owners_id;

        const response = await fetch(`${API_URL}/profile/petowner/${ownerId}`);
        if (response.ok) {
          const freshProfile = await response.json();
          setProfileData(freshProfile);
          await SecureStore.setItemAsync("pet_owners", JSON.stringify(freshProfile));
        } else {
          setProfileData(localProfile);
        }
      }
    } catch (error) {
      console.log("Fetch Profile Error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchLatestProfile();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchLatestProfile();
  };

  const handleLogout = () => {
    Alert.alert("ออกจากระบบ", "คุณต้องการออกจากระบบหรือไม่?", [
      { text: "ยกเลิก", style: "cancel" },
      {
        text: "ออกจากระบบ",
        style: "destructive",
        onPress: async () => {
          await SecureStore.deleteItemAsync("token");
          await SecureStore.deleteItemAsync("user");
          await SecureStore.deleteItemAsync("pet_owners");
          setIsLoggedIn(false);
        },
      },
    ]);
  };

  const displayName = profileData?.first_name
    ? `${profileData.first_name} ${profileData.last_name || ''}`.trim()
    : (profileData?.username || 'เจ้าของสัตว์เลี้ยง');

  const translateGender = (gender) => {
    switch (gender) {
      case 'male': return 'ชาย';
      case 'female': return 'หญิง';
      case 'other': return 'อื่นๆ';
      case 'prefer_not_to_say': return 'ไม่ระบุ';
      default: return 'ไม่ระบุ';
    }
  };

  const formatAddress = () => {
    if (!profileData) return 'ยังไม่ได้กรอกข้อมูลที่อยู่';
    const parts = [
      profileData.address_line,
      profileData.subdistrict ? `ต.${profileData.subdistrict}` : null,
      profileData.district ? `อ.${profileData.district}` : null,
      profileData.province ? `จ.${profileData.province}` : null,
      profileData.postal_code,
    ].filter(Boolean);

    return parts.length > 0 ? parts.join(' ') : 'ยังไม่ได้กรอกข้อมูลที่อยู่';
  };

  const handleRequestChangePassword = () => {
    if (!userData?.email) {
      return Alert.alert("แจ้งเตือน", "ไม่พบข้อมูลอีเมลของคุณ กรุณารอโหลดข้อมูลสักครู่ หรือล็อกอินใหม่อีกครั้ง");
    }

    Alert.alert("เปลี่ยนรหัสผ่าน", "ระบบจะส่งรหัส OTP ไปที่อีเมลของคุณเพื่อยืนยันตัวตน", [
      { text: "ยกเลิก", style: "cancel" },
      {
        text: "ส่ง OTP",
        onPress: async () => {
          try {
            const response = await fetch(`${API_URL}/request-otp`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email: userData.email }),
            });

            if (response.ok) {
              navigation.navigate("ChangePasswordOTP", { email: userData.email });
            } else {
              const result = await response.json();
              Alert.alert("ผิดพลาด", result.message || "ไม่สามารถส่ง OTP ได้");
            }
          } catch (error) {
            console.log(error);
            Alert.alert("ผิดพลาด", "เชื่อมต่อเซิร์ฟเวอร์ไม่ได้");
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="light" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>โปรไฟล์</Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#96B9D7']} />
        }
      >
        {loading && !refreshing ? (
          <ActivityIndicator size="large" color="#2C4A6F" style={{ marginVertical: 40 }} />
        ) : (
          <>
            {/* Profile Card */}
            <View style={styles.profileCard}>
              <View style={styles.profileHeaderRow}>
                <View style={styles.avatarContainer}>
                  {profileData?.profile_image_url ? (
                    <Image source={{ uri: profileData.profile_image_url }} style={styles.avatarImage} />
                  ) : (
                    <Feather name="user" size={36} color="#96B9D7" />
                  )}
                </View>

                <View style={styles.profileMainInfo}>
                  <Text style={styles.nameText} numberOfLines={1}>{displayName}</Text>
                  <Text style={styles.emailText} numberOfLines={1}>{userData?.email || 'ไม่มีอีเมล'}</Text>

                  <View style={styles.badge}>
                    <MaterialCommunityIcons name="shield-check-outline" size={13} color="#2C4A6F" style={{ marginRight: 4 }} />
                    <Text style={styles.badgeText}>เจ้าของสัตว์เลี้ยง</Text>
                  </View>
                </View>
              </View>

              {/* ปุ่มแก้ไขโปรไฟล์ */}
              <TouchableOpacity
                style={styles.editProfileBtn}
                onPress={() => navigation.navigate("EditProfile")}
                activeOpacity={0.85}
              >
                <Feather name="edit-2" size={14} color="#FFF" style={{ marginRight: 6 }} />
                <Text style={styles.editProfileBtnText}>แก้ไขโปรไฟล์</Text>
              </TouchableOpacity>
            </View>

            {/*ข้อมูลทั่วไป (ปรับ UI ใหม่ให้สวยงาม สบายตา) */}
            <View style={styles.infoCard}>
              <Text style={styles.infoSectionTitle}>ข้อมูลทั่วไป</Text>

              <View style={styles.infoRow}>
                <View style={styles.infoLabelGroup}>
                  <Feather name="user" size={16} color="#5C8BB6" style={{ marginRight: 8 }} />
                  <Text style={styles.infoLabel}>เพศ</Text>
                </View>
                <Text style={styles.infoValue}>{translateGender(profileData?.gender)}</Text>
              </View>

              <View style={styles.infoRow}>
                <View style={styles.infoLabelGroup}>
                  <Feather name="phone" size={16} color="#5C8BB6" style={{ marginRight: 8 }} />
                  <Text style={styles.infoLabel}>เบอร์โทรศัพท์</Text>
                </View>
                <Text style={styles.infoValue}>{profileData?.phone || 'ไม่ได้ระบุ'}</Text>
              </View>

              <View style={[styles.infoRow, { borderBottomWidth: 0, flexDirection: 'column', alignItems: 'flex-start', paddingBottom: 4 }]}>
                <View style={styles.infoLabelGroup}>
                  <Feather name="map-pin" size={16} color="#5C8BB6" style={{ marginRight: 8 }} />
                  <Text style={styles.infoLabel}>ที่อยู่</Text>
                </View>

                {/* บล็อกจัดแสดงที่อยู่ให้มีระเบียบ */}
                <View style={styles.addressBox}>
                  <Text style={styles.addressValueText}>{formatAddress()}</Text>
                </View>
              </View>
            </View>

            {/* Menu Items */}
            <View style={styles.menuCard}>
              <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("Clinic")} activeOpacity={0.7}>
                <View style={styles.iconWrap}>
                  <Feather name="calendar" size={18} color="#2C4A6F" />
                </View>
                <Text style={styles.menuText}>นัดหมายคลินิก</Text>
                <Feather name="chevron-right" size={18} color="#94A3B8" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("My Pets")} activeOpacity={0.7}>
                <View style={styles.iconWrap}>
                  <MaterialCommunityIcons name="paw" size={18} color="#2C4A6F" />
                </View>
                <Text style={styles.menuText}>สัตว์เลี้ยงของฉัน</Text>
                <Feather name="chevron-right" size={18} color="#94A3B8" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("Scan QR")} activeOpacity={0.7}>
                <View style={styles.iconWrap}>
                  <Feather name="camera" size={18} color="#2C4A6F" />
                </View>
                <Text style={styles.menuText}>สแกนคิวอาร์โค้ด</Text>
                <Feather name="chevron-right" size={18} color="#94A3B8" />
              </TouchableOpacity>

              <TouchableOpacity style={styles.menuItem} onPress={handleRequestChangePassword} activeOpacity={0.7}>
                <View style={styles.iconWrap}>
                  <Feather name="lock" size={18} color="#2C4A6F" />
                </View>
                <Text style={styles.menuText}>เปลี่ยนรหัสผ่าน</Text>
                <Feather name="chevron-right" size={18} color="#94A3B8" />
              </TouchableOpacity>

              <TouchableOpacity style={[styles.menuItem, { borderBottomWidth: 0 }]} onPress={handleLogout} activeOpacity={0.7}>
                <View style={[styles.iconWrap, { backgroundColor: '#FEF2F2' }]}>
                  <Feather name="log-out" size={18} color="#DC2626" />
                </View>
                <Text style={[styles.menuText, { color: '#DC2626' }]}>ออกจากระบบ</Text>
                <Feather name="chevron-right" size={18} color="#94A3B8" />
              </TouchableOpacity>
            </View>
          </>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F8FB' },
  header: {
    backgroundColor: '#20435C',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFFFFF', lineHeight: 24 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 30 },

  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2EBF2',
  },
  profileHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  avatarContainer: {
    width: 68,
    height: 68,
    borderRadius: 34,
    borderWidth: 2,
    borderColor: '#96B9D7',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    backgroundColor: '#F0F5FA',
  },
  avatarImage: { width: '100%', height: '100%' },
  profileMainInfo: { marginLeft: 14, flex: 1 },
  nameText: { fontSize: 18, fontWeight: 'bold', color: '#1E3A5F' },
  emailText: { fontSize: 13, color: '#64748B', marginTop: 2, marginBottom: 6 },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EBF3FA',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  badgeText: { fontSize: 11, color: '#2C4A6F', fontWeight: 'bold' },

  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2C4A6F',
    height: 40,
    borderRadius: 10,
  },
  editProfileBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: 'bold' },

  //สไตล์ใหม่ของการ์ด "ข้อมูลทั่วไป"
  infoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2EBF2',
  },
  infoSectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1E3A5F',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 8
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC'
  },
  infoLabelGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoLabel: { fontSize: 13, color: '#64748B', fontWeight: '500' },
  infoValue: { fontSize: 13, fontWeight: 'bold', color: '#1E3A5F' },

  addressBox: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  addressValueText: { fontSize: 13, color: '#1E3A5F', lineHeight: 20, fontWeight: '500' },

  menuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: '#E2EBF2',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#EBF3FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  menuText: { flex: 1, fontSize: 14, fontWeight: '600', color: '#1E3A5F' },
});
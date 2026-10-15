import React, { useState, useCallback } from 'react';
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ImageBackground, Image, Alert } from "react-native";
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as SecureStore from "expo-secure-store";
import { useFocusEffect } from '@react-navigation/native';
import { API_URL } from '../../config';

export default function Profile({ navigation, setIsLoggedIn }) {
  const [userData, setUserData] = useState(null);
  const [profileData, setProfileData] = useState(null);

  useFocusEffect(
    useCallback(() => {
      const loadData = async () => {
        const userStr = await SecureStore.getItemAsync("user");
        const profileStr = await SecureStore.getItemAsync("pet_owners");
        if (userStr) setUserData(JSON.parse(userStr));
        if (profileStr) setProfileData(JSON.parse(profileStr));
      };
      loadData();
    }, [])
  );

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

  const displayName = profileData?.username || profileData?.first_name || 'Pet Owner';

  const handleRequestChangePassword = () => {
    // 1. ดักไว้ก่อนว่าถ้ายังโหลดอีเมลไม่เสร็จ ห้ามกด
    if (!userData?.email) {
      return Alert.alert("แจ้งเตือน", "ไม่พบข้อมูลอีเมลของคุณ กรุณารอโหลดข้อมูลสักครู่ หรือล็อกอินใหม่อีกครั้ง");
    }

    Alert.alert("เปลี่ยนรหัสผ่าน", "ระบบจะส่งรหัส OTP ไปที่อีเมลของคุณเพื่อยืนยันตัวตน", [
      { text: "ยกเลิก", style: "cancel" },
      {
        text: "ส่ง OTP",
        onPress: async () => {
          try {
            // 2. เรียก API ส่ง OTP
            const response = await fetch(`${API_URL}/request-otp`, {
              method: "POST", headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email: userData.email }),
            });
            
            // 3. ถ้าส่งสำเร็จ ให้เด้งไปหน้า "กรอก OTP" (ChangePasswordOTP) ไม่ใช่หน้าตั้งรหัสผ่าน
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
    <ImageBackground source={require('../../../src/public/pictures/background-welcome.png')} style={styles.background}>
      <StatusBar style="dark" />
      
      <View style={styles.container}>
        <Text style={styles.headerTitle}>โปรไฟล์ของคุณ</Text>

        <View style={styles.profileCard}>
          <View style={styles.avatarContainer}>
            {profileData?.profile_image_url ? (
              <Image source={{ uri: profileData.profile_image_url }} style={styles.avatarImage} />
            ) : (
              <Feather name="user" size={40} color="#8EB4D0" />
            )}
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.nameText}>{displayName}</Text>
            <Text style={styles.emailText}>{userData?.email}</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>เจ้าของสัตว์เลี้ยง</Text>
            </View>
          </View>
        </View>

        <ScrollView style={styles.menuContainer} showsVerticalScrollIndicator={false}>
          
          {/* 🟢 เปลี่ยนเป็น นัดหมายคลินิก (ลิงก์ไปแท็บ Clinic) */}
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("Clinic")}>
            <Feather name="calendar" size={20} color="#8EB4D0" style={styles.menuIcon} />
            <Text style={styles.menuText}>นัดหมายคลินิก</Text>
            <Feather name="chevron-right" size={20} color="#CCC" />
          </TouchableOpacity>

          {/* 🟢 ลิงก์ไปแท็บ My Pets */}
          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("My Pets")}>
            <MaterialCommunityIcons name="paw" size={20} color="#8EB4D0" style={styles.menuIcon} />
            <Text style={styles.menuText}>สัตว์เลี้ยงของฉัน</Text>
            <Feather name="chevron-right" size={20} color="#CCC" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("Scan QR")}>
            <Feather name="camera" size={20} color="#8EB4D0" style={styles.menuIcon} />
            <Text style={styles.menuText}>สแกนคิวอาร์โค้ด</Text>
            <Feather name="chevron-right" size={20} color="#CCC" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => navigation.navigate("EditProfile")}>
            <Feather name="edit" size={20} color="#8EB4D0" style={styles.menuIcon} />
            <Text style={styles.menuText}>แก้ไขโปรไฟล์</Text>
            <Feather name="chevron-right" size={20} color="#CCC" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem}>
            <Feather name="bell" size={20} color="#8EB4D0" style={styles.menuIcon} />
            <Text style={styles.menuText}>การแจ้งเตือน</Text>
            <Feather name="chevron-right" size={20} color="#CCC" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={handleRequestChangePassword}>
            <Feather name="lock" size={20} color="#8EB4D0" style={styles.menuIcon} />
            <Text style={styles.menuText}>เปลี่ยนรหัสผ่าน</Text>
            <Feather name="chevron-right" size={20} color="#CCC" />
          </TouchableOpacity>

          <TouchableOpacity style={[styles.menuItem, { borderBottomWidth: 0 }]} onPress={handleLogout}>
            <Feather name="log-out" size={20} color="#D32F2F" style={styles.menuIcon} />
            <Text style={[styles.menuText, { color: '#D32F2F' }]}>ออกจากระบบ</Text>
            <Feather name="chevron-right" size={20} color="#CCC" />
          </TouchableOpacity>

          

        </ScrollView>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: { flex: 1, width: '100%' },
  container: { flex: 1, paddingHorizontal: 20, paddingTop: 60 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#5A7584', marginBottom: 20 },
  profileCard: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderRadius: 15, padding: 20, alignItems: 'center', elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, marginBottom: 25 },
  avatarContainer: { width: 70, height: 70, borderRadius: 35, borderWidth: 3, borderColor: '#5A7584', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', backgroundColor: '#F0F4F8' },
  avatarImage: { width: '100%', height: '100%' },
  profileInfo: { marginLeft: 20, flex: 1 },
  nameText: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  emailText: { fontSize: 13, color: '#888', marginBottom: 5 },
  badge: { backgroundColor: '#E1F5FE', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-start' },
  badgeText: { fontSize: 12, color: '#0288D1', fontWeight: 'bold' },
  menuContainer: { backgroundColor: '#FFFFFF', borderRadius: 15, paddingHorizontal: 15, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 5, marginBottom: 30 },
  menuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  menuIcon: { marginRight: 15 },
  menuText: { flex: 1, fontSize: 15, color: '#444' },
});
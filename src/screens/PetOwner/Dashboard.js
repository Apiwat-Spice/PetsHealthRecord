import { StatusBar } from "expo-status-bar";
import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Image
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as SecureStore from 'expo-secure-store';
import { useFocusEffect } from '@react-navigation/native';
import { API_URL } from '../../config';

export default function Dashboard({ navigation }) {
  const [ownerName, setOwnerName] = useState("");
  const [ownerImage, setOwnerImage] = useState(""); // 🟢 เพิ่ม state เก็บรูปโปรไฟล์เจ้าของ
  const [dashboardData, setDashboardData] = useState({
    petCount: 0,
    pendingCount: 0,
    historyCount: 0,
    upcoming: null,
    recentHistories: []
  });
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const ownerString = await SecureStore.getItemAsync('pet_owners');
      if (ownerString) {
        const owner = JSON.parse(ownerString);
        setOwnerName(owner.first_name || owner.pet_owner_name || "คุณลูกค้า");
        setOwnerImage(owner.profile_image_url || ""); // 🟢 ดึงลิงก์รูปโปรไฟล์เจ้าของ

        const ownerId = owner.pet_owner_id ?? owner.pet_owners_id;

        const response = await fetch(`${API_URL}/pets/dashboard/${ownerId}`);
        if (response.ok) {
          const data = await response.json();
          setDashboardData(data);
        }
      }
    } catch (error) {
      console.log("Fetch Dashboard Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDashboardData();
    }, [])
  );

  const translateTreatmentType = (type) => {
    if (!type) return 'ประวัติการรักษา';
    switch (type.trim()) {
      case 'Health Checkup': return 'ตรวจสุขภาพประจำปี';
      case 'Vaccination': return 'ฉีดวัคซีน';
      case 'Sick Visit / Consultation': return 'ตรวจรักษาอาการป่วย';
      case 'Spay / Neuter': return 'ทำหมัน';
      case 'Grooming / Boarding': return 'อาบน้ำตัดขน / ฝากเลี้ยง';
      default: return type;
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#FFF' }}>
        <ActivityIndicator size="large" color="#0056D2" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" />
      <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Header Section */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>สวัสดี, {ownerName}</Text>
            <Text style={styles.subGreeting}>ยินดีต้อนรับสู่แดชบอร์ดดูแลสัตว์เลี้ยง</Text>
          </View>

          {/* 🟢 แสดงรูปโปรไฟล์เจ้าของที่มุมขวาบน (กดแล้วไปหน้าโปรไฟล์ได้) */}
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={() => navigation.navigate('Profile')}
          >
            {ownerImage ? (
              <Image source={{ uri: ownerImage }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Feather name="user" size={22} color="#FFF" />
              </View>
            )}
          </TouchableOpacity>
        </View>

        {dashboardData.pendingCount > 0 && (
          <TouchableOpacity
            style={styles.alertBanner}
            activeOpacity={0.8}
            onPress={() => {
              navigation.navigate('Clinic', {
                switchTab: 'history',
                initialFilter: 'pending'
              });
            }}
          >
            <View style={styles.alertIconContainer}>
              <Feather name="bell" size={20} color="#D97706" />
            </View>
            <View style={styles.alertTextContainer}>
              <Text style={styles.alertTitle}>
                มีคำขอนัดหมายรออนุมัติ ({dashboardData.pendingCount} รายการ)
              </Text>
              <Text style={styles.alertSubTitle}>
                แตะเพื่อตรวจสอบสถานะการนัดหมายกับทางคลินิก
              </Text>
            </View>
            <Feather name="chevron-right" size={20} color="#D97706" />
          </TouchableOpacity>
        )}

        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          <TouchableOpacity
            style={[styles.summaryCard, styles.cardDarkBlue]}
            activeOpacity={0.9}
            onPress={() => navigation.navigate('MyPets')}
          >
            <View style={styles.summaryIconBox}>
              <MaterialCommunityIcons name="paw" size={20} color="#FFF" />
            </View>
            <Text style={styles.summaryLabel}>สัตว์เลี้ยงของคุณ</Text>
            <Text style={styles.summaryNumber}>{dashboardData.petCount} ตัว</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.summaryCard, styles.cardLightBlue]}
            activeOpacity={0.9}
            onPress={() => navigation.navigate('AllVisitHistory')}
          >
            <View style={styles.summaryIconBox}>
              <Feather name="clock" size={18} color="#FFF" />
            </View>
            <Text style={styles.summaryLabel}>ประวัติทั้งหมด</Text>
            <Text style={styles.summaryNumber}>{dashboardData.historyCount} รายการ</Text>
          </TouchableOpacity>
        </View>

        {/* Upcoming Appointment */}
        <View style={styles.sectionHeader}>
          <Feather name="calendar" size={18} color="#E59230" />
          <Text style={[styles.sectionTitle, { color: "#E59230" }]}> นัดหมายล่วงหน้า</Text>
        </View>

        {dashboardData.upcoming ? (
          <TouchableOpacity
            style={styles.upcomingCard}
            activeOpacity={0.9}
            onPress={() => navigation.navigate('AppointmentDetail', { appointmentId: dashboardData.upcoming.appointment_id })}
          >
            <View style={styles.rowBetween}>
              <Text style={styles.upcomingTitle}>{translateTreatmentType(dashboardData.upcoming.title) || 'นัดหมายเข้ารับบริการ'}</Text>
              <View style={styles.badgeSoon}>
                <Text style={styles.badgeSoonText}>ยืนยันแล้ว</Text>
              </View>
            </View>

            <View style={styles.dateRow}>
              <Feather name="calendar" size={14} color="#888" style={{ marginRight: 6 }} />
              <Text style={styles.dateText}>
                วันที่ {dashboardData.upcoming.appointment_date} เวลา {dashboardData.upcoming.appointment_time?.substring(0, 5)} น.
              </Text>
            </View>

            <View style={styles.rowBetween}>
              <View style={styles.badgePetOrange}>
                <Text style={[styles.badgePetText, { color: "#F59E0B", fontSize: 11, fontWeight: "bold" }]}>{dashboardData.upcoming.pet_name}</Text>
              </View>
              <Text style={styles.clinicName}>
                {dashboardData.upcoming.clinic_name}
              </Text>
            </View>
          </TouchableOpacity>
        ) : (
          <View style={[styles.upcomingCard, styles.emptyCard]}>
            <Feather name="calendar" size={28} color="#CCC" style={{ marginBottom: 6 }} />
            <Text style={styles.emptyText}>ไม่มีรายการนัดหมายที่ยืนยันแล้วในขณะนี้</Text>
          </View>
        )}

        {/* Recent History */}
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="heart-pulse" size={20} color="#0056D2" />
          <Text style={[styles.sectionTitle, { color: "#0056D2" }]}> ประวัติการรักษาล่าสุด</Text>
        </View>

        {dashboardData.recentHistories && dashboardData.recentHistories.length > 0 ? (
          dashboardData.recentHistories.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.historyCard}
              activeOpacity={0.9}
              onPress={() => {
                if (item.pet_id) {
                  navigation.navigate('PetDetail', {
                    petId: item.pet_id,
                    initialTab: 'health'
                  });
                }
              }}
            >
              <View style={styles.rowBetween}>
                <Text style={styles.historyTitle} numberOfLines={1}>
                  {translateTreatmentType(
                    item.appointments?.title ||
                    item.appointments?.type ||
                    item.treatment
                  )}
                </Text>
                <View style={styles.badgeDate}>
                  <Text style={styles.badgeDateText}>{item.visit_date}</Text>
                </View>
              </View>

              <Text style={styles.historyDesc} numberOfLines={1}>
                {item.diagnosis || item.symptoms || 'บันทึกการเข้ารับบริการเรียบร้อย'}
              </Text>
              <View style={[styles.rowBetween, { marginTop: 12, alignItems: 'flex-end' }]}>
                <View style={styles.badgePetBlue}>
                  <Text style={[styles.badgePetText, { color: "#0056D2", fontSize: 11, fontWeight: "bold" }]}>{item.pet_name}</Text>
                </View>

                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.historyVetText}>
                    {item.vet_name}
                  </Text>
                  <Text style={styles.historyClinicText}>
                    {item.clinic_name}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        ) : (
          <View style={[styles.historyCard, styles.emptyCard]}>
            <MaterialCommunityIcons name="clipboard-text-outline" size={28} color="#CCC" style={{ marginBottom: 6 }} />
            <Text style={styles.emptyText}>ยังไม่มีประวัติการรักษาในระบบ</Text>
          </View>
        )}

        <View style={{ height: 30 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F8FBFF" },
  container: { flex: 1, backgroundColor: "#F8FBFF" },
  scrollContent: { paddingHorizontal: 20, paddingTop: 15 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 18 },
  greeting: { fontSize: 20, fontWeight: "bold", color: "#0056D2" },
  subGreeting: { fontSize: 13, color: "#666", marginTop: 2 },
  avatarPlaceholder: { width: 42, height: 42, borderRadius: 21, backgroundColor: "#0056D2", justifyContent: 'center', alignItems: 'center' },
  avatarImage: { width: 42, height: 42, borderRadius: 21, borderWidth: 1.5, borderColor: '#0056D2' }, // 🟢 เพิ่มสไตล์สำหรับรูปโปรไฟล์เจ้าของ
  alertBanner: {
    flexDirection: "row",
    backgroundColor: "#FFFBEB",
    borderLeftWidth: 5,
    borderLeftColor: "#F59E0B",
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FEF3C7",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2
  },
  alertIconContainer: { marginRight: 12, backgroundColor: "#FEF9C3", padding: 8, borderRadius: 10 },
  alertTextContainer: { flex: 1 },
  alertTitle: { fontSize: 13, fontWeight: "bold", color: "#92400E" },
  alertSubTitle: { fontSize: 11, color: "#B45309", marginTop: 2 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 20 },
  summaryCard: { width: "48%", borderRadius: 14, padding: 16, justifyContent: "center", shadowColor: "#000", shadowOffset: { width: 0, height: 3 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  cardDarkBlue: { backgroundColor: "#003B95" },
  cardLightBlue: { backgroundColor: "#0056D2" },
  summaryIconBox: { marginBottom: 8 },
  summaryLabel: { color: "#E0EFFF", fontSize: 13, marginBottom: 4 },
  summaryNumber: { color: "#FFFFFF", fontSize: 22, fontWeight: "bold" },
  sectionHeader: { flexDirection: "row", alignItems: "center", marginBottom: 10, marginTop: 5 },
  sectionTitle: { fontSize: 16, fontWeight: "bold" },
  upcomingCard: {
    backgroundColor: "#FFFDF9",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#FCE7D2",
    padding: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 3
  },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  upcomingTitle: { fontSize: 15, fontWeight: "bold", color: "#D97706" },
  badgeSoon: { backgroundColor: "#F59E0B", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeSoonText: { color: "#FFFFFF", fontSize: 11, fontWeight: "bold" },
  dateRow: { flexDirection: "row", alignItems: "center", marginVertical: 10 },
  dateText: { fontSize: 13, color: "#555", fontWeight: "600" },
  badgePetOrange: { backgroundColor: "#FEF3C7", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  badgePetBlue: { backgroundColor: "#E0F2FE", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  clinicName: { fontSize: 12, color: "#D97706", fontWeight: "bold" },
  historyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 14,
    borderLeftWidth: 5,
    borderLeftColor: "#0056D2",
    padding: 16,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#EAEAEA"
  },
  historyTitle: { fontSize: 15, fontWeight: "bold", color: "#0056D2", flex: 1, marginRight: 8 },
  badgeDate: { backgroundColor: "#E0F2FE", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  badgeDateText: { color: "#0056D2", fontSize: 10, fontWeight: "bold" },
  historyDesc: { fontSize: 13, color: "#666", marginTop: 6 },
  emptyCard: { alignItems: 'center', justifyContent: 'center', paddingVertical: 25, backgroundColor: '#FFF', borderColor: '#EEE' },
  emptyText: { color: '#888', fontSize: 13 },
  historyVetText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'right'
  },
  historyClinicText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0056D2',
    marginTop: 2,
    textAlign: 'right'
  },
});
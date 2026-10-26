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
  const [ownerImage, setOwnerImage] = useState("");
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
        setOwnerImage(owner.profile_image_url || "");

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
      case 'Grooming': return 'อาบน้ำตัดขน';
      case 'Bathing': return 'อาบน้ำ';
      case 'Haircut': return 'ตัดขน';
      case 'Boarding': return 'ฝากเลี้ยง';
      case 'Grooming / Boarding': return 'อาบน้ำตัดขน / ฝากเลี้ยง';
      default: return type;
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#96B9D7" />
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
            <Text style={styles.subGreeting}>ยินดีต้อนรับสู่ระบบดูแลสัตว์เลี้ยง</Text>
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => navigation.navigate('Profile')}
            style={styles.avatarTouchable}
          >
            {ownerImage ? (
              <Image source={{ uri: ownerImage }} style={styles.avatarImage} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Feather name="user" size={20} color="#FFF" />
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Alert Banner */}
        {dashboardData.pendingCount > 0 && (
          <TouchableOpacity
            style={styles.alertBanner}
            activeOpacity={0.85}
            onPress={() => {
              navigation.navigate('Clinic', {
                switchTab: 'history',
                initialFilter: 'pending'
              });
            }}
          >
            <View style={styles.alertIconContainer}>
              <Feather name="bell" size={18} color="#D97706" />
            </View>
            <View style={styles.alertTextContainer}>
              <Text style={styles.alertTitle}>
                มีคำขอนัดหมายรออนุมัติ ({dashboardData.pendingCount} รายการ)
              </Text>
              <Text style={styles.alertSubTitle}>
                แตะเพื่อตรวจสอบสถานะกับทางคลินิก
              </Text>
            </View>
            <Feather name="chevron-right" size={18} color="#D97706" />
          </TouchableOpacity>
        )}

        {/* Summary Cards */}
        <View style={styles.summaryRow}>
          <TouchableOpacity
            style={[styles.summaryCard, styles.cardDeepBlue]}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('MyPets')}
          >
            <View style={styles.summaryIconBox}>
              <MaterialCommunityIcons name="paw" size={22} color="#FFF" />
            </View>
            <Text style={styles.summaryLabel}>สัตว์เลี้ยงของคุณ</Text>
            <Text style={styles.summaryNumber}>{dashboardData.petCount} ตัว</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.summaryCard, styles.cardSoftBlue]}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('AllVisitHistory')}
          >
            <View style={styles.summaryIconBox}>
              <Feather name="clock" size={20} color="#FFF" />
            </View>
            <Text style={styles.summaryLabel}>ประวัติทั้งหมด</Text>
            <Text style={styles.summaryNumber}>{dashboardData.historyCount} รายการ</Text>
          </TouchableOpacity>
        </View>

        {/* Upcoming Appointment Section */}
        <View style={styles.sectionHeader}>
          <Feather name="calendar" size={16} color="#D97706" style={{ marginRight: 6 }} />
          <Text style={[styles.sectionTitle, { color: "#D97706" }]}>นัดหมายล่วงหน้า</Text>
        </View>

        {dashboardData.upcoming ? (
          <TouchableOpacity
            style={styles.upcomingCard}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('AppointmentDetail', { appointmentId: dashboardData.upcoming.appointment_id })}
          >
            <View style={styles.rowBetween}>
              <Text style={styles.upcomingTitle}>{translateTreatmentType(dashboardData.upcoming.title)}</Text>
              <View style={styles.badgeSoon}>
                <Text style={styles.badgeSoonText}>ยืนยันแล้ว</Text>
              </View>
            </View>

            <View style={styles.dateRow}>
              <Feather name="clock" size={13} color="#D97706" style={{ marginRight: 6 }} />
              <Text style={styles.dateText}>
                {dashboardData.upcoming.appointment_date} • {dashboardData.upcoming.appointment_time?.substring(0, 5)} น.
              </Text>
            </View>

            <View style={styles.rowBetween}>
              <View style={styles.badgePetOrange}>
                <Text style={styles.badgePetOrangeText}>{dashboardData.upcoming.pet_name}</Text>
              </View>
              <Text style={styles.clinicName}>
                {dashboardData.upcoming.clinic_name}
              </Text>
            </View>
          </TouchableOpacity>
        ) : (
          /* 🟢 ปรับสีไอคอนและข้อความข้างในให้เป็นส้ม-น้ำตาล เข้ากับหัวข้อนัดหมาย */
          <View style={[styles.upcomingCard, styles.emptyCardUpcoming]}>
            <Feather name="calendar" size={28} color="#D97706" style={{ marginBottom: 6 }} />
            <Text style={styles.emptyUpcomingText}>ไม่มีรายการนัดหมายที่ยืนยันแล้วในขณะนี้</Text>
          </View>
        )}

        {/* Recent History Section */}
        <View style={styles.sectionHeader}>
          <MaterialCommunityIcons name="heart-pulse" size={18} color="#5C8BB6" style={{ marginRight: 6 }} />
          <Text style={[styles.sectionTitle, { color: "#1E3A5F" }]}>ประวัติการรักษาล่าสุด</Text>
        </View>

        {dashboardData.recentHistories && dashboardData.recentHistories.length > 0 ? (
          dashboardData.recentHistories.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.historyCard}
              activeOpacity={0.85}
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
                  <MaterialCommunityIcons name="paw" size={12} color="#2C4A6F" style={{ marginRight: 4 }} />
                  <Text style={styles.badgePetBlueText}>{item.pet_name}</Text>
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
          <View style={[styles.historyCard, styles.emptyCardHistory]}>
            <MaterialCommunityIcons name="clipboard-text-outline" size={28} color="#5C8BB6" style={{ marginBottom: 6 }} />
            <Text style={styles.emptyHistoryText}>ยังไม่มีประวัติการรักษาในระบบ</Text>
          </View>
        )}

        <View style={{ height: 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#F4F8FB" },
  container: { flex: 1, backgroundColor: "#F4F8FB" },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F4F8FB' },
  scrollContent: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 30 },

  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  greeting: { fontSize: 20, fontWeight: "bold", color: "#1E3A5F" },
  subGreeting: { fontSize: 13, color: "#64748B", marginTop: 2 },
  avatarTouchable: { padding: 2 },
  avatarPlaceholder: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#96B9D7", justifyContent: 'center', alignItems: 'center' },
  avatarImage: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: '#FFFFFF' },

  alertBanner: {
    flexDirection: "row",
    backgroundColor: "#FFFBEB",
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#FDE68A",
  },
  alertIconContainer: { marginRight: 10, backgroundColor: "#FEF3C7", padding: 8, borderRadius: 10 },
  alertTextContainer: { flex: 1 },
  alertTitle: { fontSize: 13, fontWeight: "bold", color: "#B45309" },
  alertSubTitle: { fontSize: 11, color: "#D97706", marginTop: 2 },

  summaryRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 16 },
  summaryCard: {
    width: "48%",
    borderRadius: 16,
    padding: 16,
    justifyContent: "center",
  },
  cardDeepBlue: { backgroundColor: "#2C4A6F" },
  cardSoftBlue: { backgroundColor: "#7CA4CC" },
  summaryIconBox: { marginBottom: 8 },
  summaryLabel: { color: "#F0F6FA", fontSize: 12, fontWeight: "500", marginBottom: 2 },
  summaryNumber: { color: "#FFFFFF", fontSize: 22, fontWeight: "bold" },

  sectionHeader: { flexDirection: "row", alignItems: "center", marginBottom: 10, marginTop: 4 },
  sectionTitle: { fontSize: 15, fontWeight: "bold" },

  upcomingCard: {
    backgroundColor: "#FFFBEB",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FDE68A",
    padding: 16,
    marginBottom: 16,
  },
  emptyCardUpcoming: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  emptyUpcomingText: { color: '#B45309', fontSize: 13, fontWeight: '500' },

  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  upcomingTitle: { fontSize: 15, fontWeight: "bold", color: "#B45309" },
  badgeSoon: { backgroundColor: "#D97706", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeSoonText: { color: "#FFFFFF", fontSize: 11, fontWeight: "bold" },
  dateRow: { flexDirection: "row", alignItems: "center", marginVertical: 8 },
  dateText: { fontSize: 13, color: "#92400E", fontWeight: "600" },
  badgePetOrange: { backgroundColor: "#FEF3C7", paddingHorizontal: 10, paddingVertical: 3, borderRadius: 8 },
  badgePetOrangeText: { color: "#B45309", fontSize: 11, fontWeight: "bold" },
  clinicName: { fontSize: 12, color: "#D97706", fontWeight: "bold" },

  // 🟢 ลบ shadowColor/elevation เพื่อแก้ปัญหากรอบเงาสี่เหลี่ยมซ้อนด้านหลัง
  historyCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#E2EBF2",
  },
  historyTitle: { fontSize: 15, fontWeight: "bold", color: "#2C4A6F", flex: 1, marginRight: 8 },
  badgeDate: { backgroundColor: "#F0F5FA", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  badgeDateText: { color: "#5C7694", fontSize: 11, fontWeight: "600" },
  historyDesc: { fontSize: 13, color: "#475569", marginTop: 6 },

  badgePetBlue: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#EBF3FA",
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 8
  },
  badgePetBlueText: { color: "#2C4A6F", fontSize: 11, fontWeight: "bold" },

  emptyCardHistory: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    backgroundColor: '#FFFFFF',
    borderColor: '#E2EBF2',
  },
  emptyHistoryText: { color: '#5C8BB6', fontSize: 13, fontWeight: '500' },

  historyVetText: { fontSize: 11, fontWeight: 'bold', color: '#1E3A5F', textAlign: 'right' },
  historyClinicText: { fontSize: 11, fontWeight: 'bold', color: '#5C8BB6', marginTop: 2, textAlign: 'right' },
});
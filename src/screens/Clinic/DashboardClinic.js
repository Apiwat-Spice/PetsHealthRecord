import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

export default function DashboardClinic({ navigation }) {
  const clinicInfo = {
    clinicName: 'คลินิกรักษาสัตว์ HappyPet',
    role: 'ผู้ดูแล',
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="#9C27B0" />

      {/* Header */}
      <View style={styles.headerBar}>
        <View style={styles.headerLeft}>
          <MaterialCommunityIcons name="domain" size={20} color="#FFFFFF" />
          <Text style={styles.clinicNameText}>{clinicInfo.clinicName}</Text>
        </View>
        <Text style={styles.roleText}>{clinicInfo.role}</Text>
      </View>

      <View style={styles.bodyWrapper}>
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
          <View style={styles.contentPadding}>
            
            <Text style={styles.mainTitle}>{clinicInfo.clinicName}</Text>


            {/* สมัครสัตวแพทย์*/}
            <TouchableOpacity 
              style={styles.alertBannerBlue} 
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Team')}
            >
              <Feather name="user" size={16} color="#1976D2" style={styles.alertIcon} />
              <Text style={styles.alertTextBlue}>คำขอสมัครสัตวแพทย์ 1 รายการ รออนุมัติ</Text>
              <Text style={styles.alertActionBlue}>ดู</Text>
            </TouchableOpacity>

            {/*นัดหมาย*/}
            <TouchableOpacity 
              style={styles.alertBannerOrange} 
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Date')}
            >
              <Feather name="calendar" size={16} color="#F57C00" style={styles.alertIcon} />
              <Text style={styles.alertTextOrange}>คำขอนัดหมาย 1 รายการ รออนุมัติ</Text>
              <Text style={styles.alertActionOrange}>ดู</Text>
            </TouchableOpacity>

            {/* กล่องจำนวนแจ้งเตือน */}
            <View style={styles.statsRow}>
              <View style={[styles.statBox, { backgroundColor: '#9C27B0' }]}>
                <Text style={styles.statNumber}>1</Text>
                <Text style={styles.statLabel}>สัตวแพทย์</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: '#007BFF' }]}>
                <Text style={styles.statNumber}>1</Text>
                <Text style={styles.statLabel}>พนักงาน</Text>
              </View>
              <View style={[styles.statBox, { backgroundColor: '#FF8C00' }]}>
                <Text style={styles.statNumber}>2</Text>
                <Text style={styles.statLabel}>นัดหมาย</Text>
              </View>
            </View>

            {/* สัตวแพทย์ในคลินิก */}
            <View style={styles.sectionHeader}>
              <MaterialCommunityIcons name="medical-bag" size={22} color="#9C27B0" style={styles.sectionIcon} />
              <Text style={styles.sectionTitlePurple}>สัตวแพทย์ในคลินิก</Text>
            </View>

            <View style={styles.vetCard}>
              <View style={styles.vetCardInfoRow}>
                <View style={styles.avatarCircle}>
                  <Feather name="user" size={24} color="#1A1A1A" />
                </View>
                <View style={styles.vetDetail}>
                  <Text style={styles.vetName}>น.สพ ใจดี สุขสันต์</Text>
                  <Text style={styles.vetLicense}>XXXX-XXXX</Text>
                </View>
                <View style={styles.badgeCyan}>
                  <Text style={styles.badgeCyanText}>ประจำการ</Text>
                </View>
              </View>

              {/* จัดการสัตวแพทย์*/}
              <TouchableOpacity 
                style={styles.manageBtn}
                onPress={() => navigation.navigate('Team')}
              >
                <Feather name="user" size={14} color="#9C27B0" style={{ marginRight: 6 }} />
                <Text style={styles.manageBtnText}>จัดการ</Text>
              </TouchableOpacity>
            </View>

            {/* นัดหมายล่าสุด */}
            <View style={[styles.sectionHeader, { marginTop: 24 }]}>
              <Feather name="calendar" size={20} color="#F57C00" style={styles.sectionIcon} />
              <Text style={styles.sectionTitleOrange}>นัดหมายล่าสุด</Text>
            </View>

            {/* การ์ดนัดหมาย 1 */}
            <View style={[styles.apptCard, styles.apptCardGreen]}>
              <View style={styles.apptHeaderRow}>
                <Text style={styles.apptTitleGreen}>ฉีดวัคซีนพิษสุนัขบ้าประจำปี</Text>
                <View style={styles.badgeGreen}>
                  <Text style={styles.badgeGreenText}>อนุมัติแล้ว</Text>
                </View>
              </View>
              <Text style={styles.apptSubText}>หมูเด้ง - 2025-05-17 เวลา 10.00น.</Text>
            </View>

            {/* การ์ดนัดหมาย 2 */}
            <View style={[styles.apptCard, styles.apptCardOrange]}>
              <View style={styles.apptHeaderRow}>
                <Text style={styles.apptTitleOrange}>ฉีดวัคซีนพิษสุนัขบ้าประจำปี</Text>
                <View style={styles.badgeOrange}>
                  <Text style={styles.badgeOrangeText}>ยังไม่อนุมัติ</Text>
                </View>
              </View>
              <Text style={styles.apptSubText}>หมูเด้ง - 2027-05-17 เวลา 10.00น.</Text>
            </View>

            {/* ดูนัดหมายทั้งหมด*/}
            <TouchableOpacity 
              style={styles.viewAllBtn}
              onPress={() => navigation.navigate('Date')}
            >
              <Text style={styles.viewAllBtnText}>ดูนัดหมายทั้งหมด(2)</Text>
            </TouchableOpacity>

            <View style={{ height: 40 }} />
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#9C27B0' },
  headerBar: { backgroundColor: '#9C27B0', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  clinicNameText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', marginLeft: 6 },
  roleText: { color: '#FFFFFF', fontSize: 13, fontWeight: 'bold' },
  bodyWrapper: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollView: { flex: 1 },
  contentPadding: { padding: 20 },
  
  mainTitle: { fontSize: 22, fontWeight: 'bold', color: '#9C27B0', marginBottom: 16 },

  // Alerts
  alertBannerBlue: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E3F2FD', borderWidth: 1, borderColor: '#64B5F6', borderRadius: 8, padding: 12, marginBottom: 10 },
  alertIcon: { marginRight: 10 },
  alertTextBlue: { flex: 1, fontSize: 13, color: '#1976D2', fontWeight: 'bold' },
  alertActionBlue: { fontSize: 13, color: '#1976D2', fontWeight: 'bold' },

  alertBannerOrange: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF3E0', borderWidth: 1, borderColor: '#FFB74D', borderRadius: 8, padding: 12, marginBottom: 20 },
  alertTextOrange: { flex: 1, fontSize: 13, color: '#F57C00', fontWeight: 'bold' },
  alertActionOrange: { fontSize: 13, color: '#F57C00', fontWeight: 'bold' },

  // Stats
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  statBox: { flex: 1, borderRadius: 12, paddingVertical: 20, alignItems: 'center', marginHorizontal: 4, elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  statNumber: { color: '#FFFFFF', fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
  statLabel: { color: '#FFFFFF', fontSize: 12, fontWeight: '600' },

  // Sections
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  sectionIcon: { marginRight: 8 },
  sectionTitlePurple: { fontSize: 18, fontWeight: 'bold', color: '#9C27B0' },
  sectionTitleOrange: { fontSize: 18, fontWeight: 'bold', color: '#F57C00' },

  // Vet Card
  vetCard: { backgroundColor: '#FAFAFA', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#E1BEE7', marginBottom: 16 },
  vetCardInfoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  avatarCircle: { width: 44, height: 44, borderRadius: 22, borderWidth: 2, borderColor: '#333', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  vetDetail: { flex: 1 },
  vetName: { fontSize: 15, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 2 },
  vetLicense: { fontSize: 12, color: '#888' },
  badgeCyan: { backgroundColor: '#E0F7FA', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeCyanText: { color: '#00ACC1', fontSize: 10, fontWeight: 'bold' },
  manageBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E1BEE7', borderRadius: 8, paddingVertical: 8 },
  manageBtnText: { color: '#9C27B0', fontSize: 13, fontWeight: 'bold' },

  // Appt Card
  apptCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, borderWidth: 1, marginBottom: 12 },
  apptCardGreen: { borderColor: '#4CAF50' },
  apptCardOrange: { borderColor: '#FF9800' },
  apptHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  apptTitleGreen: { fontSize: 15, fontWeight: 'bold', color: '#2E7D32' },
  apptTitleOrange: { fontSize: 15, fontWeight: 'bold', color: '#EF6C00' },
  apptSubText: { fontSize: 13, color: '#333', fontWeight: '500' },
  
  badgeGreen: { backgroundColor: '#E8F5E9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeGreenText: { color: '#2E7D32', fontSize: 10, fontWeight: 'bold' },
  badgeOrange: { backgroundColor: '#FFF3E0', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeOrangeText: { color: '#EF6C00', fontSize: 10, fontWeight: 'bold' },

  viewAllBtn: { borderWidth: 1, borderColor: '#EAEAEC', borderRadius: 8, paddingVertical: 12, alignItems: 'center', marginTop: 8 },
  viewAllBtnText: { color: '#666', fontSize: 13, fontWeight: 'bold' },
});
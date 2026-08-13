import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, StatusBar, Platform, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

export default function DashboardVet() {
  const clinicInfo = { clinicName: 'คลินิกรักษาสัตว์ HappyPet', vetName: 'น.สพ.สมพง' };

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="#00B862" />

      {/* Header */}
      <View style={styles.headerBar}>
        <View style={styles.headerLeft}>
          <MaterialCommunityIcons name="plus-box" size={20} color="#FFFFFF" />
          <Text style={styles.clinicNameText}>{clinicInfo.clinicName}</Text>
        </View>
        <Text style={styles.vetNameText}>{clinicInfo.vetName}</Text>
      </View>

      <ScrollView style={styles.content} contentContainerStyle={styles.scrollPadding} showsVerticalScrollIndicator={false}>

        {/* Stats Cards */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: '#00C853' }]}>
            <Text style={styles.statTitle}>ประวัติที่บันทึก</Text>
            <View style={styles.statRowValue}>
              <Text style={styles.statNumber}>1</Text>
              <Text style={styles.statUnit}>รายการ</Text>
            </View>
          </View>
          <View style={[styles.statCard, { backgroundColor: '#EF6C00' }]}>
            <Text style={styles.statTitle}>นัดหมายที่รออยู่</Text>
            <View style={styles.statRowValue}>
              <Text style={styles.statNumber}>1</Text>
              <Text style={styles.statUnit}>รายการ</Text>
            </View>
          </View>
        </View>

        {/* ตารางนัดหมาย */}
        <View style={styles.sectionHeader}>
          <Feather name="calendar" size={18} color="#EF6C00" style={styles.sectionIcon} />
          <Text style={[styles.sectionTitleText, { color: '#EF6C00' }]}>ตารางนัดหมาย</Text>
        </View>

        <TouchableOpacity style={styles.appointmentCard} activeOpacity={0.8}>
          <Text style={styles.appTitle}>ฉีดวัคซีนพิษสุนัขบ้าประจำปี</Text>
          <View style={styles.appDateRow}>
            <Feather name="calendar" size={12} color="#888" />
            <Text style={styles.appDateText}> 2026-05-17 เวลา 10:00 น.</Text>
          </View>
          <View style={styles.appFooterRow}>
            <View style={styles.badgeOrange}><Text style={styles.badgeOrangeText}>หมูเด้ง</Text></View>
            <Text style={styles.appOwnerText}> • คุณสมชาย (เจ้าของสัตว์เลี้ยง)</Text>
          </View>
        </TouchableOpacity>

        {/* ประวัติล่าสุด */}
        <View style={[styles.sectionHeader, { marginTop: 20 }]}>
          <MaterialCommunityIcons name="heart-pulse" size={20} color="#00C853" style={styles.sectionIcon} />
          <Text style={[styles.sectionTitleText, { color: '#00C853' }]}>ประวัติล่าสุด</Text>
        </View>

        <TouchableOpacity style={styles.historyCard} activeOpacity={0.8}>
          <View style={styles.historyHeader}>
            <Text style={styles.historyTitle}>วัคซีนพิษสุนัขบ้า</Text>
            <View style={styles.badgeGreenOutline}><Text style={styles.badgeGreenOutlineText}>Vaccine</Text></View>
          </View>
          <Text style={styles.historyDetail}>ฉีดวัคซีนประจำปี ไม่มีอาการข้างเคียง</Text>
          <View style={styles.historyFooter}>
            <View style={styles.badgeGreenSolid}><Text style={styles.badgeGreenSolidText}>หมูเด้ง</Text></View>
            <Text style={styles.historyDate}>2023-10-01</Text>
          </View>
        </TouchableOpacity>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  headerBar: { backgroundColor: '#00B862', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12, paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 12 : 14 },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  clinicNameText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', marginLeft: 6 },
  vetNameText: { color: '#FFFFFF', fontSize: 14, fontWeight: '500' },
  content: { flex: 1 },
  scrollPadding: { padding: 20, paddingBottom: 40 },
  statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
  statCard: { flex: 0.48, borderRadius: 12, padding: 16, elevation: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  statTitle: { color: '#FFFFFF', fontSize: 13, fontWeight: '600', marginBottom: 8 },
  statRowValue: { flexDirection: 'row', alignItems: 'baseline' },
  statNumber: { color: '#FFFFFF', fontSize: 28, fontWeight: 'bold', marginRight: 6 },
  statUnit: { color: '#FFFFFF', fontSize: 14 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  sectionIcon: { marginRight: 8 },
  sectionTitleText: { fontSize: 18, fontWeight: 'bold' },
  appointmentCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#F5ECDF', borderLeftWidth: 6, borderLeftColor: '#EF6C00', elevation: 2, marginBottom: 16 },
  appTitle: { fontSize: 16, fontWeight: 'bold', color: '#EF6C00', marginBottom: 6 },
  appDateRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  appDateText: { fontSize: 12, color: '#666' },
  appFooterRow: { flexDirection: 'row', alignItems: 'center' },
  badgeOrange: { backgroundColor: '#EF6C00', paddingHorizontal: 10, paddingVertical: 2, borderRadius: 12 },
  badgeOrangeText: { color: '#FFFFFF', fontSize: 11, fontWeight: 'bold' },
  appOwnerText: { fontSize: 12, color: '#888' },
  historyCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E8F5E9', borderLeftWidth: 6, borderLeftColor: '#00C853', elevation: 2 },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  historyTitle: { fontSize: 16, fontWeight: 'bold', color: '#00C853' },
  badgeGreenOutline: { backgroundColor: '#00C853', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  badgeGreenOutlineText: { color: '#FFF', fontSize: 10, fontWeight: 'bold' },
  historyDetail: { fontSize: 13, color: '#888', marginBottom: 12 },
  historyFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  badgeGreenSolid: { backgroundColor: '#00C853', paddingHorizontal: 10, paddingVertical: 2, borderRadius: 12 },
  badgeGreenSolidText: { color: '#FFFFFF', fontSize: 11, fontWeight: 'bold' },
  historyDate: { fontSize: 12, color: '#999' },
});
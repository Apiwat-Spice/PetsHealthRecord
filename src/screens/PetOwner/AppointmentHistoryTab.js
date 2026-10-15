import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, RefreshControl, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';

export default function AppointmentHistoryTab({ 
  history, 
  selectedFilter, 
  setSelectedFilter, 
  refreshing, 
  onRefresh, 
  onViewDetail 
}) {

  const translateType = (type) => {
    switch (type) {
      case 'Walk-in': return 'เข้ารับบริการหน้าคลินิก (Walk-in)';
      case 'Follow-up': return 'นัดติดตามอาการ (Follow-up)';
      case 'Appointment': return 'นัดหมายผ่านแอปพลิเคชัน (Appointment)';
      case 'Surgery / Procedure': return 'ผ่าตัด / หัตถการ (Surgery / Procedure)';
      case 'Treatment / Wound Care': return 'รักษา / ทำแผล (Treatment / Wound Care)';
      default: return type ? `${type}` : 'นัดหมายทั่วไป (Appointment)';
    }
  };

  const translateTitle = (title) => {
    switch (title) {
      case 'Health Checkup': return 'ตรวจสุขภาพประจำปี (Health Checkup)';
      case 'Vaccination': return 'ฉีดวัคซีน (Vaccination)';
      case 'Sick Visit / Consultation': return 'ตรวจรักษาอาการป่วย (Sick Visit / Consultation)';
      case 'Spay / Neuter': return 'ทำหมัน (Spay / Neuter)';
      case 'Grooming / Boarding': return 'อาบน้ำตัดขน / ฝากเลี้ยง (Grooming / Boarding)';
      default: return title ? `${title}` : 'ตรวจสุขภาพทั่วไป (Health Checkup)';
    }
  };

  const getFilteredAndSortedHistory = () => {
    let result = [...history];

    if (selectedFilter !== 'all') {
      result = result.filter(item => item.status === selectedFilter);
    }

    result.sort((a, b) => {
      const dateTimeA = new Date(`${a.appointment_date}T${a.appointment_time || '00:00:00'}`);
      const dateTimeB = new Date(`${b.appointment_date}T${b.appointment_time || '00:00:00'}`);

      if (selectedFilter === 'confirmed') {
        return dateTimeA - dateTimeB;
      }
      return dateTimeB - dateTimeA;
    });

    return result;
  };

  const renderHistoryCard = ({ item }) => {
    let statusColor = '#F5A623';
    let statusLabel = 'รอยืนยัน';

    if (item.status === 'confirmed') { statusColor = '#4CAF50'; statusLabel = 'ใกล้ถึงแล้ว'; }
    if (item.status === 'cancelled') { statusColor = '#F44336'; statusLabel = 'ยกเลิก'; }
    if (item.status === 'completed') { statusColor = '#2196F3'; statusLabel = 'สำเร็จ'; }

    return (
      <View style={styles.historyCard}>
        <View style={styles.historyHeader}>
          <Text style={styles.historyClinicName} numberOfLines={1}>
            {item.clinics?.clinic_name || item.title || 'นัดหมายคลินิก'}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{statusLabel}</Text>
          </View>
        </View>

        <View style={styles.typeBox}>
          <Text style={styles.historyType}>
            ประเภท: {translateType(item.type)}
          </Text>
          <Text style={styles.historyTitleText}>
            บริการ: {translateTitle(item.title)}
          </Text>
        </View>

        <Text style={styles.historyDetail}>
          {item.detail ? `หมายเหตุ: ${item.detail}` : 'ไม่มีหมายเหตุ'}
        </Text>

        {item.status === 'cancelled' && item.status_detail && (
          <View style={styles.cancelBox}>
            <Text style={styles.cancelBoxText}>เหตุผลที่ยกเลิก: {item.status_detail}</Text>
          </View>
        )}

        <View style={styles.historyFooter}>
          <View style={styles.historyDateTime}>
            <Feather name="calendar" size={14} color="#666" style={{ marginRight: 5 }} />
            <Text style={styles.historyDateText}>
              วันที่ {item.appointment_date} เวลา {item.appointment_time?.substring(0, 5)} น.
            </Text>
          </View>
          <TouchableOpacity
            style={styles.detailBtn}
            onPress={() => onViewDetail(item.appointment_id)}
          >
            <Text style={styles.detailBtnText}>รายละเอียด</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
          <TouchableOpacity
            style={[styles.filterChip, selectedFilter === 'all' && styles.filterChipAll]}
            onPress={() => setSelectedFilter('all')}
          >
            <Text style={[styles.filterText, selectedFilter === 'all' && styles.filterTextActive]}>ทั้งหมด</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, selectedFilter === 'pending' && styles.filterChipPending]}
            onPress={() => setSelectedFilter('pending')}
          >
            <Text style={[styles.filterText, selectedFilter === 'pending' && styles.filterTextActive]}>รอยืนยัน</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, selectedFilter === 'confirmed' && styles.filterChipConfirmed]}
            onPress={() => setSelectedFilter('confirmed')}
          >
            <Text style={[styles.filterText, selectedFilter === 'confirmed' && styles.filterTextActive]}>ใกล้ถึงแล้ว</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, selectedFilter === 'completed' && styles.filterChipCompleted]}
            onPress={() => setSelectedFilter('completed')}
          >
            <Text style={[styles.filterText, selectedFilter === 'completed' && styles.filterTextActive]}>สำเร็จ</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.filterChip, selectedFilter === 'cancelled' && styles.filterChipCancelled]}
            onPress={() => setSelectedFilter('cancelled')}
          >
            <Text style={[styles.filterText, selectedFilter === 'cancelled' && styles.filterTextActive]}>ยกเลิก</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <FlatList
        data={getFilteredAndSortedHistory()}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderHistoryCard}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 50, color: '#999' }}>ไม่มีประวัติการนัดหมายตามเงื่อนไขนี้</Text>}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0056D2']} tintColor="#0056D2" />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  filterContainer: { marginBottom: 10, height: 45, justifyContent: 'center' },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#FFF', borderRadius: 20, marginRight: 8, borderWidth: 1, borderColor: '#D0E1FD', justifyContent: 'center', alignItems: 'center', height: 36 },
  filterChipAll: { backgroundColor: '#0056D2', borderColor: '#0056D2' },
  filterChipPending: { backgroundColor: '#F5A623', borderColor: '#F5A623' },
  filterChipConfirmed: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  filterChipCompleted: { backgroundColor: '#2196F3', borderColor: '#2196F3' },
  filterChipCancelled: { backgroundColor: '#F44336', borderColor: '#F44336' },
  filterText: { fontSize: 13, color: '#0056D2', fontWeight: '600' },
  filterTextActive: { color: '#FFF' },
  listContainer: { paddingHorizontal: 20, paddingBottom: 20 },
  historyCard: { backgroundColor: '#FFF', borderRadius: 12, padding: 15, marginBottom: 15, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, elevation: 2, borderWidth: 1, borderColor: '#EAF4F4' },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  historyClinicName: { fontSize: 16, fontWeight: 'bold', color: '#333', flex: 1, marginRight: 10 },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 15 },
  statusText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  typeBox: { backgroundColor: '#F8FBFF', padding: 8, borderRadius: 8, marginBottom: 6, borderWidth: 1, borderColor: '#EAF4F4' },
  historyType: { fontSize: 13, fontWeight: '600', color: '#0056D2', marginBottom: 2 },
  historyTitleText: { fontSize: 12, color: '#444' },
  historyDetail: { fontSize: 13, color: '#666', marginBottom: 8 },
  cancelBox: { backgroundColor: '#FFF5F5', padding: 8, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#FED7D7' },
  cancelBoxText: { fontSize: 12, color: '#E53E3E' },
  historyFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 10 },
  historyDateTime: { flexDirection: 'row', alignItems: 'center' },
  historyDateText: { fontSize: 13, color: '#666' },
  detailBtn: { backgroundColor: '#EAF4F4', paddingHorizontal: 12, paddingVertical: 5, borderRadius: 10 },
  detailBtnText: { color: '#0056D2', fontSize: 12, fontWeight: 'bold' }
});
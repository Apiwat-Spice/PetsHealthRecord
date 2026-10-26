import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, FlatList, RefreshControl, ScrollView } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

export default function AppointmentHistoryTab({
  history,
  selectedFilter,
  setSelectedFilter,
  refreshing,
  onRefresh,
  onViewDetail
}) {

  const [selectedPetId, setSelectedPetId] = useState('all');
  const [dateOrder, setDateOrder] = useState('desc');

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

  const petList = Array.from(
    new Map(
      (history || [])
        .filter(item => item.pet_id || item.pets?.pet_id)
        .map(item => {
          const id = item.pet_id || item.pets?.pet_id;
          const name = item.pet_name || item.pets?.pet_name || `สัตว์เลี้ยง #${id}`;
          return [id, { pet_id: id, pet_name: name }];
        })
    ).values()
  );

  const getFilteredAndSortedHistory = () => {
    let result = [...(history || [])];

    if (selectedPetId !== 'all') {
      result = result.filter(item => (item.pet_id === selectedPetId || item.pets?.pet_id === selectedPetId));
    }

    if (selectedFilter !== 'all') {
      result = result.filter(item => item.status === selectedFilter);
    }

    result.sort((a, b) => {
      const dateTimeA = new Date(`${a.appointment_date}T${a.appointment_time || '00:00:00'}`).getTime();
      const dateTimeB = new Date(`${b.appointment_date}T${b.appointment_time || '00:00:00'}`).getTime();

      if (dateOrder === 'asc') {
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

    const petName = item.pet_name || item.pets?.pet_name;

    return (
      <View style={styles.historyCard}>
        <View style={styles.historyHeader}>
          <View style={{ flex: 1, marginRight: 8 }}>
            <Text style={styles.historyClinicName} numberOfLines={1}>
              {item.clinics?.clinic_name || item.title || 'นัดหมายคลินิก'}
            </Text>
            {petName ? (
              <View style={styles.petTagBadge}>
                <MaterialCommunityIcons name="paw" size={11} color="#0056D2" style={{ marginRight: 3 }} />
                <Text style={styles.petTagText}>{petName}</Text>
              </View>
            ) : null}
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
            <Text style={styles.statusText}>{statusLabel}</Text>
          </View>
        </View>

        <View style={styles.typeBox}>
          <View style={styles.infoRow}>
            <Feather name="tag" size={13} color="#0056D2" style={styles.infoIcon} />
            <Text style={styles.historyType}>ประเภท: {translateType(item.type)}</Text>
          </View>
          <View style={styles.infoRow}>
            <Feather name="activity" size={13} color="#444" style={styles.infoIcon} />
            <Text style={styles.historyTitleText}>บริการ: {translateTitle(item.title)}</Text>
          </View>
        </View>

        <View style={styles.noteRow}>
          <Feather name="file-text" size={13} color="#666" style={styles.noteIcon} />
          <Text style={styles.historyDetail}>
            {item.detail ? `หมายเหตุ: ${item.detail}` : 'ไม่มีหมายเหตุเพิ่มเติม'}
          </Text>
        </View>

        {item.status === 'cancelled' && item.status_detail && (
          <View style={styles.cancelBox}>
            <Feather name="alert-circle" size={14} color="#E53E3E" style={{ marginRight: 6 }} />
            <Text style={styles.cancelBoxText}>เหตุผล: {item.status_detail}</Text>
          </View>
        )}

        <View style={styles.historyFooter}>
          <View style={styles.historyDateTime}>
            <Feather name="clock" size={14} color="#0056D2" style={{ marginRight: 6 }} />
            <Text style={styles.historyDateText}>
              <Text style={{ fontWeight: 'bold', color: '#333' }}>{item.appointment_date}</Text>
              {' • '}
              {item.appointment_time?.substring(0, 5)} น.
            </Text>
          </View>
          <TouchableOpacity
            style={styles.detailBtn}
            onPress={() => onViewDetail(item.appointment_id)}
          >
            <Text style={styles.detailBtnText}>ดูรายละเอียด</Text>
            <Feather name="chevron-right" size={14} color="#0056D2" style={{ marginLeft: 2 }} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={styles.petFilterBar}>
        <View style={styles.petFilterHeader}>
          <Text style={styles.filterTitleLabel}>สัตว์เลี้ยง:</Text>
          <TouchableOpacity
            style={styles.dateSortToggleBtn}
            onPress={() => setDateOrder(prev => prev === 'desc' ? 'asc' : 'desc')}
            activeOpacity={0.8}
          >
            <Feather name={dateOrder === 'desc' ? "arrow-down" : "arrow-up"} size={13} color="#0056D2" style={{ marginRight: 4 }} />
            <Text style={styles.dateSortToggleText}>
              {dateOrder === 'desc' ? 'วันที่ล่าสุด' : 'วันที่เก่าสุด'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
          <TouchableOpacity
            style={[styles.petChipItem, selectedPetId === 'all' && styles.petChipItemActive]}
            onPress={() => setSelectedPetId('all')}
          >
            <Text style={[styles.petChipItemText, selectedPetId === 'all' && styles.petChipItemTextActive]}>
              ทั้งหมด
            </Text>
          </TouchableOpacity>

          {petList.map((p) => {
            const isActive = selectedPetId === p.pet_id;
            return (
              <TouchableOpacity
                key={p.pet_id}
                style={[styles.petChipItem, isActive && styles.petChipItemActive]}
                onPress={() => setSelectedPetId(p.pet_id)}
              >
                <Text style={[styles.petChipItemText, isActive && styles.petChipItemTextActive]}>
                  {p.pet_name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
          <TouchableOpacity style={[styles.filterChip, selectedFilter === 'all' && styles.filterChipAll]} onPress={() => setSelectedFilter('all')}>
            <Text style={[styles.filterText, selectedFilter === 'all' && styles.filterTextActive]}>สถานะทั้งหมด</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.filterChip, selectedFilter === 'pending' && styles.filterChipPending]} onPress={() => setSelectedFilter('pending')}>
            <Text style={[styles.filterText, selectedFilter === 'pending' && styles.filterTextActive]}>รอยืนยัน</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.filterChip, selectedFilter === 'confirmed' && styles.filterChipConfirmed]} onPress={() => setSelectedFilter('confirmed')}>
            <Text style={[styles.filterText, selectedFilter === 'confirmed' && styles.filterTextActive]}>ใกล้ถึงแล้ว</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.filterChip, selectedFilter === 'completed' && styles.filterChipCompleted]} onPress={() => setSelectedFilter('completed')}>
            <Text style={[styles.filterText, selectedFilter === 'completed' && styles.filterTextActive]}>สำเร็จ</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.filterChip, selectedFilter === 'cancelled' && styles.filterChipCancelled]} onPress={() => setSelectedFilter('cancelled')}>
            <Text style={[styles.filterText, selectedFilter === 'cancelled' && styles.filterTextActive]}>ยกเลิก</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <FlatList
        data={getFilteredAndSortedHistory()}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderHistoryCard}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyStateContainer}>
            <Feather name="inbox" size={48} color="#D0E1FD" style={{ marginBottom: 12 }} />
            <Text style={styles.emptyStateText}>ไม่มีประวัติการนัดหมายตามเงื่อนไขที่เลือก</Text>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0056D2']} tintColor="#0056D2" />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  petFilterBar: { marginBottom: 6, paddingTop: 4 },
  petFilterHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, marginBottom: 6 },
  filterTitleLabel: { fontSize: 13, fontWeight: 'bold', color: '#444' },
  dateSortToggleBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EAF4F4', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  dateSortToggleText: { fontSize: 12, color: '#0056D2', fontWeight: 'bold' },

  petChipItem: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 15, backgroundColor: '#F1F5F9', marginRight: 6, borderWidth: 1, borderColor: '#CBD5E1' },
  petChipItemActive: { backgroundColor: '#0056D2', borderColor: '#0056D2' },
  petChipItemText: { fontSize: 12, color: '#475569', fontWeight: '600' },
  petChipItemTextActive: { color: '#FFF', fontWeight: 'bold' },

  filterContainer: { marginBottom: 10, height: 42, justifyContent: 'center' },
  filterChip: { paddingHorizontal: 14, paddingVertical: 6, backgroundColor: '#FFF', borderRadius: 20, marginRight: 8, borderWidth: 1, borderColor: '#D0E1FD', justifyContent: 'center', alignItems: 'center', height: 34 },
  filterChipAll: { backgroundColor: '#0056D2', borderColor: '#0056D2' },
  filterChipPending: { backgroundColor: '#F5A623', borderColor: '#F5A623' },
  filterChipConfirmed: { backgroundColor: '#4CAF50', borderColor: '#4CAF50' },
  filterChipCompleted: { backgroundColor: '#2196F3', borderColor: '#2196F3' },
  filterChipCancelled: { backgroundColor: '#F44336', borderColor: '#F44336' },
  filterText: { fontSize: 12, color: '#0056D2', fontWeight: '600' },
  filterTextActive: { color: '#FFF' },
  listContainer: { paddingHorizontal: 20, paddingBottom: 20 },

  historyCard: { backgroundColor: '#FFF', borderRadius: 12, padding: 15, marginBottom: 15, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, elevation: 2, borderWidth: 1, borderColor: '#EAF4F4' },
  historyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 },
  historyClinicName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  petTagBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF', alignSelf: 'flex-start', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginTop: 3 },
  petTagText: { fontSize: 11, color: '#0056D2', fontWeight: 'bold' },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 15 },
  statusText: { color: '#FFF', fontSize: 11, fontWeight: 'bold' },

  typeBox: { backgroundColor: '#F8FBFF', padding: 10, borderRadius: 8, marginBottom: 10, borderWidth: 1, borderColor: '#EAF4F4' },
  infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  infoIcon: { marginRight: 8 },
  historyType: { fontSize: 13, fontWeight: '600', color: '#0056D2' },
  historyTitleText: { fontSize: 13, color: '#444' },

  noteRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12, paddingHorizontal: 4 },
  noteIcon: { marginRight: 8, marginTop: 2 },
  historyDetail: { fontSize: 13, color: '#666', flex: 1 },

  cancelBox: { backgroundColor: '#FFF5F5', padding: 10, borderRadius: 8, marginBottom: 12, borderWidth: 1, borderColor: '#FED7D7', flexDirection: 'row', alignItems: 'center' },
  cancelBoxText: { fontSize: 12, color: '#E53E3E', flex: 1 },

  historyFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 12 },
  historyDateTime: { flexDirection: 'row', alignItems: 'center' },
  historyDateText: { fontSize: 13, color: '#666' },

  detailBtn: { backgroundColor: '#EAF4F4', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10, flexDirection: 'row', alignItems: 'center' },
  detailBtnText: { color: '#0056D2', fontSize: 12, fontWeight: 'bold' },

  emptyStateContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 60 },
  emptyStateText: { color: '#999', fontSize: 14 }
});
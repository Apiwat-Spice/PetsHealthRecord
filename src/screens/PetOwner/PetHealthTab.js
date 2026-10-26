import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { WeightChart, ServiceBarChart } from './PetCharts';

export default function PetHealthTab({ weightTrend, stats, history = [], navigation }) {
  const [selectedFilter, setSelectedFilter] = useState('all');

  const serviceBarItems = [
    { label: 'ตรวจสุขภาพ', count: stats?.checkup || 0 },
    { label: 'ฉีดวัคซีน', count: stats?.vaccine || 0 },
    { label: 'ตรวจรักษา', count: stats?.consultation || 0 },
    { label: 'ทำหมัน', count: stats?.neuter || 0 },
    { label: 'อาบน้ำ/ฝาก', count: stats?.grooming || 0 },
  ];

  const filterOptions = [
    { key: 'all', label: 'ทั้งหมด' },
    { key: 'checkup', label: 'ตรวจสุขภาพ' },
    { key: 'vaccine', label: 'ฉีดวัคซีน' },
    { key: 'consultation', label: 'ตรวจรักษา' },
    { key: 'neuter', label: 'ทำหมัน' },
    { key: 'grooming', label: 'อาบน้ำ/ฝาก' },
  ];

  const translateTitle = (title) => {
    switch (title) {
      case 'Health Checkup': return 'ตรวจสุขภาพประจำปี';
      case 'Vaccination': return 'ฉีดวัคซีน';
      case 'Sick Visit / Consultation': return 'ตรวจรักษาอาการป่วย';
      case 'Spay / Neuter': return 'ทำหมัน';
      case 'Grooming': return 'อาบน้ำตัดขน';
      case 'Bathing': return 'อาบน้ำ';
      case 'Haircut': return 'ตัดขน';
      case 'Boarding': return 'ฝากเลี้ยงสัตว์เลี้ยง';
      case 'Grooming / Boarding': return 'อาบน้ำตัดขน / ฝากเลี้ยง';
      default: return title || 'ประวัติการรักษา';
    }
  };

  const translateCategory = (category) => {
    switch (category) {
      case 'checkup': return 'ตรวจสุขภาพ';
      case 'vaccine': return 'ฉีดวัคซีน';
      case 'consultation': return 'ตรวจรักษา';
      case 'neuter': return 'ทำหมัน';
      case 'grooming': return 'อาบน้ำ/ฝากเลี้ยง';
      default: return category || 'ทั่วไป';
    }
  };

  const filteredHistory = (history || []).filter((item) => {
    if (selectedFilter === 'all') return true;
    return item.category === selectedFilter;
  });

  return (
    <View style={{ flex: 1 }}>

      {/* 1. กราฟแนวโน้มน้ำหนัก */}
      <View style={styles.card}>
        <View style={styles.chartTitleRow}>
          <Feather name="trending-up" size={18} color="#4AAED9" />
          <Text style={styles.chartTitle}> แนวโน้มน้ำหนัก</Text>
        </View>
        <WeightChart data={weightTrend} />
      </View>

      {/* 2. สถิติการรับบริการ */}
      <View style={styles.card}>
        <View style={styles.chartTitleRow}>
          <MaterialCommunityIcons name="heart-pulse" size={20} color="#3AA384" />
          <Text style={styles.chartTitle}> สถิติการรับบริการ(ทั้งหมด)</Text>
        </View>
        <ServiceBarChart items={serviceBarItems} />
      </View>

      {/* 3. ประวัติการรักษาทั้งหมด */}
      <View style={styles.card}>
        <View style={styles.chartTitleRow}>
          <MaterialCommunityIcons name="pulse" size={20} color="#2F80ED" />
          <Text style={[styles.chartTitle, { color: '#2F80ED' }]}> ประวัติการรักษาทั้งหมด</Text>
        </View>

        {/* ปุ่ม Filter Chips แนวนอน */}
        <View style={styles.filterContainer}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 4 }}>
            {filterOptions.map((option) => (
              <TouchableOpacity
                key={option.key}
                style={[
                  styles.filterChip,
                  selectedFilter === option.key && styles.filterChipActive,
                ]}
                onPress={() => setSelectedFilter(option.key)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    selectedFilter === option.key && styles.filterChipTextActive,
                  ]}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* แสดงผลรายการประวัติแบบ Timeline ที่เส้นเชื่อมต่อกัน */}
        {filteredHistory.length === 0 ? (
          <Text style={styles.emptyText}>ไม่พบประวัติการรักษาในหมวดหมู่นี้</Text>
        ) : (
          filteredHistory.map((h, index) => {
            const isFirst = index === 0;
            const isLast = index === filteredHistory.length - 1;

            return (
              <View key={index} style={styles.timelineRow}>

                {/* เส้นและจุด Timeline ทางซ้าย */}
                <View style={styles.timelineGraphic}>
                  <View
                    style={[
                      styles.timelineLine,
                      isFirst && { top: 22 },
                      isLast && { bottom: '50%' },
                    ]}
                  />
                  <View style={styles.timelineDot} />
                </View>

                {/* การ์ดประวัติการรักษา */}
                <TouchableOpacity
                  style={styles.historyCardItem}
                  activeOpacity={0.8}
                  onPress={() => {
                    if (h.visit_id && navigation) {
                      navigation.navigate('VisitDetail', { visitId: h.visit_id });
                    }
                  }}
                >
                  <View style={styles.historyTopRow}>
                    <Text style={styles.historyName}>
                      {translateTitle(h.title)}
                    </Text>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryBadgeText}>
                        {translateCategory(h.category)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.metaRow}>
                    <View style={styles.weightBadge}>
                      <MaterialCommunityIcons name="scale-bathroom" size={13} color="#2563EB" style={{ marginRight: 4 }} />
                      <Text style={styles.weightText}>
                        {h.weight ? `${h.weight} กก.` : 'ไม่ได้ชั่งน้ำหนัก'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.historyDetailBox}>
                    <Text style={styles.historyDetailText}>
                      {h.diagnosis || h.symptoms || h.treatment || 'ไม่มีข้อมูลรายละเอียด'}
                    </Text>
                  </View>

                  <View style={styles.historyBottomRow}>
                    <View style={styles.dateTimeContainer}>
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Feather name="calendar" size={12} color="#64748B" style={{ marginRight: 4 }} />
                        <Text style={styles.historyDateText}>
                          {h.visit_date} {h.visit_time ? `• ${h.visit_time.substring(0, 5)} น.` : ''}
                        </Text>
                      </View>
                      <Text style={styles.clinicNameText}>
                        {h.clinic_name || 'Happy Paws Clinic'}
                      </Text>
                    </View>

                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <View style={styles.vetBadge}>
                        <Text style={styles.vetBadgeText}>
                          {h.vet_name ? `น.สพ. ${h.vet_name}` : 'คลินิกรักษาสัตว์'}
                        </Text>
                      </View>
                      <Feather name="chevron-right" size={16} color="#0056D2" style={{ marginLeft: 4 }} />
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            );
          })
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2EBF0',
    elevation: 1,
  },
  chartTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  chartTitle: { fontSize: 15, fontWeight: 'bold', color: '#20435C' },

  filterContainer: { marginBottom: 14 },
  filterChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterChipActive: {
    backgroundColor: '#2F80ED',
    borderColor: '#2F80ED',
  },
  filterChipText: { fontSize: 12, color: '#64748B', fontWeight: '600' },
  filterChipTextActive: { color: '#FFFFFF', fontWeight: 'bold' },

  timelineRow: {
    flexDirection: 'row',
    position: 'relative',
    marginBottom: 12,
  },
  timelineGraphic: {
    width: 20,
    alignItems: 'center',
    marginRight: 10,
    position: 'relative',
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#2F80ED',
    marginTop: 18,
    zIndex: 2,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  timelineLine: {
    position: 'absolute',
    top: 0,
    bottom: -12,
    width: 2,
    backgroundColor: '#CBD5E1',
    left: 9,
    zIndex: 1,
  },

  historyCardItem: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E8F1F5',
    borderRadius: 12,
    padding: 14,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  historyTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  historyName: { fontSize: 15, fontWeight: 'bold', color: '#2F80ED', flex: 1, marginRight: 8 },
  categoryBadge: { backgroundColor: '#E0F2FE', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  categoryBadgeText: { color: '#0056D2', fontSize: 10, fontWeight: 'bold' },

  metaRow: { flexDirection: 'row', marginTop: 6 },
  weightBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  weightText: { fontSize: 11, fontWeight: 'bold', color: '#2563EB' },

  historyDetailBox: { backgroundColor: '#F8FAFC', padding: 10, borderRadius: 8, marginVertical: 8, borderWidth: 1, borderColor: '#F1F5F9' },
  historyDetailText: { fontSize: 12, color: '#475569' },

  historyBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 4 },
  dateTimeContainer: { flex: 1, marginRight: 8 },
  historyDateText: { fontSize: 11, color: '#64748B', fontWeight: '500' },
  clinicNameText: { fontSize: 11, color: '#0056D2', fontWeight: 'bold', marginTop: 2 },

  vetBadge: { backgroundColor: '#D1EFFF', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  vetBadgeText: { color: '#0284C7', fontSize: 11, fontWeight: 'bold' },
  emptyText: { textAlign: 'center', color: '#9AA7B0', fontSize: 13, paddingVertical: 24 },
});
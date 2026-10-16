import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { WeightChart, ServiceBarChart } from './PetCharts';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PetHealthTab({ weightTrend, stats, history, navigation }) {
  const serviceBarItems = [
    { label: 'ตรวจสุขภาพ', count: stats?.checkup || 0 },
    { label: 'ฉีดวัคซีน', count: stats?.vaccine || 0 },
    { label: 'ตรวจรักษา', count: stats?.consultation || 0 },
    { label: 'ทำหมัน', count: stats?.neuter || 0 },
    { label: 'อาบน้ำ/ฝาก', count: stats?.grooming || 0 },
  ];

  const translateTitle = (title) => {
    switch (title) {
      case 'Health Checkup': return 'ตรวจสุขภาพประจำปี';
      case 'Vaccination': return 'ฉีดวัคซีน';
      case 'Sick Visit / Consultation': return 'ตรวจรักษาอาการป่วย';
      case 'Spay / Neuter': return 'ทำหมัน';
      case 'Grooming / Boarding': return 'อาบน้ำตัดขน / ฝากเลี้ยง';
      default: return title || 'ประวัติการรักษา';
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F8FA' }}>
      {/* กราฟแนวโน้มน้ำหนัก */}
      <View style={styles.card}>
        <View style={styles.chartTitleRow}>
          <Feather name="trending-up" size={18} color="#4AAED9" />
          <Text style={styles.chartTitle}> แนวโน้มน้ำหนัก (ทั้งหมด)</Text>
        </View>
        <WeightChart data={weightTrend} />
      </View>

      {/* สถิติการรับบริการ */}
      <View style={styles.card}>
        <View style={styles.chartTitleRow}>
          <MaterialCommunityIcons name="heart-pulse" size={20} color="#3AA384" />
          <Text style={styles.chartTitle}> สถิติการรับบริการ(ทั้งหมด)</Text>
        </View>
        <ServiceBarChart items={serviceBarItems} />
      </View>

      {/* ประวัติการรักษาทั้งหมด */}
      <View style={styles.card}>
        <View style={styles.chartTitleRow}>
          <MaterialCommunityIcons name="pulse" size={20} color="#2F80ED" />
          <Text style={[styles.chartTitle, { color: '#2F80ED' }]}> ประวัติการรักษาทั้งหมด</Text>
        </View>

        {history.length === 0 ? (
          <Text style={styles.emptyText}>ยังไม่มีประวัติการรักษาในระบบ</Text>
        ) : (
          history.map((h, index) => (
            <TouchableOpacity
              key={index}
              style={styles.historyCardItem}
              activeOpacity={0.8}
              onPress={() => {
                if (h.visit_id && navigation) {
                  navigation.navigate('VisitDetail', { visitId: h.visit_id });
                }
              }}
            >
              {/* แถวที่ 1: หัวข้อ + ป้ายหมวดหมู่ */}
              <View style={styles.historyTopRow}>
                <Text style={styles.historyName}>
                  {translateTitle(h.title)}
                </Text>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>
                    {h.category || 'treatment'}
                  </Text>
                </View>
              </View>

              {/* แถวที่ 2: น้ำหนักที่ชั่งขณะตรวจ */}
              <View style={styles.metaRow}>
                <View style={styles.weightBadge}>
                  <MaterialCommunityIcons name="scale-bathroom" size={13} color="#2563EB" style={{ marginRight: 4 }} />
                  <Text style={styles.weightText}>
                    {h.weight ? `${h.weight} กก.` : 'ไม่ได้ชั่งน้ำหนัก'}
                  </Text>
                </View>
              </View>

              {/* แถวที่ 3: รายละเอียด/ผลตรวจ */}
              <View style={styles.historyDetailBox}>
                <Text style={styles.historyDetailText}>
                  {h.diagnosis || h.symptoms || h.treatment || 'ไม่มีข้อมูลรายละเอียด'}
                </Text>
              </View>

              {/* แถวที่ 4: วันที่ เวลา คลินิก และสัตวแพทย์ */}
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
          ))
        )}
      </View>
    </SafeAreaView>
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
  historyCardItem: {
    borderWidth: 1,
    borderColor: '#E8F1F5',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    backgroundColor: '#FFFFFF'
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
  emptyText: { textAlign: 'center', color: '#9AA7B0', fontSize: 13, paddingVertical: 16 },
});
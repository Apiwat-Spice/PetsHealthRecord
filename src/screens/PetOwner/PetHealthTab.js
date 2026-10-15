import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { WeightChart, ServiceBarChart } from './PetCharts';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function PetHealthTab({ weightTrend, stats, history }) {
  const serviceBarItems = [
    { label: 'ตรวจสุขภาพ', count: stats?.checkup || 0 },
    { label: 'ฉีดวัคซีน', count: stats?.vaccine || 0 },
    { label: 'รักษาโรค', count: stats?.treatment || 0 },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F5F8FA' }}>
      <View style={styles.card}>
        <View style={styles.chartTitleRow}>
          <Feather name="trending-up" size={18} color="#4AAED9" />
          <Text style={styles.chartTitle}> แนวโน้มน้ำหนัก (ทั้งหมด)</Text>
        </View>
        <WeightChart data={weightTrend} />
      </View>

      <View style={styles.card}>
        <View style={styles.chartTitleRow}>
          <MaterialCommunityIcons name="heart-pulse" size={20} color="#3AA384" />
          <Text style={styles.chartTitle}> สถิติการรับบริการ(ทั้งหมด)</Text>
        </View>
        <ServiceBarChart items={serviceBarItems} />
      </View>

      <View style={styles.card}>
        <View style={styles.chartTitleRow}>
          <MaterialCommunityIcons name="pulse" size={20} color="#2F80ED" />
          <Text style={[styles.chartTitle, { color: '#2F80ED' }]}> ประวัติการรักษาทั้งหมด</Text>
        </View>

        {history.length === 0 ? (
          <Text style={styles.emptyText}>ยังไม่มีประวัติการรักษาในระบบ</Text>
        ) : (
          history.map((h, index) => (
            <View key={index} style={styles.historyCardItem}>
              <View style={styles.historyTopRow}>
                <Text style={styles.historyName}>{h.title || 'วัคซีนพิษสุนัขบ้า'}</Text>
                <View style={styles.vaccineBadge}>
                  <Text style={styles.vaccineBadgeText}>vaccine</Text>
                </View>
              </View>

              <View style={styles.historyDetailBox}>
                <Text style={styles.historyDetailText}>{h.diagnosis || 'ฉีดวัคซีนประจำปี'}</Text>
              </View>

              <View style={styles.historyBottomRow}>
                <Text style={styles.historyDateText}>{h.visit_date || '2023-10-01'}</Text>
                <View style={styles.vetBadge}>
                  <Text style={styles.vetBadgeText}>โดย น.สพ. {h.vet_name || 'ใจดี'}</Text>
                </View>
              </View>
            </View>
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
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  historyTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  historyName: { fontSize: 15, fontWeight: 'bold', color: '#2F80ED' },
  vaccineBadge: { backgroundColor: '#6EE7B7', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  vaccineBadgeText: { color: '#047857', fontSize: 10, fontWeight: 'bold' },
  historyDetailBox: { backgroundColor: '#F0F9FF', padding: 8, borderRadius: 6, marginVertical: 8 },
  historyDetailText: { fontSize: 12, color: '#557086' },
  historyBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  historyDateText: { fontSize: 11, color: '#8A9EA8' },
  vetBadge: { backgroundColor: '#D1EFFF', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  vetBadgeText: { color: '#0284C7', fontSize: 11, fontWeight: 'bold' },
  emptyText: { textAlign: 'center', color: '#9AA7B0', fontSize: 13, paddingVertical: 16 },
});
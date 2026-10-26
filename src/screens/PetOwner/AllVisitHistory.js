import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { useFocusEffect } from '@react-navigation/native';
import { API_URL } from '../../config';

export default function AllVisitHistory({ navigation }) {
  const [visitHistory, setVisitHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [selectedPetId, setSelectedPetId] = useState('all');
  const [dateSort, setDateSort] = useState('desc');

  const fetchAllVisits = async () => {
    try {
      const ownerString = await SecureStore.getItemAsync('pet_owners');
      if (!ownerString) return;

      const owner = JSON.parse(ownerString);
      const ownerId = owner.pet_owner_id ?? owner.pet_owners_id;

      const response = await fetch(`${API_URL}/visit-records/owner/${ownerId}`);
      if (response.ok) {
        const data = await response.json();
        setVisitHistory(data);
      }
    } catch (error) {
      console.log("Fetch All Visit History Error:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchAllVisits();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchAllVisits();
  };

  const petList = Array.from(
    new Map(
      visitHistory
        .filter((v) => v.pet_id && v.pet_name)
        .map((v) => [v.pet_id, { pet_id: v.pet_id, pet_name: v.pet_name }])
    ).values()
  );

  const getFilteredAndSortedVisits = () => {
    let list = [...visitHistory];

    if (selectedPetId !== 'all') {
      list = list.filter((item) => item.pet_id === selectedPetId);
    }

    list.sort((a, b) => {
      const timeA = new Date(`${a.visit_date}T${a.visit_time || '00:00:00'}`).getTime();
      const timeB = new Date(`${b.visit_date}T${b.visit_time || '00:00:00'}`).getTime();
      return dateSort === 'desc' ? timeB - timeA : timeA - timeB;
    });

    return list;
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
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
      <View style={styles.cardHeader}>
        <View style={styles.petBadge}>
          <MaterialCommunityIcons name="paw" size={13} color="#2563EB" style={{ marginRight: 4 }} />
          <Text style={styles.petNameText}>{item.pet_name || 'สัตว์เลี้ยง'}</Text>
        </View>
        <Text style={styles.dateText}>{item.visit_date} • {item.visit_time?.substring(0, 5)} น.</Text>
      </View>

      <Text style={styles.diagnosisTitle}>
        {item.diagnosis || item.symptoms || 'บันทึกการเข้ารับบริการ'}
      </Text>

      <Text style={styles.treatmentText} numberOfLines={2}>
        การรักษา: {item.treatment || 'ไม่มีข้อมูลรายละเอียด'}
      </Text>

      <View style={styles.cardFooter}>
        <Text style={styles.vetText}>
          {item.vet_name ? `${item.vet_name}` : 'สัตวแพทย์ผู้ดูแล'}
        </Text>
        <Feather name="chevron-right" size={16} color="#2563EB" />
      </View>
    </TouchableOpacity>
  );

  if (loading && !refreshing) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ประวัติการรักษารวมทั้งหมด</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.filterSection}>
        <View style={styles.filterRowHeader}>
          <Text style={styles.filterSectionTitle}>เลือกสัตว์เลี้ยง:</Text>
          <TouchableOpacity
            style={styles.sortToggleBtn}
            onPress={() => setDateSort(prev => prev === 'desc' ? 'asc' : 'desc')}
            activeOpacity={0.8}
          >
            <Feather name={dateSort === 'desc' ? "arrow-down" : "arrow-up"} size={14} color="#2563EB" style={{ marginRight: 4 }} />
            <Text style={styles.sortToggleText}>
              {dateSort === 'desc' ? 'วันที่ล่าสุด' : 'วันที่เก่าสุด'}
            </Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16 }}>
          <TouchableOpacity
            style={[styles.petChip, selectedPetId === 'all' && styles.petChipActive]}
            onPress={() => setSelectedPetId('all')}
          >
            <Text style={[styles.petChipText, selectedPetId === 'all' && styles.petChipTextActive]}>
              สัตว์เลี้ยงทั้งหมด
            </Text>
          </TouchableOpacity>

          {petList.map((p) => {
            const isActive = selectedPetId === p.pet_id;
            return (
              <TouchableOpacity
                key={p.pet_id}
                style={[styles.petChip, isActive && styles.petChipActive]}
                onPress={() => setSelectedPetId(p.pet_id)}
              >
                <Text style={[styles.petChipText, isActive && styles.petChipTextActive]}>
                  {p.pet_name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <FlatList
        data={getFilteredAndSortedVisits()}
        keyExtractor={(item, index) => item.visit_id ? item.visit_id.toString() : index.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="clipboard-text-off-outline" size={48} color="#94A3B8" />
            <Text style={styles.emptyText}>ไม่พบประวัติการรักษา</Text>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563EB']} />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F8FA' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F5F8FA' },
  header: {
    backgroundColor: '#20435C',
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: { padding: 4 },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },

  filterSection: { backgroundColor: '#FFF', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  filterRowHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, marginBottom: 8 },
  filterSectionTitle: { fontSize: 13, fontWeight: 'bold', color: '#475569' },
  sortToggleBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  sortToggleText: { fontSize: 12, color: '#2563EB', fontWeight: 'bold' },

  petChip: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 18, backgroundColor: '#F1F5F9', marginRight: 8, borderWidth: 1, borderColor: '#CBD5E1' },
  petChipActive: { backgroundColor: '#2563EB', borderColor: '#2563EB' },
  petChipText: { fontSize: 12, color: '#475569', fontWeight: '600' },
  petChipTextActive: { color: '#FFF', fontWeight: 'bold' },

  listContainer: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 30 },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  petBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#EFF6FF', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  petNameText: { color: '#2563EB', fontSize: 12, fontWeight: 'bold' },
  dateText: { fontSize: 11, color: '#64748B', fontWeight: '500' },
  diagnosisTitle: { fontSize: 15, fontWeight: 'bold', color: '#1E293B', marginBottom: 4 },
  treatmentText: { fontSize: 13, color: '#475569', marginBottom: 12, lineHeight: 18 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F8FAFC', paddingTop: 10 },
  vetText: { fontSize: 12, color: '#64748B', fontWeight: '500' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 60 },
  emptyText: { color: '#94A3B8', fontSize: 14, marginTop: 10, fontWeight: '500' }
});
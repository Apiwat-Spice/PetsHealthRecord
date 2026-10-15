import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { useFocusEffect } from '@react-navigation/native';
import { API_URL } from '../../config';

export default function AllVisitHistory({ navigation }) {
  const [visitHistory, setVisitHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAllVisits = async () => {
    try {
      const ownerString = await SecureStore.getItemAsync('pet_owners');
      if (!ownerString) return;

      const owner = JSON.parse(ownerString);
      const ownerId = owner.pet_owner_id ?? owner.pet_owners_id;

      // ดึงประวัติการรักษารวมทั้งหมดของเจ้าของคนนี้
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

 const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      activeOpacity={0.9}
      onPress={() => {
        if (item.pet_id) {
          navigation.navigate('PetDetail', { 
            petId: item.pet_id, 
            initialTab: 'health' // เปิดมาแล้วให้ไปที่แท็บประวัติสุขภาพทันที
          });
        }
      }}
    >
      <View style={styles.cardHeader}>
        <View style={styles.petBadge}>
          <MaterialCommunityIcons name="paw" size={14} color="#0056D2" style={{ marginRight: 4 }} />
          <Text style={styles.petNameText}>{item.pet_name || 'สัตว์เลี้ยง'}</Text>
        </View>
        <Text style={styles.dateText}>{item.visit_date} | {item.visit_time?.substring(0, 5)} น.</Text>
      </View>

      <Text style={styles.diagnosisTitle}>
        {item.diagnosis || item.symptoms || 'บันทึกการรักษา'}
      </Text>
      <Text style={styles.treatmentText} numberOfLines={2}>
        การรักษา: {item.treatment || 'ไม่มีข้อมูลการรักษา'}
      </Text>

      <View style={styles.cardFooter}>
        <Text style={styles.vetText}>
          {item.vet_name ? `สัตวแพทย์: ${item.vet_name}` : 'ผู้ดูแล: คลินิก'}
        </Text>
        <Feather name="chevron-right" size={16} color="#0056D2" />
      </View>
    </TouchableOpacity>
  );
  
  if (loading && !refreshing) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0056D2" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>ประวัติการรักษารวมทั้งหมด</Text>
      </View>

      <FlatList
        data={visitHistory}
        keyExtractor={(item, index) => item.visit_id ? item.visit_id.toString() : index.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <MaterialCommunityIcons name="clipboard-text-off-outline" size={48} color="#CCC" />
            <Text style={styles.emptyText}>ยังไม่มีประวัติการรักษาในระบบ</Text>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0056D2']} />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FBFF' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: '#0056D2', padding: 20, flexDirection: 'row', alignItems: 'center' },
  backButton: { marginRight: 15 },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  listContainer: { padding: 20 },
  card: { backgroundColor: '#FFF', borderRadius: 14, padding: 16, marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2, borderWidth: 1, borderColor: '#EAF4F4' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  petBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E0F2FE', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  petNameText: { color: '#0056D2', fontSize: 12, fontWeight: 'bold' },
  dateText: { fontSize: 12, color: '#888' },
  diagnosisTitle: { fontSize: 16, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  treatmentText: { fontSize: 13, color: '#666', marginBottom: 12 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 10 },
  vetText: { fontSize: 12, color: '#666' },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  emptyText: { color: '#888', fontSize: 14, marginTop: 10 }
});
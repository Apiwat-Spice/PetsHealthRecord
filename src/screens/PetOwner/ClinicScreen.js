import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Alert, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as SecureStore from 'expo-secure-store';
import { useFocusEffect } from '@react-navigation/native';
import { API_URL } from '../../config';

import ClinicsTab from './ClinicsTab';
import AppointmentHistoryTab from './AppointmentHistoryTab';

export default function ClinicScreen({ navigation, route }) {
  const [activeTab, setActiveTab] = useState('clinics');
  const [clinics, setClinics] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');

  React.useEffect(() => {
    if (route.params?.switchTab) {
      setActiveTab(route.params.switchTab);
    }
    // เพิ่มการรับค่าฟิลเตอร์เริ่มต้นตรงนี้
    if (route.params?.initialFilter) {
      setSelectedFilter(route.params.initialFilter);
    }
  }, [route.params?.switchTab, route.params?.initialFilter]);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [])
  );

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchSingleClinic(), fetchHistory()]);
    setLoading(false);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Promise.all([fetchSingleClinic(), fetchHistory()]);
    setRefreshing(false);
  };

  // ดึงข้อมูลคลินิกเดี่ยวจาก Database โดยตรง (Clinic ID: 2)
  const fetchSingleClinic = async () => {
    try {
      const TARGET_CLINIC_ID = 2;
      const response = await fetch(`${API_URL}/clinics/${TARGET_CLINIC_ID}`);
      if (response.ok) {
        const data = await response.json();
        // เอาข้อมูลที่ได้ใส่ลงอาเรย์ เพื่อส่งต่อให้ ClinicsTab แสดงผล
        setClinics([data]);
      } else {
        console.log("Failed to fetch clinic from DB");
        setClinics([]);
      }
    } catch (error) {
      console.log("Fetch Clinic Error:", error);
      setClinics([]);
    }
  };

  const fetchHistory = async () => {
    try {
      const ownerString = await SecureStore.getItemAsync('pet_owners');
      if (!ownerString) return;

      const owner = JSON.parse(ownerString);
      const ownerId = owner.pet_owner_id ?? owner.pet_owners_id;

      const response = await fetch(`${API_URL}/appointments/history/${ownerId}`);
      if (response.ok) {
        const data = await response.json();
        setHistory(data);
      }
    } catch (error) {
      console.log("Fetch History Error", error);
    }
  };

  const handleCall = (phoneNumber) => {
    if (!phoneNumber) {
      Alert.alert('แจ้งเตือน', 'ยังไม่ได้ระบุหมายเลขโทรศัพท์ติดต่อ');
      return;
    }
    Linking.openURL(`tel:${phoneNumber}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ข้อมูลคลินิก</Text>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity style={[styles.tab, activeTab === 'clinics' && styles.activeTab]} onPress={() => setActiveTab('clinics')}>
          <Text style={[styles.tabText, activeTab === 'clinics' && styles.activeTabText]}>คลินิก</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.tab, activeTab === 'history' && styles.activeTab]} onPress={() => setActiveTab('history')}>
          <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>ประวัติการนัด</Text>
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#0056D2" style={{ marginTop: 50 }} />
      ) : activeTab === 'clinics' ? (
        <ClinicsTab
          clinics={clinics}
          refreshing={refreshing}
          onRefresh={onRefresh}
          onBookAppointment={(item) => navigation.navigate('BookAppointment', { clinic: item })}
          onCallClinic={handleCall}
        />
      ) : (
        <AppointmentHistoryTab
          history={history}
          selectedFilter={selectedFilter}
          setSelectedFilter={setSelectedFilter}
          refreshing={refreshing}
          onRefresh={onRefresh}
          onViewDetail={(appointmentId) => navigation.navigate('AppointmentDetail', { appointmentId })}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EAF4F4' },
  header: { backgroundColor: '#0056D2', padding: 20, paddingTop: 20, alignItems: 'center' },
  headerTitle: { color: '#FFF', fontSize: 22, fontWeight: 'bold' },
  tabContainer: { flexDirection: 'row', marginHorizontal: 20, marginTop: 15, marginBottom: 10, backgroundColor: '#DFEAEA', borderRadius: 25, padding: 5 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 20 },
  activeTab: { backgroundColor: '#FFFFFF', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 3, elevation: 2 },
  tabText: { fontSize: 16, color: '#666', fontWeight: 'bold' },
  activeTabText: { color: '#0056D2' }
});
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

  const fetchSingleClinic = async () => {
    try {
      const TARGET_CLINIC_ID = 2;
      const response = await fetch(`${API_URL}/clinics/${TARGET_CLINIC_ID}`);
      if (response.ok) {
        const data = await response.json();
        setClinics([data]);
      } else {
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
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>ข้อมูลคลินิกและนัดหมาย</Text>
      </View>

      {/* Segmented Tab */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'clinics' && styles.activeTab]}
          onPress={() => setActiveTab('clinics')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === 'clinics' && styles.activeTabText]}>ข้อมูลคลินิก</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'history' && styles.activeTab]}
          onPress={() => setActiveTab('history')}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === 'history' && styles.activeTabText]}>ประวัติการนัดหมาย</Text>
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 50 }} />
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
  container: { flex: 1, backgroundColor: '#F5F8FA' },
  header: {
    backgroundColor: '#20435C',
    paddingHorizontal: 16,
    paddingVertical: 14,
    alignItems: 'center',
  },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },

  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
    borderRadius: 25,
    padding: 3,
  },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 20 },
  activeTab: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  tabText: { fontSize: 13, color: '#64748B', fontWeight: 'bold' },
  activeTabText: { color: '#20435C' }
});
import React, { useState, useCallback, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, Image, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../../config';
import { calcAge, formatWeight, animalEmoji } from './PetUtils';

export default function Pets({ navigation }) {
  const [pets, setPets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [sortOption, setSortOption] = useState('newest'); // 'newest', 'name', 'age_desc', 'age_asc'
  const hasLoaded = useRef(false);

  const loadPets = useCallback(async ({ silent = false } = {}) => {
    try {
      if (!silent) setIsLoading(true);
      setErrorMsg('');

      const ownerString = await SecureStore.getItemAsync('pet_owners');
      if (!ownerString) {
        setPets([]);
        return;
      }

      const owner = JSON.parse(ownerString);
      const ownerId = owner.pet_owner_id ?? owner.pet_owners_id;

      const response = await fetch(`${API_URL}/pets/${ownerId}`);
      const responseText = await response.text();

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        throw new Error(`เซิร์ฟเวอร์ตอบกลับไม่ถูกต้อง (Status: ${response.status})`);
      }

      if (!response.ok) throw new Error(result.message || 'ดึงข้อมูลไม่สำเร็จ');
      setPets(result.pets || []);
    } catch (error) {
      console.log('Fetch Pets Error:', error.message);
      setErrorMsg('ไม่สามารถโหลดข้อมูลสัตว์เลี้ยงได้ ลองดึงหน้าจอลงเพื่อรีเฟรชอีกครั้ง');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadPets({ silent: hasLoaded.current });
      hasLoaded.current = true;
    }, [loadPets])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadPets({ silent: true });
  };

  //คำนวณเรียงลำดับข้อมูลตาม Sort Option ที่เลือก
  const getSortedPets = () => {
    let list = [...pets];
    if (sortOption === 'name') {
      list.sort((a, b) => (a.pet_name || '').localeCompare(b.pet_name || '', 'th'));
    } else if (sortOption === 'age_desc') {
      // อายุมาก -> น้อย (วันเกิดเก่าที่สุดก่อน)
      list.sort((a, b) => {
        const tA = a.birthdate ? new Date(a.birthdate).getTime() : 0;
        const tB = b.birthdate ? new Date(b.birthdate).getTime() : 0;
        return tA - tB;
      });
    } else if (sortOption === 'age_asc') {
      // อายุน้อย -> มาก (วันเกิดใหม่ที่สุดก่อน)
      list.sort((a, b) => {
        const tA = a.birthdate ? new Date(a.birthdate).getTime() : 0;
        const tB = b.birthdate ? new Date(b.birthdate).getTime() : 0;
        return tB - tA;
      });
    } else {
      // วันที่เพิ่มล่าสุด (Default)
      list.sort((a, b) => (b.pet_id || 0) - (a.pet_id || 0));
    }
    return list;
  };

  const sortChips = [
    { key: 'newest', label: 'ล่าสุด' },
    { key: 'name', label: 'ชื่อ (ก-ฮ)' },
    { key: 'age_desc', label: 'อายุมาก → น้อย' },
    { key: 'age_asc', label: 'อายุน้อย → มาก' },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />

      <View style={styles.headerBox}>
        <Text style={styles.title}>สัตว์เลี้ยงของคุณ</Text>
        <Text style={styles.subtitle}>แตะที่การ์ดเพื่อดูรายละเอียดและประวัติสุขภาพ</Text>

        {/*แถบปุ่ม Sort Chips */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.sortContainer}>
          {sortChips.map((chip) => {
            const isActive = sortOption === chip.key;
            return (
              <TouchableOpacity
                key={chip.key}
                style={[styles.sortChip, isActive && styles.sortChipActive]}
                onPress={() => setSortOption(chip.key)}
                activeOpacity={0.8}
              >
                <Text style={[styles.sortChipText, isActive && styles.sortChipTextActive]}>
                  {chip.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2563EB']} />}
      >
        {isLoading ? (
          <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 50 }} />
        ) : pets.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🐾</Text>
            <Text style={styles.emptyText}>{errorMsg ? 'โหลดข้อมูลไม่สำเร็จ' : 'ยังไม่มีสัตว์เลี้ยงในระบบ'}</Text>
            <Text style={styles.emptySubText}>
              {errorMsg || 'เมื่อคลินิกลงทะเบียนสัตว์เลี้ยงให้คุณ ข้อมูลจะแสดงที่นี่อัตโนมัติ'}
            </Text>
          </View>
        ) : (
          getSortedPets().map((pet) => {
            const weightText = formatWeight(pet.weight);
            return (
              <TouchableOpacity
                key={pet.pet_id}
                style={styles.card}
                activeOpacity={0.85}
                onPress={() => navigation.navigate('PetDetail', { pet })}
              >
                <View style={styles.avatarWrap}>
                  {pet.pet_image_url ? (
                    <Image source={{ uri: pet.pet_image_url }} style={styles.avatarImage} />
                  ) : (
                    <Text style={styles.avatarEmoji}>{animalEmoji(pet.animal_type)}</Text>
                  )}
                </View>

                <View style={styles.info}>
                  <Text style={styles.petName} numberOfLines={1}>{pet.pet_name}</Text>
                  <Text style={styles.petType} numberOfLines={1}>{pet.animal_type}</Text>
                  <Text style={styles.petBreed} numberOfLines={1}>พันธุ์ {pet.species || '-'}</Text>

                  <View style={styles.chipRow}>
                    {pet.birthdate ? (
                      <View style={[styles.chip, styles.chipBlue]}>
                        <Text style={styles.chipBlueText}>{calcAge(pet.birthdate, true)}</Text>
                      </View>
                    ) : null}
                    {weightText !== '-' ? (
                      <View style={[styles.chip, styles.chipPurple]}>
                        <Text style={styles.chipPurpleText}>{weightText}</Text>
                      </View>
                    ) : null}
                    {pet.verified ? (
                      <View style={[styles.chip, styles.chipGreen]}>
                        <Text style={styles.chipGreenText}>ยืนยันแล้ว</Text>
                      </View>
                    ) : (
                      <View style={[styles.chip, styles.chipOrange]}>
                        <Text style={styles.chipOrangeText}>รอการยืนยัน</Text>
                      </View>
                    )}
                  </View>
                </View>

                <View style={styles.arrowBtn}>
                  <Feather name="chevron-right" size={18} color="#2563EB" />
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F8FA' },
  headerBox: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 6 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#20435C' },
  subtitle: { fontSize: 13, color: '#64748B', marginTop: 2, marginBottom: 12 },

  sortContainer: { flexDirection: 'row', marginBottom: 6 },
  sortChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#E2E8F0',
    marginRight: 8,
  },
  sortChipActive: { backgroundColor: '#2563EB' },
  sortChipText: { fontSize: 12, color: '#475569', fontWeight: '600' },
  sortChipTextActive: { color: '#FFFFFF', fontWeight: 'bold' },

  content: { paddingHorizontal: 16, paddingTop: 6, paddingBottom: 60 },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  avatarWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#F1F5F9',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginRight: 14,
  },
  avatarImage: { width: '100%', height: '100%' },
  avatarEmoji: { fontSize: 32 },

  info: { flex: 1, marginRight: 8 },
  petName: { fontSize: 17, fontWeight: 'bold', color: '#1E293B' },
  petType: { fontSize: 12, color: '#64748B', marginTop: 1 },
  petBreed: { fontSize: 12, color: '#20435C', fontWeight: '500', marginTop: 1 },

  chipRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  chip: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8, marginRight: 6, marginBottom: 4 },
  chipBlue: { backgroundColor: '#EFF6FF' },
  chipBlueText: { color: '#2563EB', fontSize: 11, fontWeight: 'bold' },
  chipPurple: { backgroundColor: '#F1F5F9' },
  chipPurpleText: { color: '#475569', fontSize: 11, fontWeight: 'bold' },
  chipGreen: { backgroundColor: '#DCFCE7' },
  chipGreenText: { color: '#16A34A', fontSize: 11, fontWeight: 'bold' },
  chipOrange: { backgroundColor: '#FEF3C7' },
  chipOrangeText: { color: '#D97706', fontSize: 11, fontWeight: 'bold' },

  arrowBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyContainer: { alignItems: 'center', marginTop: 60, paddingHorizontal: 20 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 16, fontWeight: 'bold', color: '#64748B' },
  emptySubText: { fontSize: 13, color: '#94A3B8', marginTop: 6, textAlign: 'center', lineHeight: 20 },
});
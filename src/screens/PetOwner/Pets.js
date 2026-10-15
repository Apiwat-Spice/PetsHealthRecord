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
  const hasLoaded = useRef(false);

  // ดึงสัตว์เลี้ยงของเจ้าของที่ล็อกอินอยู่ (ข้อมูลถูกสร้างโดยคลินิกในระบบ)
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
        console.log('❌ ข้อความจาก Server (ไม่ใช่ JSON):', responseText);
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

  // โหลดข้อมูลใหม่ทุกครั้งที่กลับมาหน้านี้
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style="dark" />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2A4B6A']} />}
      >
        <Text style={styles.title}>สัตว์เลี้ยงของคุณ</Text>
        <Text style={styles.subtitle}>แตะที่การ์ดเพื่อดูรายละเอียดและประวัติสุขภาพ</Text>

        {isLoading ? (
          <ActivityIndicator size="large" color="#2A4B6A" style={{ marginTop: 50 }} />
        ) : pets.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyEmoji}>🐾</Text>
            <Text style={styles.emptyText}>{errorMsg ? 'โหลดข้อมูลไม่สำเร็จ' : 'ยังไม่มีสัตว์เลี้ยงในระบบ'}</Text>
            <Text style={styles.emptySubText}>
              {errorMsg || 'เมื่อคลินิกลงทะเบียนสัตว์เลี้ยงให้คุณ ข้อมูลจะแสดงที่นี่อัตโนมัติ'}
            </Text>
          </View>
        ) : (
          pets.map((pet) => {
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
                        <Text style={styles.chipText}>{calcAge(pet.birthdate, true)}</Text>
                      </View>
                    ) : null}
                    {weightText !== '-' ? (
                      <View style={[styles.chip, styles.chipPurple]}>
                        <Text style={styles.chipText}>{weightText}</Text>
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
                  <Feather name="arrow-right" size={16} color="#FFFFFF" />
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
  container: { flex: 1, backgroundColor: '#F4F7F6' },
  content: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 120 },

  title: { fontSize: 24, fontWeight: 'bold', color: '#4F7396' },
  subtitle: { fontSize: 13, color: '#8FA3B5', marginTop: 4, marginBottom: 20 },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFFAFF',
    borderWidth: 1,
    borderColor: '#C9DCE6',
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  avatarWrap: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#DCEBF5',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginRight: 14,
  },
  avatarImage: { width: '100%', height: '100%' },
  avatarEmoji: { fontSize: 34 },

  info: { flex: 1, marginRight: 8 },
  petName: { fontSize: 18, fontWeight: 'bold', color: '#1F2D3A' },
  petType: { fontSize: 13, color: '#7A8B98', marginTop: 1 },
  petBreed: { fontSize: 13, color: '#4F7396', marginTop: 1 },

  chipRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 8 },
  chip: { paddingHorizontal: 9, paddingVertical: 3, borderRadius: 8, marginRight: 6, marginBottom: 4 },
  chipText: { color: '#FFFFFF', fontSize: 11, fontWeight: 'bold' },
  chipBlue: { backgroundColor: '#2D9CDB' },
  chipPurple: { backgroundColor: '#7C8DB5' },
  chipGreen: { backgroundColor: '#D6F2E0' },
  chipGreenText: { color: '#2E9E5B', fontSize: 11, fontWeight: 'bold' },
  chipOrange: { backgroundColor: '#FDEBCB' },
  chipOrangeText: { color: '#C77A14', fontSize: 11, fontWeight: 'bold' },

  arrowBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#0F5CC0',
    alignItems: 'center',
    justifyContent: 'center',
  },

  emptyContainer: { alignItems: 'center', marginTop: 60, paddingHorizontal: 20 },
  emptyEmoji: { fontSize: 48, marginBottom: 12 },
  emptyText: { fontSize: 17, fontWeight: 'bold', color: '#7A8B98' },
  emptySubText: { fontSize: 13, color: '#A5B2BC', marginTop: 8, textAlign: 'center', lineHeight: 20 },
});
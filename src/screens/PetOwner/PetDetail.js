import React, { useState, useEffect, useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, Pressable, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import * as ImagePicker from 'expo-image-picker';
import { API_URL } from '../../config';
import { splitCautions } from './PetUtils';

import PetGeneralTab from './PetGeneralTab';
import PetHealthTab from './PetHealthTab';
import PetQrTab from './PetQrTab';

export default function PetDetail({ navigation, route }) {
  // 🟢 รองรับการรับค่าทั้งแบบส่ง pet มาทั้งก้อน หรือส่งมาแค่ petId
  const routeParams = route.params || {};
  const passedPet = routeParams.pet;
  const targetPetId = routeParams.petId || passedPet?.pet_id;

  const [pet, setPet] = useState(passedPet || null);
  const [upcoming, setUpcoming] = useState([]);
  const [history, setHistory] = useState([]);
  const [weightTrend, setWeightTrend] = useState([]);
  const [stats, setStats] = useState({ checkup: 0, vaccine: 0, treatment: 0, other: 0 });
  const [isLoading, setIsLoading] = useState(!passedPet); // ถ้าไม่มีข้อมูล pet เริ่มต้น ให้โหลดก่อน

  const initialTab = routeParams.initialTab || 'general';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [isResettingQr, setIsResettingQr] = useState(false);

  const fetchPetDetail = useCallback(async () => {
    if (!targetPetId) return; // ถ้าไม่มีรหัสสัตว์เลี้ยง ให้หยุดทำงาน

    try {
      const ownerString = await SecureStore.getItemAsync('pet_owners');
      if (!ownerString) return;
      const owner = JSON.parse(ownerString);
      const ownerId = owner.pet_owner_id ?? owner.pet_owners_id;

      // 🟢 ใช้ targetPetId ในการยิง API
      const response = await fetch(`${API_URL}/pets/detail/${targetPetId}?ownerId=${ownerId}`);
      if (response.ok) {
        const data = await response.json();
        setPet(data.pet);
        setUpcoming(data.upcoming || []);
        setHistory(data.history || []);
        setWeightTrend(data.weightTrend || []);
        setStats(data.stats || { checkup: 0, vaccine: 0, treatment: 0, other: 0 });
      }
    } catch (error) {
      console.log('Fetch Pet Detail Error:', error);
    } finally {
      setIsLoading(false);
    }
  }, [targetPetId]);

  useEffect(() => {
    fetchPetDetail();
  }, [fetchPetDetail])

  const handlePickAndUploadImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled) return;

    const selectedUri = result.assets[0].uri;
    const filename = selectedUri.split('/').pop() || `pet_${Date.now()}.jpg`;
    const match = /\.(\w+)$/.exec(filename);
    const ext = match ? match[1].toLowerCase() : 'jpg';
    const type = ext === 'png' ? 'image/png' : 'image/jpeg';

    setUploadingImage(true);
    try {
      const ownerString = await SecureStore.getItemAsync('pet_owners');
      const owner = JSON.parse(ownerString);
      const ownerId = owner.pet_owner_id ?? owner.pet_owners_id;

      const formData = new FormData();
      formData.append('pet_owner_id', String(ownerId));
      formData.append('pet_image', { uri: selectedUri, name: filename, type: type });

      const xhr = new XMLHttpRequest();
      xhr.open('PUT', `${API_URL}/pets/${pet.pet_id}`);
      xhr.setRequestHeader('Accept', 'application/json');

      xhr.onload = () => {
        setUploadingImage(false);
        try {
          const resJson = JSON.parse(xhr.responseText);
          if (xhr.status === 200) {
            Alert.alert('สำเร็จ', 'เปลี่ยนรูปโปรไฟล์สัตว์เลี้ยงเรียบร้อยแล้ว');
            setPet(resJson.pet);
          } else {
            Alert.alert('เกิดข้อผิดพลาด', resJson.message || 'ไม่สามารถอัปโหลดรูปภาพได้');
          }
        } catch (e) {
          Alert.alert('เกิดข้อผิดพลาด', 'รูปแบบข้อมูลจากเซิร์ฟเวอร์ไม่ถูกต้อง');
        }
      };

      xhr.onerror = () => {
        setUploadingImage(false);
        Alert.alert('Error', 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
      };

      xhr.send(formData);
    } catch (error) {
      console.log('Upload Image Error:', error);
      Alert.alert('Error', 'เกิดข้อผิดพลาดในการเลือกรูปภาพ');
      setUploadingImage(false);
    }
  };

  const handleResetQr = () => {
    Alert.alert(
      'ยืนยันการรีเซ็ต QR Code',
      'หากรีเซ็ตแล้ว โค้ดเดิมจะไม่สามารถนำมาสแกนดูข้อมูลได้อีก ต้องการสร้างใหม่หรือไม่?',
      [
        { text: 'ยกเลิก', style: 'cancel' },
        {
          text: 'รีเซ็ต',
          style: 'destructive',
          onPress: async () => {
            setIsResettingQr(true);
            try {
              const response = await fetch(`${API_URL}/pets/${pet?.pet_id}/reset-qr`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
              });

              const result = await response.json();
              if (response.ok) {
                setPet((prev) => ({ ...prev, qr_code: result.qr_code }));
                Alert.alert('สำเร็จ', 'สร้างและอัปเดต QR Code ใหม่เรียบร้อยแล้ว');
              } else {
                Alert.alert('เกิดข้อผิดพลาด', result.message || 'ไม่สามารถรีเซ็ตได้');
              }
            } catch (err) {
              console.log('Reset QR Error:', err);
              Alert.alert('Error', 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้');
            } finally {
              setIsResettingQr(false);
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#21445B" />
      </View>
    );
  }

  const cautions = splitCautions(pet?.detail);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Feather name="arrow-left" size={24} color="#FFF" />
        </Pressable>
        <Text style={styles.headerTitle}>{pet?.pet_name}</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'general' && styles.activeTab]}
          onPress={() => setActiveTab('general')}
        >
          <Text style={[styles.tabText, activeTab === 'general' && styles.activeTabText]}>
            ข้อมูลทั่วไป
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'health' && styles.activeTab]}
          onPress={() => setActiveTab('health')}
        >
          <Text style={[styles.tabText, activeTab === 'health' && styles.activeTabText]}>
            ประวัติสุขภาพ
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.tab, activeTab === 'qrcode' && styles.activeTab]}
          onPress={() => setActiveTab('qrcode')}
        >
          <Text style={[styles.tabText, activeTab === 'qrcode' && styles.activeTabText]}>
            QR Code
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'general' && (
          <PetGeneralTab
            pet={pet}
            cautions={cautions}
            upcoming={upcoming}
            uploadingImage={uploadingImage}
            onPickImage={handlePickAndUploadImage}
            navigation={navigation} // ส่ง navigation ไปให้กดคลิกการ์ดนัดหมายได้
          />
        )}

        {activeTab === 'health' && (
          <PetHealthTab
            weightTrend={weightTrend}
            stats={stats}
            history={history}
            navigation={navigation} // ส่ง navigation ไปเพื่อให้กดดูรายละเอียดการรักษาได้
          />
        )}

        {activeTab === 'qrcode' && (
          <PetQrTab
            pet={pet}
            onResetQr={handleResetQr}
            isResettingQr={isResettingQr}
          />
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EDF3F6' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#20435C',
  },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFF' },
  backBtn: { padding: 4 },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#DFE7EC',
    marginHorizontal: 16,
    marginTop: 14,
    marginBottom: 8,
    borderRadius: 25,
    padding: 3,
  },
  tab: { flex: 1, paddingVertical: 8, alignItems: 'center', borderRadius: 20 },
  activeTab: {
    backgroundColor: '#FFF',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  tabText: { fontSize: 13, color: '#688092', fontWeight: 'bold' },
  activeTabText: { color: '#20435C' },
  content: { paddingHorizontal: 16, paddingTop: 10, paddingBottom: 60 },
});
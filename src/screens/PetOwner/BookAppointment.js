import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Pressable,
  Alert,
  ActivityIndicator,
  Platform,
  Modal,
  FlatList,
  Image
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import DateTimePicker from '@react-native-community/datetimepicker';
import { API_URL } from '../../config';

const getLocalDateString = (d = new Date()) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function BookAppointment({ navigation, route }) {
  const { clinic: initialClinic } = route.params || {};
  const [clinic, setClinic] = useState(initialClinic);

  const [petModalVisible, setPetModalVisible] = useState(false);
  const [petValue, setPetValue] = useState(null);
  const [petItems, setPetItems] = useState([]);
  const [loadingPets, setLoadingPets] = useState(true);

  const [titleModalVisible, setTitleModalVisible] = useState(false);
  const [titleValue, setTitleValue] = useState(null);
  const [titleItems] = useState([
    { label: 'ตรวจสุขภาพประจำปี (Health Checkup)', value: 'Health Checkup' },
    { label: 'ฉีดวัคซีน (Vaccination)', value: 'Vaccination' },
    { label: 'ตรวจรักษาอาการป่วย (Sick Visit / Consultation)', value: 'Sick Visit / Consultation' },
    { label: 'ทำหมัน (Spay / Neuter)', value: 'Spay / Neuter' },
    { label: 'อาบน้ำตัดขน (Grooming)', value: 'Grooming' },
    { label: 'อาบน้ำ (Bathing)', value: 'Bathing' },
    { label: 'ตัดขน (Haircut)', value: 'Haircut' },
    { label: 'ฝากเลี้ยง (Boarding)', value: 'Boarding' },
    { label: 'อาบน้ำตัดขน / ฝากเลี้ยง (Grooming / Boarding)', value: 'Grooming / Boarding' },
  ]);

  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  const todayStr = getLocalDateString();
  const [dateText, setDateText] = useState(todayStr);
  const [dateObj, setDateObj] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [timeText, setTimeText] = useState('');
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);
  const [bookedTimes, setBookedTimes] = useState([]);

  const generateTimeSlots = (openTimeStr, closeTimeStr) => {
    let startHour = 9;
    let endHour = 18;
    if (openTimeStr) startHour = parseInt(openTimeStr.split(':')[0], 10);
    if (closeTimeStr) endHour = parseInt(closeTimeStr.split(':')[0], 10);

    const slots = [];
    for (let h = startHour; h < endHour; h++) {
      const hourStr = h.toString().padStart(2, '0');
      slots.push(`${hourStr}:00`);
      slots.push(`${hourStr}:30`);
    }
    slots.push(`${endHour.toString().padStart(2, '0')}:00`);
    setAvailableTimeSlots(slots);
  };

  const fetchBookedSlots = async (selectedDate, clinicId) => {
    try {
      const response = await fetch(`${API_URL}/appointments/clinic/${clinicId}/date/${selectedDate}`);
      if (response.ok) {
        const data = await response.json();
        const vetsLimit = data.totalVets || 1;
        const timeCounts = {};
        (data.appointments || []).forEach(a => {
          if (a.appointment_time) {
            const timeSlot = a.appointment_time.substring(0, 5);
            timeCounts[timeSlot] = (timeCounts[timeSlot] || 0) + 1;
          }
        });

        const fullyBooked = [];
        Object.keys(timeCounts).forEach(slot => {
          if (timeCounts[slot] >= vetsLimit) fullyBooked.push(slot);
        });

        setBookedTimes(fullyBooked);
      } else {
        setBookedTimes([]);
      }
    } catch (error) {
      console.log("Fetch booked slots error:", error);
      setBookedTimes([]);
    }
  };

  useEffect(() => {
    const fetchClinicAndPets = async () => {
      try {
        const clinicId = initialClinic?.clinic_id || 2;
        const clinicRes = await fetch(`${API_URL}/clinics/${clinicId}`);
        let currentClinic = initialClinic;
        if (clinicRes.ok) {
          currentClinic = await clinicRes.json();
          setClinic(currentClinic);
        }

        generateTimeSlots(currentClinic?.open_time, currentClinic?.close_time);
        fetchBookedSlots(todayStr, clinicId);

        const petOwnerData = await SecureStore.getItemAsync("pet_owners");
        if (petOwnerData) {
          const owner = JSON.parse(petOwnerData);
          const ownerId = owner.pet_owner_id ?? owner.pet_owners_id;

          const response = await fetch(`${API_URL}/pets/owner/${ownerId}`);
          if (response.ok) {
            const myPets = await response.json();
            if (myPets.length > 0) {
              const dropdownData = myPets.map(pet => ({
                label: `${pet.pet_name} (${pet.animal_type || 'สัตว์เลี้ยง'})`,
                value: pet.pet_id,
                image: pet.pet_image_url || null,
              }));
              setPetItems(dropdownData);
            }
          }
        }
      } catch (error) {
        console.log("Fetch error:", error);
        generateTimeSlots('09:00:00', '18:00:00');
      } finally {
        setLoadingPets(false);
      }
    };

    fetchClinicAndPets();
  }, [initialClinic]);

  const onChangeDate = (event, selectedDate) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setDateObj(selectedDate);
      const formattedDate = getLocalDateString(selectedDate);
      setDateText(formattedDate);
      setTimeText('');
      const clinicId = clinic?.clinic_id || 2;
      fetchBookedSlots(formattedDate, clinicId);
    }
  };

  const handleBook = async () => {
    if (!petValue || !titleValue || !dateText || !timeText) {
      return Alert.alert('แจ้งเตือน', 'กรุณากรอกข้อมูล วันที่ และเลือกช่วงเวลาให้ครบถ้วน');
    }

    const formattedTime = timeText.length === 5 ? `${timeText}:00` : timeText;
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/appointments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pet_id: petValue,
          clinic_id: clinic?.clinic_id || 2,
          appointment_date: dateText,
          appointment_time: formattedTime,
          type: 'Appointment',
          title: titleValue,
          detail: note,
          status: 'pending'
        })
      });

      if (response.ok) {
        Alert.alert('สำเร็จ', 'ส่งคำขอสร้างการนัดหมายเรียบร้อยแล้ว', [
          { text: 'ตกลง', onPress: () => navigation.goBack() }
        ]);
      } else {
        const result = await response.json();
        Alert.alert('เกิดข้อผิดพลาด', result.message || 'ไม่สามารถสร้างการนัดหมายได้');
      }
    } catch (error) {
      Alert.alert('Error', `ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้`);
    } finally {
      setLoading(false);
    }
  };

  const selectedPet = petItems.find(i => i.value === petValue);
  const selectedTitleLabel = titleItems.find(i => i.value === titleValue)?.label;

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={22} color="#FFF" />
        </Pressable>
        <Text style={styles.headerTitle}>นัดหมายคลินิก</Text>
        <View style={{ width: 22 }} />
      </View>

      {/* Clinic Bar */}
      <View style={styles.clinicBar}>
        {clinic?.profile_image_url && !imageError ? (
          <Image
            source={{ uri: clinic.profile_image_url }}
            style={styles.clinicAvatar}
            onError={() => setImageError(true)}
          />
        ) : (
          <View style={styles.clinicPlaceholder}>
            <MaterialCommunityIcons name="hospital-building" size={20} color="#2C4A6F" />
          </View>
        )}
        <View style={styles.clinicInfoContainer}>
          <Text style={styles.clinicName}>{clinic?.clinic_name || 'คลินิกรักษาสัตว์'}</Text>
          <View style={styles.clinicTimeRow}>
            <Feather name="clock" size={12} color="#64748B" style={{ marginRight: 4 }} />
            <Text style={styles.clinicTimeSub}>
              เวลาทำการ: {clinic?.open_time ? clinic.open_time.substring(0, 5) : '09:00'} - {clinic?.close_time ? clinic.close_time.substring(0, 5) : '18:00'} น.
            </Text>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.formContainer} showsVerticalScrollIndicator={false}>

        <Text style={styles.label}>เลือกสัตว์เลี้ยง</Text>
        {loadingPets ? (
          <ActivityIndicator color="#2C4A6F" style={{ marginVertical: 15 }} />
        ) : (
          <TouchableOpacity style={styles.pickerWrapper} onPress={() => setPetModalVisible(true)} activeOpacity={0.8}>
            {selectedPet?.image ? (
              <Image source={{ uri: selectedPet.image }} style={styles.selectedPetAvatar} />
            ) : (
              <MaterialCommunityIcons name="paw" size={18} color="#2C4A6F" style={styles.leftIcon} />
            )}
            <Text style={petValue ? styles.pickerTextValue : styles.pickerTextPlaceholder}>
              {petValue ? selectedPet?.label : "-- เลือกสัตว์เลี้ยงของคุณ --"}
            </Text>
            <Feather name="chevron-down" size={18} color="#94A3B8" />
          </TouchableOpacity>
        )}

        <Text style={styles.label}>หัวข้อนัดหมาย</Text>
        <TouchableOpacity style={styles.pickerWrapper} onPress={() => setTitleModalVisible(true)} activeOpacity={0.8}>
          <Feather name="list" size={18} color="#2C4A6F" style={styles.leftIcon} />
          <Text style={titleValue ? styles.pickerTextValue : styles.pickerTextPlaceholder}>
            {titleValue ? selectedTitleLabel : "-- เลือกหัวข้อนัดหมาย --"}
          </Text>
          <Feather name="chevron-down" size={18} color="#94A3B8" />
        </TouchableOpacity>

        <Text style={styles.label}>วันที่นัดหมาย</Text>
        <TouchableOpacity style={styles.pickerWrapper} onPress={() => setShowDatePicker(true)} activeOpacity={0.8}>
          <Feather name="calendar" size={18} color="#2C4A6F" style={styles.leftIcon} />
          <Text style={dateText ? styles.pickerTextValue : styles.pickerTextPlaceholder}>
            {dateText ? `วันที่เลือก: ${dateText}` : "แตะเพื่อเลือกวันที่นัดหมาย"}
          </Text>
          <Feather name="chevron-down" size={18} color="#94A3B8" />
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={dateObj}
            mode="date"
            display="default"
            onChange={onChangeDate}
            minimumDate={new Date()}
          />
        )}

        <Text style={styles.label}>ช่วงเวลาที่ต้องการ (เวลาทำการคลินิก)</Text>
        <View style={styles.timeSlotsContainer}>
          {availableTimeSlots.map((slot) => {
            const isSelected = timeText === slot;
            const isBooked = bookedTimes.includes(slot);

            return (
              <TouchableOpacity
                key={slot}
                style={[
                  styles.timeSlotChip,
                  isSelected && styles.timeSlotChipSelected,
                  isBooked && styles.timeSlotChipDisabled
                ]}
                onPress={() => !isBooked && setTimeText(slot)}
                disabled={isBooked}
                activeOpacity={0.8}
              >
                <Feather
                  name="clock"
                  size={13}
                  color={isSelected ? '#FFF' : isBooked ? '#CBD5E1' : '#2C4A6F'}
                  style={{ marginRight: 5 }}
                />
                <Text style={[
                  styles.timeSlotText,
                  isSelected && styles.timeSlotTextSelected,
                  isBooked && styles.timeSlotTextDisabled
                ]}>
                  {slot} {isBooked ? '(เต็ม)' : 'น.'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.label}>รายละเอียดอาการเพิ่มเติม</Text>
        <View style={styles.textAreaWrapper}>
          <TextInput
            style={styles.textArea}
            placeholder="ระบุอาการเบื้องต้น หรือความต้องการพิเศษ..."
            placeholderTextColor="#94A3B8"
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={4}
          />
        </View>

        <Text style={styles.footerText}>ทางคลินิกจะตรวจสอบและอนุมัติคำขอของคุณภายหลัง</Text>
      </ScrollView>

      {/* Modal สัตว์เลี้ยง */}
      <Modal visible={petModalVisible} transparent animationType="fade" onRequestClose={() => setPetModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitleText}>เลือกสัตว์เลี้ยงของคุณ</Text>
              <TouchableOpacity onPress={() => setPetModalVisible(false)}>
                <Feather name="x" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={petItems}
              keyExtractor={(item) => item.value.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.modalItem, petValue === item.value && styles.modalItemSelected]}
                  onPress={() => {
                    setPetValue(item.value);
                    setPetModalVisible(false);
                  }}
                >
                  <View style={styles.petItemRow}>
                    {item.image ? (
                      <Image source={{ uri: item.image }} style={styles.modalPetAvatar} />
                    ) : (
                      <View style={styles.modalPetPlaceholder}>
                        <MaterialCommunityIcons name="paw" size={16} color="#2C4A6F" />
                      </View>
                    )}
                    <Text style={[styles.modalItemText, petValue === item.value && styles.modalItemTextSelected]}>
                      {item.label}
                    </Text>
                  </View>
                  {petValue === item.value && <Feather name="check" size={18} color="#2C4A6F" />}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* Modal หัวข้อ */}
      <Modal visible={titleModalVisible} transparent animationType="fade" onRequestClose={() => setTitleModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitleText}>เลือกหัวข้อนัดหมาย</Text>
              <TouchableOpacity onPress={() => setTitleModalVisible(false)}>
                <Feather name="x" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>
            <FlatList
              data={titleItems}
              keyExtractor={(item) => item.value}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.modalItem, titleValue === item.value && styles.modalItemSelected]}
                  onPress={() => {
                    setTitleValue(item.value);
                    setTitleModalVisible(false);
                  }}
                >
                  <Text style={[styles.modalItemText, titleValue === item.value && styles.modalItemTextSelected]}>
                    {item.label}
                  </Text>
                  {titleValue === item.value && <Feather name="check" size={18} color="#2C4A6F" />}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.confirmButton} onPress={handleBook} disabled={loading} activeOpacity={0.85}>
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.confirmButtonText}>ยืนยันการนัดหมาย</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F8FB' },
  header: { backgroundColor: '#20435C', paddingHorizontal: 16, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backButton: { padding: 4 },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },

  clinicBar: { backgroundColor: '#FFFFFF', padding: 14, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E2EBF2' },
  clinicAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12, borderWidth: 1, borderColor: '#96B9D7' },
  clinicPlaceholder: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#EBF3FA', justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  clinicInfoContainer: { flex: 1 },
  clinicName: { color: '#1E3A5F', fontSize: 15, fontWeight: 'bold' },
  clinicTimeRow: { flexDirection: 'row', alignItems: 'center', marginTop: 2 },
  clinicTimeSub: { color: '#64748B', fontSize: 12 },

  formContainer: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 24 },
  label: { fontSize: 13, fontWeight: 'bold', color: '#1E3A5F', marginBottom: 6, marginTop: 12 },

  pickerWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, paddingHorizontal: 14, backgroundColor: '#FFF', height: 48 },
  pickerTextPlaceholder: { flex: 1, color: '#94A3B8', fontSize: 14, marginLeft: 6 },
  pickerTextValue: { flex: 1, color: '#1E293B', fontWeight: 'bold', fontSize: 14, marginLeft: 6 },
  leftIcon: { marginRight: 4 },
  selectedPetAvatar: { width: 26, height: 26, borderRadius: 13, marginRight: 6 },

  timeSlotsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  timeSlotChip: { width: '31%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 8, backgroundColor: '#FFF', marginBottom: 8 },
  timeSlotChipSelected: { backgroundColor: '#2C4A6F', borderColor: '#2C4A6F' },
  timeSlotChipDisabled: { backgroundColor: '#F1F5F9', borderColor: '#E2E8F0' },
  timeSlotText: { fontSize: 12, color: '#2C4A6F', fontWeight: '600' },
  timeSlotTextSelected: { color: '#FFF' },
  timeSlotTextDisabled: { color: '#94A3B8' },

  textAreaWrapper: { borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, paddingHorizontal: 12, backgroundColor: '#FFF' },
  textArea: { height: 90, textAlignVertical: 'top', paddingTop: 10, fontSize: 14, color: '#1E293B' },
  footerText: { fontSize: 12, color: '#64748B', marginTop: 16, textAlign: 'center' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(15, 23, 42, 0.4)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContainer: { backgroundColor: '#FFF', borderRadius: 16, width: '100%', maxHeight: '70%', paddingVertical: 14, paddingHorizontal: 12 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 10, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  modalTitleText: { fontSize: 15, fontWeight: 'bold', color: '#1E3A5F' },
  modalItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 10, borderBottomWidth: 1, borderBottomColor: '#F8FAFC' },
  modalItemSelected: { backgroundColor: '#EBF3FA', borderRadius: 8 },
  petItemRow: { flexDirection: 'row', alignItems: 'center' },
  modalPetAvatar: { width: 32, height: 32, borderRadius: 16, marginRight: 10 },
  modalPetPlaceholder: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#EBF3FA', justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  modalItemText: { fontSize: 13, color: '#333' },
  modalItemTextSelected: { color: '#2C4A6F', fontWeight: 'bold' },

  bottomBar: { paddingHorizontal: 16, paddingVertical: 12, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#E2EBF2' },
  confirmButton: { backgroundColor: '#2C4A6F', height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  confirmButtonText: { color: '#FFF', fontSize: 15, fontWeight: 'bold' }
});
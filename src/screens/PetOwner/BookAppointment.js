import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Pressable, Alert, ActivityIndicator, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import DropDownPicker from 'react-native-dropdown-picker';
import * as SecureStore from 'expo-secure-store';
import DateTimePicker from '@react-native-community/datetimepicker';
import { API_URL } from '../../config';

// 🟢 ฟังก์ชันช่วยแปลงวันที่เป็น YYYY-MM-DD ตามเวลาท้องถิ่น (แก้ปัญหาติด UTC ลดไป 1 วัน)
const getLocalDateString = (d = new Date()) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function BookAppointment({ navigation, route }) {
  const { clinic: initialClinic } = route.params || {};
  const [clinic, setClinic] = useState(initialClinic);

  const [petOpen, setPetOpen] = useState(false);
  const [petValue, setPetValue] = useState(null);
  const [petItems, setPetItems] = useState([]);
  const [loadingPets, setLoadingPets] = useState(true);

  const [titleOpen, setTitleOpen] = useState(false);
  const [titleValue, setTitleValue] = useState(null);
  const [titleItems, setTitleItems] = useState([
    { label: 'ตรวจสุขภาพประจำปี (Health Checkup)', value: 'Health Checkup' },
    { label: 'ฉีดวัคซีน (Vaccination)', value: 'Vaccination' },
    { label: 'ตรวจรักษาอาการป่วย (Sick Visit / Consultation)', value: 'Sick Visit / Consultation' },
    { label: 'ทำหมัน (Spay / Neuter)', value: 'Spay / Neuter' },
    { label: 'อาบน้ำตัดขน / ฝากเลี้ยง (Grooming / Boarding)', value: 'Grooming / Boarding' },
  ]);

  const [note, setNote] = useState('');
  const [loading, setLoading] = useState(false);

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

    if (openTimeStr) {
      startHour = parseInt(openTimeStr.split(':')[0], 10);
    }
    if (closeTimeStr) {
      endHour = parseInt(closeTimeStr.split(':')[0], 10);
    }

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
        const booked = (data.appointments || []).map(a =>
          a.appointment_time ? a.appointment_time.substring(0, 5) : ''
        );
        setBookedTimes(booked);
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
      const result = await response.json();

      if (response.ok) {
        Alert.alert('สำเร็จ', 'ส่งคำขอสร้างการนัดหมายเรียบร้อยแล้ว', [
          {
            text: 'ตกลง',
            onPress: () => navigation.goBack()
          }
        ]);
      } else {
        Alert.alert('เกิดข้อผิดพลาด', result.message || 'ไม่สามารถสร้างการนัดหมายได้');
      }
    } catch (error) {
      console.log("Booking Fetch Error:", error.message);
      Alert.alert('Error', `ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ (${error.message})`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#FFF" />
        </Pressable>
        <Text style={styles.headerTitle}>นัดหมายคลินิก</Text>
      </View>

      <View style={styles.clinicBar}>
        <Text style={styles.clinicName}>{clinic?.clinic_name || 'คลินิกรักษาสัตว์'}</Text>
        <Text style={styles.clinicTimeSub}>
          เวลาทำการ: {clinic?.open_time ? clinic.open_time.substring(0, 5) : '09:00'} - {clinic?.close_time ? clinic.close_time.substring(0, 5) : '18:00'} น.
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.formContainer} nestedScrollEnabled={true}>
        <Text style={styles.label}>เลือกสัตว์เลี้ยง</Text>
        <View style={{ zIndex: 3000, marginBottom: 15 }}>
          {loadingPets ? (
            <ActivityIndicator color="#0056D2" />
          ) : (
            <DropDownPicker
              open={petOpen}
              value={petValue}
              items={petItems}
              setOpen={setPetOpen}
              setValue={setPetValue}
              setItems={setPetItems}
              placeholder="-- เลือกสัตว์เลี้ยงของคุณ --"
              style={styles.dropdownStyle}
              dropDownContainerStyle={styles.dropdownContainerStyle}
              textStyle={styles.dropdownText}
              listMode="SCROLLVIEW"
              zIndex={3000}
              zIndexInverse={1000}
            />
          )}
        </View>

        <Text style={styles.label}>หัวข้อนัดหมาย</Text>
        <View style={{ zIndex: 2000, marginBottom: 15 }}>
          <DropDownPicker
            open={titleOpen}
            value={titleValue}
            items={titleItems}
            setOpen={setTitleOpen}
            setValue={setTitleValue}
            setItems={setTitleItems}
            placeholder="-- เลือกหัวข้อนัดหมาย --"
            style={styles.dropdownStyle}
            dropDownContainerStyle={styles.dropdownContainerStyle}
            textStyle={styles.dropdownText}
            listMode="SCROLLVIEW"
            zIndex={2000}
            zIndexInverse={2000}
          />
        </View>

        <Text style={styles.label}>วันที่นัดหมาย</Text>
        <TouchableOpacity style={styles.pickerWrapper} onPress={() => setShowDatePicker(true)}>
          <Feather name="calendar" size={18} color="#0056D2" style={styles.leftIcon} />
          <Text style={dateText ? styles.pickerTextValue : styles.pickerTextPlaceholder}>
            {dateText ? `วันที่เลือก: ${dateText}` : "แตะเพื่อเลือกวันที่นัดหมาย"}
          </Text>
          <Feather name="chevron-down" size={18} color="#666" />
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
              >
                <Feather
                  name="clock"
                  size={14}
                  color={isSelected ? '#FFF' : isBooked ? '#ccc' : '#0056D2'}
                  style={{ marginRight: 6 }}
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
            value={note}
            onChangeText={setNote}
            multiline
            numberOfLines={4}
          />
        </View>

        <Text style={styles.footerText}>ทางคลินิกจะตรวจสอบและอนุมัติคำขอของคุณภายหลัง</Text>
      </ScrollView>

      <View style={styles.bottomBar}>
        <TouchableOpacity style={styles.confirmButton} onPress={handleBook} disabled={loading}>
          {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.confirmButtonText}>ยืนยันการนัดหมาย</Text>}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFF' },
  header: { backgroundColor: '#0056D2', padding: 20, paddingTop: 20, flexDirection: 'row', alignItems: 'center' },
  backButton: { marginRight: 15 },
  headerTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  clinicBar: { backgroundColor: '#EAF4F4', padding: 15, borderBottomWidth: 1, borderBottomColor: '#D0E1FD' },
  clinicName: { color: '#0056D2', fontSize: 16, fontWeight: 'bold' },
  clinicTimeSub: { color: '#555', fontSize: 12, marginTop: 2 },
  formContainer: { padding: 20 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#0056D2', marginBottom: 6, marginTop: 12 },

  dropdownStyle: { borderColor: '#D0E1FD', borderWidth: 1, borderRadius: 8, backgroundColor: '#FFF', minHeight: 45 },
  dropdownContainerStyle: { borderColor: '#D0E1FD', borderWidth: 1, backgroundColor: '#FFF' },
  dropdownText: { fontSize: 14, color: '#333' },

  pickerWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#D0E1FD', borderRadius: 8, paddingHorizontal: 12, backgroundColor: '#FFF', height: 48, marginBottom: 5 },
  pickerTextPlaceholder: { flex: 1, color: '#999', fontSize: 14, marginLeft: 8 },
  pickerTextValue: { flex: 1, color: '#0056D2', fontWeight: 'bold', fontSize: 14, marginLeft: 8 },
  leftIcon: { marginRight: 5 },

  timeSlotsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  timeSlotChip: {
    width: '31%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: '#D0E1FD',
    borderRadius: 8,
    backgroundColor: '#F8FBFF',
    marginBottom: 10,
  },
  timeSlotChipSelected: {
    backgroundColor: '#0056D2',
    borderColor: '#0056D2',
  },
  timeSlotChipDisabled: {
    backgroundColor: '#F0F0F0',
    borderColor: '#E0E0E0',
  },
  timeSlotText: {
    fontSize: 13,
    color: '#0056D2',
    fontWeight: '600',
  },
  timeSlotTextSelected: {
    color: '#FFF',
  },
  timeSlotTextDisabled: {
    color: '#AAA',
  },

  textAreaWrapper: { borderWidth: 1, borderColor: '#D0E1FD', borderRadius: 8, paddingHorizontal: 10, backgroundColor: '#FFF', zIndex: 1 },
  textArea: { height: 100, textAlignVertical: 'top', paddingTop: 10, color: '#333' },
  footerText: { fontSize: 12, color: '#888', marginTop: 20, textAlign: 'center', zIndex: 1 },
  bottomBar: { padding: 20, backgroundColor: '#FFF', borderTopWidth: 1, borderTopColor: '#EEE' },
  confirmButton: { backgroundColor: '#0056D2', paddingVertical: 15, borderRadius: 10, alignItems: 'center' },
  confirmButtonText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' }
});
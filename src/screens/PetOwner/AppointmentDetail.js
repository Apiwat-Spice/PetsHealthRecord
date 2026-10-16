import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { API_URL } from '../../config';

export default function AppointmentDetail({ navigation, route }) {
  const { appointmentId } = route.params || {};
  const [detailData, setDetailData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDetail();
  }, []);

  const fetchDetail = async () => {
    try {
      const response = await fetch(`${API_URL}/appointments/${appointmentId}`);
      if (response.ok) {
        const data = await response.json();
        setDetailData(data);
      } else {
        Alert.alert('แจ้งเตือน', 'ไม่สามารถโหลดข้อมูลรายละเอียดได้');
      }
    } catch (error) {
      console.log('Error fetching detail:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loaderContainer}>
        <ActivityIndicator size="large" color="#0056D2" />
      </View>
    );
  }

  const getStatusInfo = (status) => {
    switch (status) {
      case 'confirmed': return { label: 'นัดหมายแล้ว (ใกล้ถึงแล้ว)', color: '#4CAF50' };
      case 'completed': return { label: 'สำเร็จ', color: '#00897B' };
      case 'cancelled': return { label: 'ยกเลิก', color: '#F44336' };
      default: return { label: 'รอยืนยัน', color: '#F5A623' };
    }
  };

  const translateType = (type) => {
    switch (type) {
      case 'Walk-in': return 'เข้ารับบริการหน้าคลินิก (Walk-in)';
      case 'Follow-up': return 'นัดติดตามอาการ';
      case 'Appointment': return 'นัดหมายผ่านแอป';
      case 'Surgery / Procedure': return 'ผ่าตัด / หัตถการ';
      case 'Treatment / Wound Care': return 'รักษา / ทำแผล';
      default: return type || 'นัดหมายทั่วไป';
    }
  };

  const translateTitle = (title) => {
    switch (title) {
      case 'Health Checkup': return 'ตรวจสุขภาพประจำปี';
      case 'Vaccination': return 'ฉีดวัคซีน';
      case 'Sick Visit / Consultation': return 'ตรวจรักษาอาการป่วย';
      case 'Spay / Neuter': return 'ทำหมัน';
      case 'Grooming / Boarding': return 'อาบน้ำตัดขน / ฝากเลี้ยง';
      default: return title || 'ตรวจสุขภาพทั่วไป';
    }
  };

  const handleCancelAppointment = () => {
    Alert.alert(
      "ยืนยันการยกเลิกนัด",
      "คุณต้องการยกเลิกนัดหมายนี้ใช่หรือไม่?",
      [
        { text: "ไม่", style: "cancel" },
        {
          text: "ใช่, ยกเลิกนัด",
          style: "destructive",
          onPress: async () => {
            try {
              const response = await fetch(`${API_URL}/appointments/cancel/${appointmentId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status_detail: 'เจ้าของสัตว์เลี้ยงกดยกเลิกผ่านแอปพลิเคชัน' })
              });
              if (response.ok) {
                Alert.alert("สำเร็จ", "ยกเลิกนัดหมายเรียบร้อยแล้ว");
                navigation.goBack();
              } else {
                Alert.alert("แจ้งเตือน", "ไม่สามารถยกเลิกนัดหมายได้");
              }
            } catch (err) {
              console.log("Cancel Error:", err);
            }
          }
        }
      ]
    );
  };

  const statusInfo = getStatusInfo(detailData?.status);

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={24} color="#FFF" />
        </Pressable>
        <Text style={styles.headerTitle}>รายละเอียดการนัดหมาย</Text>
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer}>

        {/* ส่วนที่ 1: ข้อมูลการนัดหมาย */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>ข้อมูลทั่วไป</Text>

          <View style={styles.rowItem}>
            <Text style={styles.label}>ชื่อสถานพยาบาล</Text>
            <Text style={styles.value}>{detailData?.clinics?.clinic_name || 'คลินิกรักษาสัตว์'}</Text>
          </View>

          <View style={styles.rowItem}>
            <Text style={styles.label}>สัตว์เลี้ยง</Text>
            <Text style={styles.value}>{detailData?.pets?.pet_name || 'ไม่ระบุ'}</Text>
          </View>

          <View style={styles.rowItem}>
            <Text style={styles.label}>วันที่นัดหมาย</Text>
            <Text style={styles.value}>{detailData?.appointment_date}</Text>
          </View>

          <View style={styles.rowItem}>
            <Text style={styles.label}>เวลา</Text>
            <Text style={styles.value}>{detailData?.appointment_time?.substring(0, 5)} น.</Text>
          </View>

          <View style={styles.rowItem}>
            <Text style={styles.label}>สถานะปัจจุบัน</Text>
            <View style={[styles.statusBadge, { backgroundColor: statusInfo.color }]}>
              <Text style={styles.statusText}>{statusInfo.label}</Text>
            </View>
          </View>
        </View>

        {/* ส่วนที่ 2: ข้อมูลการรักษา / บริการ */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>รายละเอียดการรักษา</Text>

          <View style={styles.rowItem}>
            <Text style={styles.label}>ประเภทการนัดหมาย</Text>
            <Text style={styles.value}>{translateType(detailData?.type)}</Text>
          </View>

          <View style={styles.rowItem}>
            <Text style={styles.label}>หัวข้อบริการ</Text>
            <Text style={styles.value}>{translateTitle(detailData?.title)}</Text>
          </View>

          <View style={styles.rowItem}>
            <Text style={styles.label}>รายละเอียดอาการ</Text>
            <Text style={styles.value}>{detailData?.detail || 'ไม่มีข้อมูลเพิ่มเติม'}</Text>
          </View>
        </View>

        {/* ส่วนที่ 3: บุคลากรผู้ดูแล */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>ผู้รับผิดชอบเคส</Text>

          <View style={styles.rowItem}>
            <Text style={styles.label}>สัตวแพทย์ผู้ตรวจ</Text>
            <Text style={styles.value}>
              {detailData?.vets?.first_name
                ? `น.สพ. ${detailData.vets.first_name} ${detailData.vets.last_name || ''}`
                : 'รอยืนยันรายชื่อแพทย์'}
            </Text>
          </View>

          <View style={styles.rowItem}>
            <Text style={styles.label}>เจ้าหน้าที่บันทึก</Text>
            <Text style={styles.value}>
              {detailData?.clinic_staff?.first_name
                ? `${detailData.clinic_staff.first_name} ${detailData.clinic_staff.last_name || ''}`
                : 'รอยืนยันรายชื่อเจ้าหน้าที่'}
            </Text>
          </View>
        </View>

        {/* ส่วนที่ 4: เหตุผลการยกเลิก (แสดงเฉพาะเมื่อถูกยกเลิก) */}
        {detailData?.status === 'cancelled' && (
          <View style={styles.cancelSectionCard}>
            <Text style={styles.cancelSectionTitle}>ข้อมูลการยกเลิก</Text>
            <View style={styles.cancelReasonBox}>
              <Text style={styles.cancelReasonLabel}>เหตุผลที่ยกเลิก:</Text>
              <Text style={styles.cancelReasonText}>
                {detailData?.status_detail || 'ไม่ได้ระบุเหตุผล'}
              </Text>
            </View>
          </View>
        )}

        {/* ส่วนที่ 5: ปุ่มยกเลิกนัด */}
        {detailData?.status !== 'cancelled' && detailData?.status !== 'completed' && (
          <Pressable style={styles.cancelButton} onPress={handleCancelAppointment}>
            <Text style={styles.cancelButtonText}>ยกเลิกนัดหมายนี้</Text>
          </Pressable>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#EAF4F4' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { backgroundColor: '#0056D2', padding: 20, paddingTop: 20, flexDirection: 'row', alignItems: 'center' },
  backButton: { marginRight: 15 },
  headerTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
  contentContainer: { padding: 15, paddingBottom: 30 },

  sectionCard: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginBottom: 15, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#0056D2', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F0F0F0', paddingBottom: 6 },

  rowItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  label: { fontSize: 13, color: '#666', flex: 1, marginRight: 10 },
  value: { fontSize: 13, color: '#333', fontWeight: '500', flex: 1.2, textAlign: 'right' },

  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  statusText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },

  cancelSectionCard: { backgroundColor: '#FFF5F5', borderRadius: 12, padding: 16, marginBottom: 15, borderWidth: 1, borderColor: '#FED7D7' },
  cancelSectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#E53E3E', marginBottom: 10, borderBottomWidth: 1, borderBottomColor: '#FED7D7', paddingBottom: 6 },
  cancelReasonBox: { marginTop: 4 },
  cancelReasonLabel: { fontSize: 13, color: '#C53030', fontWeight: '600', marginBottom: 4 },
  cancelReasonText: { fontSize: 13, color: '#9B2C2C', lineHeight: 18 },

  cancelButton: {
    backgroundColor: '#FFF5F5',
    borderWidth: 1,
    borderColor: '#FEB2B2',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    marginTop: 5,
    marginBottom: 20
  },
  cancelButtonText: {
    color: '#E53E3E',
    fontSize: 15,
    fontWeight: 'bold'
  }
});
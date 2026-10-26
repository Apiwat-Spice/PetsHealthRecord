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
        <ActivityIndicator size="large" color="#2C4A6F" />
        <Text style={{ marginTop: 10, color: '#64748B', fontSize: 13 }}>กำลังโหลดข้อมูล...</Text>
      </View>
    );
  }

  const getStatusInfo = (status) => {
    switch (status) {
      case 'confirmed': return { label: 'นัดหมายแล้ว (รอเข้ารับบริการ)', color: '#2C4A6F', bgColor: '#EBF3FA', icon: 'calendar' };
      case 'completed': return { label: 'ดำเนินการสำเร็จ (ประวัติการรักษา)', color: '#059669', bgColor: '#ECFDF5', icon: 'check-circle' };
      case 'cancelled': return { label: 'ยกเลิกการนัดหมายแล้ว', color: '#DC2626', bgColor: '#FEF2F2', icon: 'x-circle' };
      default: return { label: 'รอยืนยันจากทางคลินิก', color: '#D97706', bgColor: '#FFFBEB', icon: 'clock' };
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
      case 'Grooming': return 'อาบน้ำตัดขน';
      case 'Boarding': return 'ฝากเลี้ยงสัตว์เลี้ยง';
      default: return title || 'นัดหมายทั่วไป';
    }
  };

  const checkCanCancel = () => {
    if (!detailData?.appointment_date) return false;
    const apptDate = new Date(detailData.appointment_date);
    const today = new Date();
    apptDate.setHours(0, 0, 0, 0);
    today.setHours(0, 0, 0, 0);
    const diffTime = apptDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 3;
  };

  const canCancel = checkCanCancel();
  const isCompleted = detailData?.status === 'completed';
  const statusInfo = getStatusInfo(detailData?.status);

  const handleCancelAppointment = () => {
    Alert.alert(
      "ยืนยันการยกเลิกนัด",
      "คุณต้องการยกเลิกนัดหมายนี้ใช่หรือไม่?\n(การยกเลิกจะไม่สามารถย้อนกลับได้)",
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

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
          <Feather name="arrow-left" size={22} color="#FFF" />
        </Pressable>
        <Text style={styles.headerTitle}>{isCompleted ? 'ประวัติการรักษา' : 'รายละเอียดการนัดหมาย'}</Text>
        <View style={{ width: 22 }} />
      </View>

      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>

        <View style={[styles.statusBanner, { backgroundColor: statusInfo.bgColor, borderColor: statusInfo.color }]}>
          <Feather name={statusInfo.icon} size={18} color={statusInfo.color} style={{ marginRight: 8 }} />
          <Text style={[styles.statusBannerText, { color: statusInfo.color }]}>{statusInfo.label}</Text>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionTitleContainer}>
            <Feather name="file-text" size={16} color="#2C4A6F" style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>ข้อมูลทั่วไป</Text>
          </View>

          <View style={styles.rowItem}>
            <Text style={styles.label}>ชื่อสถานพยาบาล</Text>
            <Text style={styles.valueHighlight}>{detailData?.clinics?.clinic_name || 'คลินิกรักษาสัตว์'}</Text>
          </View>

          <View style={styles.rowItem}>
            <Text style={styles.label}>สัตว์เลี้ยง</Text>
            <Text style={styles.value}>{detailData?.pets?.pet_name || 'ไม่ระบุ'}</Text>
          </View>

          <View style={styles.rowItem}>
            <Text style={styles.label}>{isCompleted ? 'วันที่เข้ารับบริการ' : 'วันที่นัดหมาย'}</Text>
            <View style={styles.valueWithIcon}>
              <Feather name="calendar" size={13} color="#64748B" style={{ marginRight: 6 }} />
              <Text style={styles.valueTextBold}>{detailData?.appointment_date}</Text>
            </View>
          </View>

          <View style={styles.rowItem}>
            <Text style={styles.label}>เวลา</Text>
            <View style={styles.valueWithIcon}>
              <Feather name="clock" size={13} color="#64748B" style={{ marginRight: 6 }} />
              <Text style={styles.valueTextBold}>{detailData?.appointment_time?.substring(0, 5)} น.</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionTitleContainer}>
            <Feather name={isCompleted ? "clipboard" : "activity"} size={16} color="#2C4A6F" style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>{isCompleted ? 'สรุปประวัติการรักษา' : 'รายละเอียดการรักษา'}</Text>
          </View>

          <View style={styles.rowItem}>
            <Text style={styles.label}>ประเภท</Text>
            <Text style={styles.value}>{translateType(detailData?.type)}</Text>
          </View>

          <View style={styles.rowItem}>
            <Text style={styles.label}>บริการ</Text>
            <Text style={styles.value}>{translateTitle(detailData?.title)}</Text>
          </View>

          <View style={styles.rowItemCol}>
            <Text style={styles.label}>รายละเอียดเพิ่มเติม</Text>
            <View style={styles.detailBox}>
              <Text style={styles.detailText}>{detailData?.detail || 'ไม่มีข้อมูลเพิ่มเติม'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <View style={styles.sectionTitleContainer}>
            <Feather name="users" size={16} color="#2C4A6F" style={styles.sectionIcon} />
            <Text style={styles.sectionTitle}>ผู้รับผิดชอบเคส</Text>
          </View>

          <View style={styles.rowItem}>
            <Text style={styles.label}>สัตวแพทย์</Text>
            <Text style={styles.value}>
              {detailData?.vets?.first_name
                ? `น.สพ. ${detailData.vets.first_name} ${detailData.vets.last_name || ''}`
                : '-'}
            </Text>
          </View>

          <View style={styles.rowItem}>
            <Text style={styles.label}>เจ้าหน้าที่บันทึก</Text>
            <Text style={styles.value}>
              {detailData?.clinic_staff?.first_name
                ? `${detailData.clinic_staff.first_name} ${detailData.clinic_staff.last_name || ''}`
                : '-'}
            </Text>
          </View>
        </View>

        {detailData?.status === 'cancelled' && (
          <View style={styles.cancelSectionCard}>
            <View style={styles.cancelSectionTitleContainer}>
              <Feather name="alert-triangle" size={16} color="#DC2626" style={styles.sectionIcon} />
              <Text style={styles.cancelSectionTitle}>ข้อมูลการยกเลิก</Text>
            </View>
            <View style={styles.cancelReasonBox}>
              <Text style={styles.cancelReasonLabel}>เหตุผลที่ยกเลิก:</Text>
              <Text style={styles.cancelReasonText}>
                {detailData?.status_detail || 'ไม่ได้ระบุเหตุผล'}
              </Text>
            </View>
          </View>
        )}

        {detailData?.status !== 'cancelled' && !isCompleted && (
          <View style={styles.actionContainer}>
            {canCancel ? (
              <Pressable style={styles.cancelButton} onPress={handleCancelAppointment}>
                <Feather name="x-circle" size={16} color="#DC2626" style={{ marginRight: 6 }} />
                <Text style={styles.cancelButtonText}>ยกเลิกนัดหมายนี้</Text>
              </Pressable>
            ) : (
              <View style={styles.disabledCancelBox}>
                <Feather name="info" size={15} color="#B45309" style={{ marginRight: 6 }} />
                <Text style={styles.disabledCancelText}>
                  ไม่สามารถยกเลิกได้ (ต้องยกเลิกล่วงหน้าอย่างน้อย 3 วัน)
                </Text>
              </View>
            )}
          </View>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F8FB' },
  loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F4F8FB' },

  header: { backgroundColor: '#20435C', paddingHorizontal: 16, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backButton: { padding: 4 },
  headerTitle: { color: '#FFF', fontSize: 18, fontWeight: 'bold' },
  contentContainer: { paddingHorizontal: 16, paddingTop: 14, paddingBottom: 30 },

  statusBanner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, marginBottom: 12, borderWidth: 1 },
  statusBannerText: { fontSize: 14, fontWeight: 'bold' },

  sectionCard: { backgroundColor: '#FFF', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E2EBF2' },
  sectionTitleContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', paddingBottom: 8 },
  sectionIcon: { marginRight: 8 },
  sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#1E3A5F' },

  rowItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  rowItemCol: { flexDirection: 'column', alignItems: 'flex-start', paddingVertical: 6 },

  label: { fontSize: 13, color: '#64748B', flex: 1 },
  value: { fontSize: 13, color: '#1E293B', fontWeight: '600', flex: 1.5, textAlign: 'right' },
  valueHighlight: { fontSize: 13, color: '#1E3A5F', fontWeight: 'bold', flex: 1.5, textAlign: 'right' },

  valueWithIcon: { flexDirection: 'row', alignItems: 'center', flex: 1.5, justifyContent: 'flex-end' },
  valueTextBold: { fontSize: 13, color: '#1E293B', fontWeight: 'bold' },

  detailBox: { backgroundColor: '#F8FAFC', width: '100%', padding: 12, borderRadius: 10, marginTop: 6, borderWidth: 1, borderColor: '#F1F5F9' },
  detailText: { fontSize: 13, color: '#334155', lineHeight: 18 },

  cancelSectionCard: { backgroundColor: '#FEF2F2', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#FEE2E2' },
  cancelSectionTitleContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, borderBottomWidth: 1, borderBottomColor: '#FEE2E2', paddingBottom: 6 },
  cancelSectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#DC2626' },
  cancelReasonBox: { marginTop: 4 },
  cancelReasonLabel: { fontSize: 12, color: '#991B1B', fontWeight: '600', marginBottom: 4 },
  cancelReasonText: { fontSize: 13, color: '#991B1B', lineHeight: 18 },

  actionContainer: { marginTop: 4, marginBottom: 16 },
  cancelButton: { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FCA5A5', borderRadius: 12, height: 46, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  cancelButtonText: { color: '#DC2626', fontSize: 14, fontWeight: 'bold' },
  disabledCancelBox: { backgroundColor: '#FFFBEB', borderWidth: 1, borderColor: '#FDE68A', borderRadius: 12, padding: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  disabledCancelText: { color: '#B45309', fontSize: 12, fontWeight: '500' }
});
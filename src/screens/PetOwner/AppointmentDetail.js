import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, ActivityIndicator, Alert, Linking, TouchableOpacity } from 'react-native';
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

        let phone = data?.clinics?.phone || data?.clinics?.phone_number;
        if (!phone) {
          const clinicId = data?.clinic_id || data?.clinics?.clinic_id || 2;
          try {
            const clinicRes = await fetch(`${API_URL}/clinics/${clinicId}`);
            if (clinicRes.ok) {
              const clinicData = await clinicRes.json();
              data.clinics = {
                ...(data.clinics || {}),
                ...clinicData
              };
            }
          } catch (err) {
            console.log('Error fetching extra clinic details:', err);
          }
        }

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

  const getCheckInTime = (timeStr) => {
    if (!timeStr) return '-';
    const parts = timeStr.split(':');
    if (parts.length < 2) return timeStr;

    let hours = parseInt(parts[0], 10);
    let minutes = parseInt(parts[1], 10);

    let date = new Date();
    date.setHours(hours, minutes, 0, 0);
    date.setMinutes(date.getMinutes() - 30);

    const h = String(date.getHours()).padStart(2, '0');
    const m = String(date.getMinutes()).padStart(2, '0');
    return `${h}:${m}`;
  };

  const handleContactClinic = () => {
    const phone = detailData?.clinics?.phone || detailData?.clinics?.phone_number || detailData?.clinic?.phone || detailData?.phone;
    if (!phone) {
      Alert.alert('แจ้งเตือน', 'ยังไม่ได้ระบุหมายเลขโทรศัพท์ติดต่อของคลินิก');
      return;
    }
    Alert.alert(
      'ติดต่อคลินิก',
      `ต้องการโทรติดต่อเจ้าหน้าที่คลินิก\nเบอร์โทรศัพท์: ${phone}`,
      [
        { text: 'ยกเลิก', style: 'cancel' },
        {
          text: 'โทรออก',
          onPress: () => Linking.openURL(`tel:${phone}`)
        }
      ]
    );
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
      default: return title || 'นัดหมายทั่วไป';
    }
  };

  const isCompleted = detailData?.status === 'completed';
  const statusInfo = getStatusInfo(detailData?.status);
  const checkInTime = getCheckInTime(detailData?.appointment_time);

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

        {!isCompleted && detailData?.status !== 'cancelled' && (
          <View style={styles.timeHighlightCard}>
            <View style={styles.timeRowContainer}>
              <View style={styles.timeBox}>
                <Text style={styles.timeSubLabel}>เวลาเช็กอินหน้างาน</Text>
                <Text style={styles.checkInTimeText}>{checkInTime} น.</Text>
                <Text style={styles.timeNote}>(กรุณามาถึงก่อนเวลานี้)</Text>
              </View>

              <View style={styles.timeDivider} />

              <View style={styles.timeBox}>
                <Text style={styles.timeSubLabel}>เวลานัดตรวจสัตวแพทย์</Text>
                <Text style={styles.apptTimeText}>{detailData?.appointment_time?.substring(0, 5)} น.</Text>
                <Text style={styles.timeNote}>(เริ่มการตรวจรักษา)</Text>
              </View>
            </View>
          </View>
        )}

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
                ? `${detailData.vets.first_name} ${detailData.vets.last_name || ''}`.trim()
                : '-'}
            </Text>
          </View>

          <View style={styles.rowItem}>
            <Text style={styles.label}>เจ้าหน้าที่บันทึก</Text>
            <Text style={styles.value}>
              {detailData?.clinic_staff?.first_name
                ? `${detailData.clinic_staff.first_name} ${detailData.clinic_staff.last_name || ''}`.trim()
                : '-'}
            </Text>
          </View>
        </View>

        {!isCompleted && detailData?.status !== 'cancelled' && (
          <View style={styles.guidanceCard}>
            <View style={styles.guidanceTitleRow}>
              <Feather name="info" size={15} color="#0284C7" style={{ marginRight: 6 }} />
              <Text style={styles.guidanceTitle}>คำแนะนำในวันเข้ารับบริการ</Text>
            </View>
            <Text style={styles.guidanceText}>
              1. โปรดมาถึงคลินิกเพื่อลงทะเบียนชั่งน้ำหนักและวัดไข้ก่อนเวลาตรวจอย่างน้อย 30 นาที{"\n"}
              2. หากมาถึงหลังเวลานัด คลินิกขออนุญาตจัดคิวการรักษาเป็นรูปแบบ Walk-in ตามลำดับหน้างาน{"\n"}
              3. หากติดภารกิจด่วน หรือต้องการสอบถามเพิ่มเติม สามารถกดปุ่มติดต่อคลินิกด้านล่าง
            </Text>
          </View>
        )}

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

        {!isCompleted && detailData?.status !== 'cancelled' && (
          <TouchableOpacity style={styles.contactBtn} onPress={handleContactClinic} activeOpacity={0.85}>
            <Feather name="phone-call" size={16} color="#2C4A6F" style={{ marginRight: 8 }} />
            <Text style={styles.contactBtnText}>สอบถามข้อมูล / ติดต่อคลินิก</Text>
          </TouchableOpacity>
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

  timeHighlightCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: '#BAE6FD', shadowColor: '#0284C7', shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  timeRowContainer: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around' },
  timeBox: { alignItems: 'center', flex: 1 },
  timeSubLabel: { fontSize: 11, color: '#64748B', fontWeight: '500', marginBottom: 4 },
  checkInTimeText: { fontSize: 22, fontWeight: 'bold', color: '#0369A1' },
  apptTimeText: { fontSize: 22, fontWeight: 'bold', color: '#1E293B' },
  timeNote: { fontSize: 10, color: '#94A3B8', marginTop: 2 },
  timeDivider: { width: 1, height: '70%', backgroundColor: '#E2E8F0' },

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

  guidanceCard: { backgroundColor: '#F0F9FF', borderRadius: 16, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: '#BAE6FD' },
  guidanceTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  guidanceTitle: { fontSize: 13, fontWeight: 'bold', color: '#0369A1' },
  guidanceText: { fontSize: 12, color: '#0C4A6E', lineHeight: 19 },

  cancelSectionCard: { backgroundColor: '#FEF2F2', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#FEE2E2' },
  cancelSectionTitleContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, borderBottomWidth: 1, borderBottomColor: '#FEE2E2', paddingBottom: 6 },
  cancelSectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#DC2626' },
  cancelReasonBox: { marginTop: 4 },
  cancelReasonLabel: { fontSize: 12, color: '#991B1B', fontWeight: '600', marginBottom: 4 },
  cancelReasonText: { fontSize: 13, color: '#991B1B', lineHeight: 18 },

  contactBtn: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#2C4A6F', borderRadius: 12, height: 46, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  contactBtnText: { color: '#2C4A6F', fontSize: 14, fontWeight: 'bold' }
});
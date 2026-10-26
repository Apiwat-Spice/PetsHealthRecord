import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { calcAge, formatWeight } from './PetUtils';

export default function PetGeneralTab({ pet, latestWeight, cautions, upcoming, uploadingImage, onPickImage, navigation }) {

  const translateTitle = (title) => {
    switch (title) {
      case 'Health Checkup': return 'ตรวจสุขภาพประจำปี';
      case 'Vaccination': return 'ฉีดวัคซีน';
      case 'Sick Visit / Consultation': return 'ตรวจรักษาอาการป่วย';
      case 'Spay / Neuter': return 'ทำหมัน';
      case 'Grooming': return 'อาบน้ำตัดขน';
      case 'Bathing': return 'อาบน้ำ';
      case 'Haircut': return 'ตัดขน';
      case 'Boarding': return 'ฝากเลี้ยงสัตว์เลี้ยง';
      case 'Grooming / Boarding': return 'อาบน้ำตัดขน / ฝากเลี้ยง';
      default: return title || 'นัดหมายเข้ารับบริการ';
    }
  };

  // แสดงผลค่าน้ำหนักล่าสุด (ถ้ามีการชั่งในการตรวจ) หรือถอยกลับไปใช้ค่าเริ่มต้น
  const displayWeight = formatWeight(latestWeight ?? pet?.weight);

  return (
    <View style={styles.container}>
      {/* การ์ดที่ 1: ข้อมูลพื้นฐาน */}
      <View style={styles.card}>
        <Text style={styles.cardSectionTitle}>ข้อมูลพื้นฐาน</Text>

        <View style={styles.avatarCenter}>
          <TouchableOpacity
            style={styles.avatarWrap}
            onPress={onPickImage}
            disabled={uploadingImage}
            activeOpacity={0.85}
          >
            {uploadingImage ? (
              <View style={styles.uploadingOverlay}>
                <ActivityIndicator size="small" color="#FFF" />
              </View>
            ) : (
              <>
                {pet?.pet_image_url ? (
                  <Image source={{ uri: pet.pet_image_url }} style={styles.avatarImage} />
                ) : (
                  <View style={styles.placeholderAvatar}>
                    <Feather name="image" size={36} color="#94A3B8" />
                  </View>
                )}
                <View style={styles.editBadge}>
                  <Feather name="camera" size={12} color="#FFF" />
                </View>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* ตารางรายละเอียดข้อมูล */}
        <View style={styles.infoList}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>สายพันธุ์ (ชนิด)</Text>
            <Text style={styles.infoValue}>{pet?.animal_type || 'สุนัข'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>พันธุ์</Text>
            <Text style={styles.infoValue}>{pet?.species || 'ไม่ระบุพันธุ์'}</Text>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>อายุ</Text>
            <Text style={styles.infoValue}>{calcAge(pet?.birthdate, true)}</Text>
          </View>

          {/* 🟢 แสดงค่าน้ำหนักอัปเดตล่าสุด */}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>น้ำหนักล่าสุด</Text>
            <View style={styles.weightValueBadge}>
              <MaterialCommunityIcons name="scale-bathroom" size={14} color="#2563EB" style={{ marginRight: 4 }} />
              <Text style={styles.weightValueText}>{displayWeight}</Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>สถานะระบบ</Text>
            <View style={styles.badgeVerified}>
              <Text style={styles.badgeVerifiedText}>ยืนยันแล้ว</Text>
            </View>
          </View>
        </View>

        {/* ส่วนข้อควรระวังทางการแพทย์ */}
        <View style={styles.cautionSection}>
          <View style={styles.cautionHeader}>
            <Feather name="alert-triangle" size={14} color="#DC2626" style={{ marginRight: 6 }} />
            <Text style={styles.cautionTitle}>ข้อควรระวังทางการแพทย์ / แพ้ยา</Text>
          </View>
          <View style={styles.cautionContainer}>
            {cautions.length > 0 ? (
              cautions.map((item, index) => (
                <View key={index} style={styles.cautionItem}>
                  <Text style={styles.cautionBadgeText}>• {item}</Text>
                </View>
              ))
            ) : (
              <Text style={styles.cautionEmptyText}>ไม่มีข้อควรระวังทางการแพทย์</Text>
            )}
          </View>
        </View>
      </View>

      {/* การ์ดที่ 2: นัดหมายล่วงหน้า */}
      <View style={styles.upcomingBox}>
        <View style={styles.upcomingHeader}>
          <Feather name="calendar" size={18} color="#D97706" />
          <Text style={styles.upcomingBoxTitle}> นัดหมายล่วงหน้า</Text>
        </View>

        {upcoming && upcoming.length > 0 ? (
          <TouchableOpacity
            style={styles.upcomingCardInner}
            activeOpacity={0.8}
            onPress={() => {
              if (upcoming[0].appointment_id && navigation) {
                navigation.navigate('AppointmentDetail', {
                  appointmentId: upcoming[0].appointment_id,
                });
              }
            }}
          >
            <View style={styles.upcomingRowTop}>
              <Text style={styles.upcomingInnerTitle}>
                {translateTitle(upcoming[0].title)}
              </Text>
              <Feather name="chevron-right" size={18} color="#D97706" />
            </View>

            <View style={styles.upcomingBadgeRow}>
              <View style={styles.upcomingDateBadge}>
                <Feather name="clock" size={12} color="#FFF" style={{ marginRight: 4 }} />
                <Text style={styles.upcomingDateText}>
                  {upcoming[0].appointment_date} • {upcoming[0].appointment_time?.substring(0, 5)} น.
                </Text>
              </View>
            </View>

            <Text style={styles.upcomingClinicName}>
              {upcoming[0].clinic_name || 'Happy Paws Clinic'}
            </Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.emptyUpcomingText}>ไม่มีรายการนัดหมายล่วงหน้า</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 1,
  },
  cardSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#20435C',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 10,
    marginBottom: 14,
  },
  avatarCenter: { alignItems: 'center', marginBottom: 18 },
  avatarWrap: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#F1F5F9',
    position: 'relative',
    borderWidth: 3,
    borderColor: '#FFF',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  avatarImage: { width: '100%', height: '100%', borderRadius: 48 },
  placeholderAvatar: { width: '100%', height: '100%', borderRadius: 48, justifyContent: 'center', alignItems: 'center' },
  editBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#2563EB',
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoList: { marginBottom: 10 },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  infoLabel: { fontSize: 13, color: '#64748B', fontWeight: '500' },
  infoValue: { fontSize: 13, fontWeight: 'bold', color: '#1E293B' },

  weightValueBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  weightValueText: { fontSize: 13, fontWeight: 'bold', color: '#2563EB' },

  badgeVerified: { backgroundColor: '#DCFCE7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  badgeVerifiedText: { color: '#16A34A', fontSize: 11, fontWeight: 'bold' },

  cautionSection: { marginTop: 10 },
  cautionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 6 },
  cautionTitle: { fontSize: 13, fontWeight: 'bold', color: '#DC2626' },
  cautionContainer: { backgroundColor: '#FEF2F2', borderWidth: 1, borderColor: '#FCA5A5', borderRadius: 10, padding: 12 },
  cautionItem: { marginVertical: 2 },
  cautionBadgeText: { color: '#991B1B', fontSize: 12, fontWeight: '500' },
  cautionEmptyText: { color: '#94A3B8', fontSize: 12 },

  upcomingBox: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
  },
  upcomingHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  upcomingBoxTitle: { fontSize: 16, fontWeight: 'bold', color: '#D97706' },
  upcomingCardInner: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FEF3C7',
    elevation: 1,
  },
  upcomingRowTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  upcomingInnerTitle: { fontSize: 15, fontWeight: 'bold', color: '#B45309', marginBottom: 8 },
  upcomingBadgeRow: { flexDirection: 'row', marginBottom: 8 },
  upcomingDateBadge: {
    backgroundColor: '#D97706',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  upcomingDateText: { color: '#FFF', fontSize: 11, fontWeight: 'bold' },
  upcomingClinicName: { fontSize: 12, color: '#92400E', fontWeight: '500', marginTop: 2 },
  emptyUpcomingText: { color: '#D97706', fontSize: 13, textAlign: 'center', paddingVertical: 12 },
});
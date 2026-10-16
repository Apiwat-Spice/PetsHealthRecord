import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { calcAge, formatWeight } from './PetUtils';

export default function PetGeneralTab({ pet, cautions, upcoming, uploadingImage, onPickImage, navigation }) {

  // 🟢 แปลหัวข้อนัดหมายเป็นภาษาไทย
  const translateTitle = (title) => {
    switch (title) {
      case 'Health Checkup': return 'ตรวจสุขภาพประจำปี';
      case 'Vaccination': return 'ฉีดวัคซีน';
      case 'Sick Visit / Consultation': return 'ตรวจรักษาอาการป่วย';
      case 'Spay / Neuter': return 'ทำหมัน';
      case 'Grooming / Boarding': return 'อาบน้ำตัดขน / ฝากเลี้ยง';
      default: return title || 'นัดหมายเข้ารับบริการ';
    }
  };

  return (
    <View>
      {/* ข้อมูลพื้นฐาน */}
      <View style={styles.card}>
        <Text style={styles.cardSectionTitle}>ข้อมูลพื้นฐาน</Text>

        <View style={styles.avatarCenter}>
          <TouchableOpacity
            style={styles.avatarWrap}
            onPress={onPickImage}
            disabled={uploadingImage}
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
                    <Feather name="image" size={32} color="#9AA7B0" />
                  </View>
                )}
                <View style={styles.editBadge}>
                  <Feather name="edit-2" size={12} color="#FFF" />
                </View>
              </>
            )}
          </TouchableOpacity>
        </View>

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

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>น้ำหนัก</Text>
          <Text style={styles.infoValue}>{formatWeight(pet?.weight)}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>สถานะ</Text>
          <View style={styles.badgeVerified}>
            <Text style={styles.badgeVerifiedText}>ยืนยันแล้ว</Text>
          </View>
        </View>

        <Text style={styles.cautionTitle}>ข้อควรระวังทางการแพทย์</Text>
        <View style={styles.cautionContainer}>
          {cautions.length > 0 ? (
            cautions.map((item, index) => (
              <Text key={index} style={styles.cautionBadgeText}>
                {item}
              </Text>
            ))
          ) : (
            <Text style={styles.cautionEmptyText}>ไม่มีข้อควรระวังทางการแพทย์</Text>
          )}
        </View>
      </View>

      {/* 🟢 ส่วนนัดหมายล่วงหน้า (กดคลิกไปดูรายละเอียดได้) */}
      <View style={styles.upcomingBox}>
        <View style={styles.upcomingHeader}>
          <Feather name="calendar" size={18} color="#D9822B" />
          <Text style={styles.upcomingBoxTitle}> นัดหมายล่วงหน้า</Text>
        </View>

        {upcoming && upcoming.length > 0 ? (
          <TouchableOpacity
            style={styles.upcomingCardInner}
            activeOpacity={0.8}
            onPress={() => {
              // กดแล้วพาไปหน้า AppointmentDetail พร้อมส่ง appointment_id
              if (upcoming[0].appointment_id && navigation) {
                navigation.navigate('AppointmentDetail', {
                  appointmentId: upcoming[0].appointment_id
                });
              }
            }}
          >
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={styles.upcomingInnerTitle}>
                {translateTitle(upcoming[0].title)}
              </Text>
              <Feather name="chevron-right" size={18} color="#D9822B" />
            </View>

            <View style={styles.upcomingBadgeRow}>
              <View style={styles.upcomingDateBadge}>
                <Feather name="calendar" size={13} color="#FFF" style={{ marginRight: 4 }} />
                <Text style={styles.upcomingDateText}>
                  วันที่ {upcoming[0].appointment_date} เวลา {upcoming[0].appointment_time?.substring(0, 5)} น.
                </Text>
              </View>
            </View>
            <Text style={styles.upcomingClinicName}>คลินิกรักษาสัตว์ Happy Paws</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.emptyUpcomingText}>ไม่มีรายการนัดหมายล่วงหน้า</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2EBF0',
    elevation: 1,
  },
  cardSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#20435C',
    borderBottomWidth: 1,
    borderBottomColor: '#EEF3F6',
    paddingBottom: 10,
    marginBottom: 14,
  },
  avatarCenter: { alignItems: 'center', marginBottom: 16 },
  avatarWrap: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#F0F4F7',
    position: 'relative',
    overflow: 'visible',
  },
  avatarImage: { width: '100%', height: '100%', borderRadius: 45 },
  placeholderAvatar: { width: '100%', height: '100%', borderRadius: 45, justifyContent: 'center', alignItems: 'center' },
  editBadge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#5A99C8',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFF',
  },
  uploadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 7 },
  infoLabel: { fontSize: 13, color: '#7E909E' },
  infoValue: { fontSize: 13, fontWeight: 'bold', color: '#20435C' },
  badgeVerified: { backgroundColor: '#E4F8ED', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  badgeVerifiedText: { color: '#2E9E5B', fontSize: 11, fontWeight: 'bold' },
  cautionTitle: { fontSize: 13, fontWeight: 'bold', color: '#E04F4F', marginTop: 14, marginBottom: 8 },
  cautionContainer: { backgroundColor: '#FFF6F6', borderWidth: 1, borderColor: '#F9D8D8', borderRadius: 8, padding: 10 },
  cautionBadgeText: { color: '#E04F4F', fontSize: 12, fontWeight: 'bold' },
  cautionEmptyText: { color: '#9AA7B0', fontSize: 12 },
  upcomingBox: { backgroundColor: '#FFF9EF', borderWidth: 1, borderColor: '#F4D9B5', borderRadius: 14, padding: 16, marginBottom: 14 },
  upcomingHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  upcomingBoxTitle: { fontSize: 16, fontWeight: 'bold', color: '#D9822B' },
  upcomingCardInner: { backgroundColor: '#FFF', borderRadius: 10, padding: 14, borderWidth: 1, borderColor: '#F8E8D2' },
  upcomingInnerTitle: { fontSize: 15, fontWeight: 'bold', color: '#D9822B', marginBottom: 8 },
  upcomingBadgeRow: { flexDirection: 'row', marginBottom: 8 },
  upcomingDateBadge: { backgroundColor: '#E59230', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  upcomingDateText: { color: '#FFF', fontSize: 11, fontWeight: 'bold' },
  upcomingClinicName: { fontSize: 12, color: '#9E6116', marginTop: 4 },
  emptyUpcomingText: { color: '#B39169', fontSize: 13, textAlign: 'center', paddingVertical: 12 },
}); 
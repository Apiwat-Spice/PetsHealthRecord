import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

export default function DateStaff() {
    const staffInfo = { clinicName: 'คลินิกรักษาสัตว์ HappyPet', staffName: 'คุณมานี รักงาน' };
    const [activeFilter, setActiveFilter] = useState('all');

    const filters = [
        { id: 'all', label: 'ทั้งหมด(2)' },
        { id: 'pending', label: 'รออนุมัติ(1)' },
        { id: 'approved', label: 'อนุมัติแล้ว(1)' },
        { id: 'completed', label: 'เสร็จสิ้น(0)' },
    ];

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <StatusBar barStyle="light-content" backgroundColor="#2F80ED" />

            <View style={styles.headerBar}>
                <View style={styles.headerLeft}>
                    <MaterialCommunityIcons name="domain" size={20} color="#FFFFFF" />
                    <Text style={styles.clinicNameText}>{staffInfo.clinicName}</Text>
                </View>
                <Text style={styles.roleText}>พนักงาน : {staffInfo.staffName}</Text>
            </View>

            <View style={styles.bodyWrapper}>
                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                    <View style={styles.contentPadding}>
                        <Text style={styles.mainTitle}>นัดหมาย</Text>

                        {/* Filter Pills */}
                        <View style={{ marginBottom: 20 }}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                {filters.map((f) => (
                                    <TouchableOpacity
                                        key={f.id}
                                        style={[styles.filterPill, activeFilter === f.id ? styles.filterPillActive : styles.filterPillInactive]}
                                        onPress={() => setActiveFilter(f.id)}
                                    >
                                        <Text style={[styles.filterText, activeFilter === f.id ? styles.filterTextActive : styles.filterTextInactive]}>{f.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        {/* การ์ดอนุมัติแล้ว (สีน้ำเงิน) */}
                        {(activeFilter === 'all' || activeFilter === 'approved') && (
                            <View style={styles.cardBlue}>
                                <View style={styles.cardHeaderRow}>
                                    <Text style={styles.cardTitleBlue}>ฉีดวัคซีนพิษสุนัขบ้าประจำปี</Text>
                                    <View style={styles.badgeBlue}><Text style={styles.badgeBlueText}>อนุมัติแล้ว</Text></View>
                                </View>
                                <Text style={styles.petDetailText}><Text style={{ fontWeight: 'bold' }}>หมูเด้ง</Text> - 2025-05-17 เวลา 10.00น.</Text>
                                <Text style={styles.petDetailText}><Text style={{ fontWeight: 'bold' }}>เจ้าของ :</Text> คุณสมชาย</Text>
                                <Text style={[styles.petDetailText, { color: '#2F80ED', fontWeight: 'bold' }]}>หมอ : น.สพ. ใจดี</Text>
                                <TouchableOpacity style={styles.btnSolidBlue} onPress={() => Alert.alert('สำเร็จ', 'บันทึกการรักษาเสร็จสิ้น')}>
                                    <Text style={styles.btnSolidBlueText}>เสร็จสิ้นการรักษา</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* การ์ดรออนุมัติ (สีส้ม) */}
                        {(activeFilter === 'all' || activeFilter === 'pending') && (
                            <View style={styles.cardOrange}>
                                <View style={styles.cardHeaderRow}>
                                    <Text style={styles.cardTitleOrange}>ฉีดวัคซีนพิษสุนัขบ้าประจำปี</Text>
                                    <View style={styles.badgeOrange}><Text style={styles.badgeOrangeText}>รออนุมัติ</Text></View>
                                </View>
                                <Text style={styles.petDetailText}><Text style={{ fontWeight: 'bold' }}>หมูเด้ง</Text> - 2027-05-17 เวลา 10.00น.</Text>
                                <Text style={styles.petDetailText}><Text style={{ fontWeight: 'bold' }}>เจ้าของ :</Text> คุณสมชาย</Text>
                                <Text style={styles.assignLabel}>มอบหมายให้สัตวแพทย์ (ไม่บังคับ)</Text>
                                <View style={styles.assignDropdown}>
                                    <Text style={styles.assignDropdownText}>--ยังไม่ระบุ--</Text>
                                    <Feather name="chevron-down" size={18} color="#FF6B00" />
                                </View>
                                <View style={styles.cardActionRow}>
                                    <TouchableOpacity style={styles.btnSolidGreen} onPress={() => Alert.alert('อนุมัติ', 'อนุมัตินัดหมายแล้ว')}><Text style={styles.btnSolidGreenText}>อนุมัติ</Text></TouchableOpacity>
                                    <TouchableOpacity style={styles.btnOutlineRed} onPress={() => Alert.alert('ปฏิเสธ', 'ปฏิเสธนัดหมายแล้ว')}><Text style={styles.btnOutlineRedText}>ปฏิเสธ</Text></TouchableOpacity>
                                </View>
                            </View>
                        )}

                    </View>
                </ScrollView>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#2F80ED' },
    headerBar: { backgroundColor: '#2F80ED', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
    headerLeft: { flexDirection: 'row', alignItems: 'center' },
    clinicNameText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', marginLeft: 6 },
    roleText: { color: '#FFFFFF', fontSize: 11, fontWeight: 'bold' },
    bodyWrapper: { flex: 1, backgroundColor: '#FFFFFF' },
    scrollView: { flex: 1 },
    contentPadding: { padding: 20 },
    mainTitle: { fontSize: 22, fontWeight: 'bold', color: '#2F80ED', marginBottom: 16 },

    filterPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 10, borderWidth: 1 },
    filterPillActive: { backgroundColor: '#2F80ED', borderColor: '#2F80ED' },
    filterPillInactive: { backgroundColor: '#FFFFFF', borderColor: '#EAEAEC' },
    filterText: { fontSize: 13, fontWeight: 'bold' },
    filterTextActive: { color: '#FFFFFF' },
    filterTextInactive: { color: '#888888' },

    cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
    petDetailText: { fontSize: 13, color: '#333', marginBottom: 6 },
    cardActionRow: { flexDirection: 'row', marginTop: 16 },

    cardBlue: { backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#2F80ED', borderRadius: 16, padding: 16, marginBottom: 16, elevation: 1 },
    cardTitleBlue: { fontSize: 16, fontWeight: 'bold', color: '#2F80ED', flex: 1 },
    badgeBlue: { backgroundColor: '#E3F2FD', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    badgeBlueText: { color: '#2F80ED', fontSize: 10, fontWeight: 'bold' },
    btnSolidBlue: { backgroundColor: '#1976D2', borderRadius: 8, alignItems: 'center', paddingVertical: 12, marginTop: 12 },
    btnSolidBlueText: { color: '#FFFFFF', fontSize: 13, fontWeight: 'bold' },

    cardOrange: { backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#FF9800', borderRadius: 16, padding: 16, marginBottom: 16, elevation: 1 },
    cardTitleOrange: { fontSize: 16, fontWeight: 'bold', color: '#FF6B00', flex: 1 },
    badgeOrange: { backgroundColor: '#FFF3E0', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    badgeOrangeText: { color: '#FF6B00', fontSize: 10, fontWeight: 'bold' },
    assignLabel: { fontSize: 12, color: '#888', marginTop: 10, marginBottom: 6 },
    assignDropdown: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#FF9800', borderRadius: 8, paddingHorizontal: 12, height: 40 },
    assignDropdownText: { fontSize: 13, color: '#333' },
    btnSolidGreen: { flex: 1, backgroundColor: '#00C853', borderRadius: 8, alignItems: 'center', paddingVertical: 12, marginRight: 8 },
    btnSolidGreenText: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },
    btnOutlineRed: { flex: 1, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#FF3B30', borderRadius: 8, alignItems: 'center', paddingVertical: 12 },
    btnOutlineRedText: { color: '#FF3B30', fontSize: 14, fontWeight: 'bold' },
});
import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, StatusBar, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

export default function DateClinic() {
    const clinicInfo = { clinicName: 'คลินิกรักษาสัตว์ HappyPet', role: 'ผู้ดูแล' };

    // 'all' = ทั้งหมด, 'pending' = รออนุมัติ, 'approved' = อนุมัติแล้ว, 'completed' = เสร็จสิ้น
    const [activeFilter, setActiveFilter] = useState('all');

    // ข้อมูลจำนวนแต่ละสถานะ
    const filters = [
        { id: 'all', label: 'ทั้งหมด(2)' },
        { id: 'pending', label: 'รออนุมัติ(1)' },
        { id: 'approved', label: 'อนุมัติแล้ว(1)' },
        { id: 'completed', label: 'เสร็จสิ้น(0)' },
    ];


    //สถานะ "อนุมัติแล้ว" (สีน้ำเงิน)
    const renderApprovedCard = () => (
        <View style={styles.cardBlue}>
            <View style={styles.cardHeaderRow}>
                <Text style={styles.cardTitleBlue}>ฉีดวัคซีนพิษสุนัขบ้าประจำปี</Text>
                <View style={styles.badgeBlue}>
                    <Text style={styles.badgeBlueText}>อนุมัติแล้ว</Text>
                </View>
            </View>

            <Text style={styles.petDetailText}><Text style={styles.boldText}>หมูเด้ง</Text> - 2025-05-17 เวลา 10.00น.</Text>
            <Text style={styles.petDetailText}><Text style={styles.boldText}>เจ้าของ :</Text> คุณสมชาย</Text>
            <Text style={[styles.petDetailText, { color: '#2F80ED', fontWeight: 'bold' }]}>หมอ : น.สพ. ใจดี</Text>

            <View style={styles.cardActionRow}>
                <TouchableOpacity
                    style={styles.btnSolidBlue}
                    onPress={() => Alert.alert('สำเร็จ', 'ทำเครื่องหมายว่าเสร็จสิ้นเรียบร้อย')}
                >
                    <Text style={styles.btnSolidBlueText}>ทำเครื่องหมายว่าเสร็จสิ้น</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.btnOutlineRed}
                    onPress={() => Alert.alert('ลบ', 'ต้องการลบรายการนัดหมายนี้หรือไม่?')}
                >
                    <Feather name="trash-2" size={20} color="#FF3B30" />
                </TouchableOpacity>
            </View>
        </View>
    );


    //สถานะ "รออนุมัติ" (สีส้ม)
    const renderPendingCard = () => (
        <View style={styles.cardOrange}>
            <View style={styles.cardHeaderRow}>
                <Text style={styles.cardTitleOrange}>ฉีดวัคซีนพิษสุนัขบ้าประจำปี</Text>
                <View style={styles.badgeOrange}>
                    <Text style={styles.badgeOrangeText}>ยังไม่อนุมัติ</Text>
                </View>
            </View>

            <Text style={styles.petDetailText}><Text style={styles.boldText}>หมูเด้ง</Text> - 2027-05-17 เวลา 10.00น.</Text>
            <Text style={styles.petDetailText}><Text style={styles.boldText}>เจ้าของ :</Text> คุณสมชาย</Text>

            <Text style={styles.assignLabel}>มอบหมายให้สัตวแพทย์ (ไม่บังคับ)</Text>
            <View style={styles.assignDropdown}>
                <Text style={styles.assignDropdownText}>--ยังไม่ระบุ--</Text>
                <Feather name="chevron-down" size={18} color="#FF6B00" />
            </View>

            <View style={styles.cardActionRow}>
                <TouchableOpacity
                    style={styles.btnSolidGreen}
                    onPress={() => Alert.alert('อนุมัติ', 'นัดหมายได้รับการอนุมัติ')}
                >
                    <Text style={styles.btnSolidGreenText}>อนุมัติ</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.btnOutlineRedLarge}
                    onPress={() => Alert.alert('ปฏิเสธ', 'คุณได้ปฏิเสธนัดหมายนี้')}
                >
                    <Text style={styles.btnOutlineRedLargeText}>ปฏิเสธ</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <StatusBar barStyle="light-content" backgroundColor="#9C27B0" />


            <View style={styles.headerBar}>
                <View style={styles.headerLeft}>
                    <MaterialCommunityIcons name="domain" size={20} color="#FFFFFF" />
                    <Text style={styles.clinicNameText}>{clinicInfo.clinicName}</Text>
                </View>
                <Text style={styles.roleText}>{clinicInfo.role}</Text>
            </View>

            <View style={styles.bodyWrapper}>
                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                    <View style={styles.contentPadding}>

                        <Text style={styles.mainTitle}>นัดหมายคลินิก</Text>

                        {/* ตัวกรอง */}
                        <View style={{ marginBottom: 20 }}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                {filters.map((filter) => (
                                    <TouchableOpacity
                                        key={filter.id}
                                        style={[styles.filterPill, activeFilter === filter.id ? styles.filterPillActive : styles.filterPillInactive]}
                                        onPress={() => setActiveFilter(filter.id)}
                                    >
                                        <Text style={[styles.filterText, activeFilter === filter.id ? styles.filterTextActive : styles.filterTextInactive]}>
                                            {filter.label}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>


                        {/*แสดงตาม Filter ที่เลือก */}
                        {(activeFilter === 'all' || activeFilter === 'approved') && renderApprovedCard()}
                        {(activeFilter === 'all' || activeFilter === 'pending') && renderPendingCard()}
                        {activeFilter === 'completed' && (
                            <Text style={styles.emptyText}>ไม่มีนัดหมายที่เสร็จสิ้น</Text>
                        )}

                        <View style={{ height: 40 }} />
                    </View>
                </ScrollView>
            </View>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#9C27B0' },
    headerBar: { backgroundColor: '#9C27B0', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
    headerLeft: { flexDirection: 'row', alignItems: 'center' },
    clinicNameText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', marginLeft: 6 },
    roleText: { color: '#FFFFFF', fontSize: 13, fontWeight: 'bold' },

    bodyWrapper: { flex: 1, backgroundColor: '#FFFFFF' },
    scrollView: { flex: 1 },
    contentPadding: { padding: 20 },

    mainTitle: { fontSize: 22, fontWeight: 'bold', color: '#9C27B0', marginBottom: 16 },

    // Filter Pills
    filterPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 10, borderWidth: 1 },
    filterPillActive: { backgroundColor: '#9C27B0', borderColor: '#9C27B0' },
    filterPillInactive: { backgroundColor: '#FFFFFF', borderColor: '#EAEAEC' },
    filterText: { fontSize: 13, fontWeight: 'bold' },
    filterTextActive: { color: '#FFFFFF' },
    filterTextInactive: { color: '#888888' },

    emptyText: { textAlign: 'center', color: '#999', marginTop: 40 },

    // Card Common Styles
    cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
    petDetailText: { fontSize: 13, color: '#333', marginBottom: 6 },
    boldText: { fontWeight: 'bold' },
    cardActionRow: { flexDirection: 'row', marginTop: 16 },

    // Blue Card (อนุมัติแล้ว)
    cardBlue: { backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#2F80ED', borderRadius: 16, padding: 16, marginBottom: 16, elevation: 1 },
    cardTitleBlue: { fontSize: 16, fontWeight: 'bold', color: '#2F80ED', flex: 1, marginRight: 8 },
    badgeBlue: { backgroundColor: '#E3F2FD', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    badgeBlueText: { color: '#2F80ED', fontSize: 10, fontWeight: 'bold' },
    btnSolidBlue: { flex: 1, backgroundColor: '#1976D2', borderRadius: 8, alignItems: 'center', justifyContent: 'center', paddingVertical: 12 },
    btnSolidBlueText: { color: '#FFFFFF', fontSize: 13, fontWeight: 'bold' },
    btnOutlineRed: { width: 50, borderWidth: 1, borderColor: '#FF3B30', borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginLeft: 8 },

    // Orange Card (รออนุมัติ)
    cardOrange: { backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#FF9800', borderRadius: 16, padding: 16, marginBottom: 16, elevation: 1 },
    cardTitleOrange: { fontSize: 16, fontWeight: 'bold', color: '#FF6B00', flex: 1, marginRight: 8 },
    badgeOrange: { backgroundColor: '#FFF3E0', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    badgeOrangeText: { color: '#FF6B00', fontSize: 10, fontWeight: 'bold' },
    assignLabel: { fontSize: 12, color: '#888', marginTop: 10, marginBottom: 6 },
    assignDropdown: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#FF9800', borderRadius: 8, paddingHorizontal: 12, height: 40 },
    assignDropdownText: { fontSize: 13, color: '#333' },

    btnSolidGreen: { flex: 1, backgroundColor: '#00C853', borderRadius: 8, alignItems: 'center', justifyContent: 'center', paddingVertical: 12, marginRight: 8 },
    btnSolidGreenText: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },
    btnOutlineRedLarge: { flex: 1, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#FF3B30', borderRadius: 8, alignItems: 'center', justifyContent: 'center', paddingVertical: 12 },
    btnOutlineRedLargeText: { color: '#FF3B30', fontSize: 14, fontWeight: 'bold' },
});
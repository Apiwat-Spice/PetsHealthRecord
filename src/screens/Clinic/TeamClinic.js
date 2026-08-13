import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, StatusBar, Platform, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

export default function TeamClinic() {
    const clinicInfo = { clinicName: 'คลินิกรักษาสัตว์ HappyPet', role: 'ผู้ดูแล' };

    const [activeTab, setActiveTab] = useState('vet'); // 'vet', 'staff', 'request'
    const [addStaffModal, setAddStaffModal] = useState(false);

    // ตัวเลขแจ้งเตือนของแต่ละแท็บ
    const notificationCounts = {
        vet: 0,       // สัตวแพทย์
        staff: 1,     // พนักงาน
        request: 1,   // คำขอสมัคร
    };

    const renderTopTabs = () => (
        <View style={styles.tabContainer}>
            {/* Tab สัตวแพทย์ */}
            <TouchableOpacity
                style={[styles.tabBtn, activeTab === 'vet' ? styles.tabBtnActive : styles.tabBtnInactive]}
                onPress={() => setActiveTab('vet')}
            >
                <View style={styles.tabTextWrapper}>
                    <Text style={[styles.tabText, activeTab === 'vet' ? styles.tabTextActive : styles.tabTextInactive]}>สัตวแพทย์</Text>
                    {notificationCounts.vet > 0 && (
                        <View style={styles.badgeRed}><Text style={styles.badgeRedText}>{notificationCounts.vet}</Text></View>
                    )}
                </View>
            </TouchableOpacity>

            {/* Tab พนักงาน */}
            <TouchableOpacity
                style={[styles.tabBtn, activeTab === 'staff' ? styles.tabBtnActive : styles.tabBtnInactive]}
                onPress={() => setActiveTab('staff')}
            >
                <View style={styles.tabTextWrapper}>
                    <Text style={[styles.tabText, activeTab === 'staff' ? styles.tabTextActive : styles.tabTextInactive]}>พนักงาน</Text>
                    {notificationCounts.staff > 0 && (
                        <View style={styles.badgeRed}><Text style={styles.badgeRedText}>{notificationCounts.staff}</Text></View>
                    )}
                </View>
            </TouchableOpacity>

            {/* Tab คำขอสมัคร */}
            <TouchableOpacity
                style={[styles.tabBtn, activeTab === 'request' ? styles.tabBtnActive : styles.tabBtnInactive]}
                onPress={() => setActiveTab('request')}
            >
                <View style={styles.tabTextWrapper}>
                    <Text style={[styles.tabText, activeTab === 'request' ? styles.tabTextActive : styles.tabTextInactive]}>คำขอสมัคร</Text>
                    {notificationCounts.request > 0 && (
                        <View style={styles.badgeRed}><Text style={styles.badgeRedText}>{notificationCounts.request}</Text></View>
                    )}
                </View>
            </TouchableOpacity>
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

            {/* เนื้อหา */}
            <View style={styles.bodyWrapper}>
                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                    <View style={styles.contentPadding}>

                        <Text style={styles.mainTitle}>จัดการทีม</Text>

                        {renderTopTabs()}


                        {/* Tab สัตวแพทย์ */}

                        {activeTab === 'vet' && (
                            <View>
                                <Text style={styles.subHeading}>สัตวแพทย์ที่ประจำคลินิก (สมัครเองหรือได้รับอนุมัติ)</Text>

                                <View style={styles.userCard}>
                                    <View style={styles.userCardLeft}>
                                        <View style={styles.avatarPurple}><Feather name="user" size={24} color="#9C27B0" /></View>
                                        <View>
                                            <Text style={styles.userNamePurple}>น.สพ ใจดี สุขสันต์</Text>
                                            <Text style={styles.userEmail}>XXX@gmail.com</Text>
                                            <Text style={styles.userDetail}>ใบอนุญาต XX-XXX-XXXX</Text>
                                            <View style={styles.badgeGreenSmall}><Text style={styles.badgeGreenSmallText}>ยืนยันตัวตนแล้ว</Text></View>
                                        </View>
                                    </View>
                                    <TouchableOpacity onPress={() => Alert.alert('ยืนยัน', 'ต้องการลบสัตวแพทย์รายนี้หรือไม่?')}>
                                        <Text style={styles.removeText}>ลบออก</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}

                        {/* Tab พนักงาน */}
                        {activeTab === 'staff' && (
                            <View>
                                <View style={styles.rowRight}>
                                    <TouchableOpacity style={styles.blueAddBtn} onPress={() => setAddStaffModal(true)}>
                                        <Feather name="plus" size={16} color="#FFF" style={{ marginRight: 6 }} />
                                        <Text style={styles.blueAddBtnText}>เพิ่มพนักงาน</Text>
                                    </TouchableOpacity>
                                </View>

                                <View style={styles.userCard}>
                                    <View style={styles.userCardLeft}>
                                        <View style={styles.avatarBlue}><Feather name="user" size={24} color="#1976D2" /></View>
                                        <View>
                                            <Text style={styles.userNameBlue}>คุณมานี รักงาน</Text>
                                            <Text style={styles.userEmail}>XXX@gmail.com</Text>
                                        </View>
                                    </View>
                                    <TouchableOpacity onPress={() => Alert.alert('ยืนยัน', 'ต้องการลบพนักงานรายนี้หรือไม่?')}>
                                        <Text style={styles.removeText}>ลบออก</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        )}


                        {/* คำขอสมัคร */}
                        {activeTab === 'request' && (
                            <View>
                                <View style={styles.userCardColumn}>
                                    <View style={styles.userCardLeft}>
                                        <View style={styles.avatarGreen}><Feather name="user" size={28} color="#00C853" /></View>
                                        <View>
                                            <Text style={styles.userNameGreen}>น.สพ.ญ. สมาน ใฝ่เรียน</Text>
                                            <Text style={styles.userEmail}>XXX@gmail.com</Text>
                                            <Text style={styles.userDetail}>ใบอนุญาต XX-XXX-XXXX</Text>
                                            <Text style={styles.userDateText}>ส่งคำขอวันที่ 2026-07-08</Text>
                                        </View>
                                    </View>

                                    <View style={styles.actionBtnRow}>
                                        <TouchableOpacity style={styles.approveBtn} onPress={() => Alert.alert('สำเร็จ', 'อนุมัติคำขอเรียบร้อยแล้ว')}>
                                            <Text style={styles.approveBtnText}>อนุมัติ</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity style={styles.rejectBtn} onPress={() => Alert.alert('ปฏิเสธ', 'ปฏิเสธคำขอเรียบร้อยแล้ว')}>
                                            <Text style={styles.rejectBtnText}>ปฏิเสธ</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </View>
                        )}

                        <View style={{ height: 40 }} />
                    </View>
                </ScrollView>
            </View>

            {/* สร้างบัญชีของพนักงาน */}
            <Modal visible={addStaffModal} transparent={true} animationType="fade" onRequestClose={() => setAddStaffModal(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitleBlue}>สร้างบัญชีของพนักงาน</Text>
                            <TouchableOpacity onPress={() => setAddStaffModal(false)}>
                                <Feather name="x" size={24} color="#888" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={styles.formRowTwoCol}>
                                <View style={{ flex: 1, marginRight: 6 }}>
                                    <Text style={styles.inputLabel}>ชื่อ</Text>
                                    <TextInput style={styles.textInputOutline} />
                                </View>
                                <View style={{ flex: 1, marginLeft: 6 }}>
                                    <Text style={styles.inputLabel}>นามสกุล</Text>
                                    <TextInput style={styles.textInputOutline} />
                                </View>
                            </View>

                            <Text style={styles.inputLabel}>อีเมล</Text>
                            <TextInput style={styles.textInputOutline} keyboardType="email-address" />

                            <Text style={styles.inputLabel}>เบอร์โทร</Text>
                            <TextInput style={styles.textInputOutline} keyboardType="phone-pad" />

                            <Text style={styles.inputLabel}>ตำแหน่ง</Text>
                            <View style={styles.pickerOutline}>
                                <Text style={{ color: '#333' }}>พนักงานต้อนรับ</Text>
                                <Feather name="chevron-down" size={18} color="#333" />
                            </View>

                            <Text style={styles.inputLabel}>รหัสผ่านเริ่มต้น</Text>
                            <TextInput style={styles.textInputOutline} secureTextEntry={true} />

                            <TouchableOpacity style={styles.blueSubmitBtn} onPress={() => {
                                Alert.alert('สำเร็จ', 'สร้างบัญชีพนักงานเรียบร้อยแล้ว');
                                setAddStaffModal(false);
                            }}>
                                <Text style={styles.blueSubmitText}>สร้างบัญชี</Text>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

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

    // Top Tabs
    tabContainer: { flexDirection: 'row', backgroundColor: '#F5F5F5', borderRadius: 25, padding: 4, marginBottom: 20 },
    tabBtn: { flex: 1, paddingVertical: 10, borderRadius: 20, alignItems: 'center', justifyContent: 'center' },
    tabBtnActive: { backgroundColor: '#FFFFFF', elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 2, shadowOffset: { width: 0, height: 1 } },
    tabBtnInactive: { backgroundColor: 'transparent' },
    tabTextWrapper: { flexDirection: 'row', alignItems: 'center' },
    tabText: { fontSize: 13, fontWeight: 'bold' },
    tabTextActive: { color: '#9C27B0' },
    tabTextInactive: { color: '#999999' },

    // Notification Red Badge
    badgeRed: { position: 'absolute', top: -8, right: -14, backgroundColor: '#FF3B30', width: 16, height: 16, borderRadius: 8, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#FFF' },
    badgeRedText: { color: '#FFF', fontSize: 9, fontWeight: 'bold' },

    subHeading: { fontSize: 13, fontWeight: 'bold', color: '#333', marginBottom: 12 },

    // User Cards
    userCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EAEAEC', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 1 },
    userCardColumn: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EAEAEC', borderRadius: 12, padding: 16, marginBottom: 12, elevation: 1 },
    userCardLeft: { flexDirection: 'row', alignItems: 'center' },

    avatarPurple: { width: 50, height: 50, borderRadius: 25, borderWidth: 2, borderColor: '#9C27B0', alignItems: 'center', justifyContent: 'center', marginRight: 14 },
    avatarBlue: { width: 50, height: 50, borderRadius: 25, borderWidth: 2, borderColor: '#1976D2', alignItems: 'center', justifyContent: 'center', marginRight: 14 },
    avatarGreen: { width: 60, height: 60, borderRadius: 30, borderWidth: 3, borderColor: '#00C853', alignItems: 'center', justifyContent: 'center', marginRight: 16 },

    userNamePurple: { fontSize: 15, fontWeight: 'bold', color: '#9C27B0', marginBottom: 2 },
    userNameBlue: { fontSize: 15, fontWeight: 'bold', color: '#1976D2', marginBottom: 2 },
    userNameGreen: { fontSize: 16, fontWeight: 'bold', color: '#00C853', marginBottom: 2 },

    userEmail: { fontSize: 12, color: '#666', marginBottom: 2 },
    userDetail: { fontSize: 11, color: '#888', marginBottom: 6 },
    userDateText: { fontSize: 11, color: '#888', marginTop: 4 },

    badgeGreenSmall: { backgroundColor: '#E8F5E9', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, alignSelf: 'flex-start' },
    badgeGreenSmallText: { color: '#00C853', fontSize: 10, fontWeight: 'bold' },

    removeText: { fontSize: 12, color: '#888', fontWeight: 'bold' },

    // Buttons
    rowRight: { flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 12 },
    blueAddBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1976D2', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 8 },
    blueAddBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: 'bold' },

    actionBtnRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16 },
    approveBtn: { flex: 0.48, backgroundColor: '#00C853', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
    approveBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },
    rejectBtn: { flex: 0.48, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#FF6B00', paddingVertical: 12, borderRadius: 8, alignItems: 'center' },
    rejectBtnText: { color: '#FF6B00', fontSize: 14, fontWeight: 'bold' },

    // Modal (Create Staff)
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    modalBox: { width: '100%', backgroundColor: '#FFF', borderRadius: 16, padding: 20, maxHeight: '80%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    modalTitleBlue: { fontSize: 16, fontWeight: 'bold', color: '#1976D2' },

    formRowTwoCol: { flexDirection: 'row', justifyContent: 'space-between' },
    inputLabel: { fontSize: 12, fontWeight: 'bold', color: '#333', marginTop: 12, marginBottom: 6 },
    textInputOutline: { borderWidth: 1, borderColor: '#D1D1D1', borderRadius: 8, height: 42, paddingHorizontal: 12, fontSize: 14 },
    pickerOutline: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#D1D1D1', borderRadius: 8, height: 42, paddingHorizontal: 12 },

    blueSubmitBtn: { backgroundColor: '#1976D2', paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 24, marginBottom: 10 },
    blueSubmitText: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' },
});
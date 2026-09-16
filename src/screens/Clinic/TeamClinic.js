import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, StatusBar, Platform, Modal, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { useFocusEffect } from '@react-navigation/native';

import { API_URL } from '../../config';

const ROLE_OPTIONS = [
    { value: 'receptionist', label: 'พนักงานต้อนรับ (Receptionist)' },
    { value: 'cashier', label: 'แคชเชียร์ (Cashier)' },
];
const ROLE_LABELS = { receptionist: 'พนักงานต้อนรับ', cashier: 'แคชเชียร์' };

const EMPTY_FORM = { firstname: '', lastname: '', email: '', phone: '', password: '' };

export default function TeamClinic() {
    const clinicInfo = { clinicName: 'คลินิกรักษาสัตว์ HappyPet', role: 'ผู้ดูแล' };

    const [activeTab, setActiveTab] = useState('vet'); // 'vet', 'staff', 'request'
    const [addStaffModal, setAddStaffModal] = useState(false);

    // ข้อมูลคลินิกของผู้ใช้ปัจจุบัน
    const [vetClinicId, setVetClinicId] = useState(null);
    const [isOwner, setIsOwner] = useState(false);
    const [loadingClinic, setLoadingClinic] = useState(true);

    // รายชื่อพนักงาน
    const [staffList, setStaffList] = useState([]);
    const [loadingStaff, setLoadingStaff] = useState(false);

    // ฟอร์มสร้างพนักงาน
    const [staffForm, setStaffForm] = useState({ ...EMPTY_FORM });
    const [staffRole, setStaffRole] = useState('receptionist');
    const [roleMenuOpen, setRoleMenuOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // ตัวเลขแจ้งเตือนของแต่ละแท็บ
    const notificationCounts = {
        vet: 0,       // สัตวแพทย์
        staff: 0,     // พนักงาน
        request: 0,   // คำขอสมัคร
    };

    // ===== โหลดข้อมูลคลินิกของผู้ใช้ปัจจุบัน (vet_clinic_id) =====
    const loadClinicInfo = useCallback(async () => {
        setLoadingClinic(true);
        try {
            const profileStr = await SecureStore.getItemAsync('vet_profile');
            if (!profileStr) {
                setLoadingClinic(false);
                return;
            }
            const profile = JSON.parse(profileStr);
            const vetId = profile.vet_id;

            const res = await fetch(`${API_URL}/check-clinic-status/${vetId}`);
            const data = await res.json();
            setLoadingClinic(false);

            if (res.ok && data.status === 'pass' && data.submittedDocs?.vet_clinic_id) {
                setVetClinicId(data.submittedDocs.vet_clinic_id);
                setIsOwner(data.role === 'owner');
                loadStaff(data.submittedDocs.vet_clinic_id);
            }
        } catch (error) {
            setLoadingClinic(false);
            console.log('โหลดข้อมูลคลินิกไม่สำเร็จ:', error.message);
        }
    }, []);

    // ===== โหลดรายชื่อพนักงาน =====
    const loadStaff = useCallback(async (clinicId) => {
        if (!clinicId) return;
        setLoadingStaff(true);
        try {
            const res = await fetch(`${API_URL}/clinic-staff/${clinicId}`);
            const data = await res.json();
            setLoadingStaff(false);
            if (res.ok) setStaffList(data.staff || []);
        } catch (error) {
            setLoadingStaff(false);
            console.log('โหลดรายชื่อพนักงานไม่สำเร็จ:', error.message);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            loadClinicInfo();
        }, [loadClinicInfo])
    );

    // ===== สร้างบัญชีพนักงาน =====
    const handleCreateStaff = async () => {
        if (!vetClinicId) {
            Alert.alert('ข้อผิดพลาด', 'ไม่พบข้อมูลสถานพยาบาลของคุณ');
            return;
        }
        if (!staffForm.firstname.trim() || !staffForm.lastname.trim() || !staffForm.email.trim() || !staffForm.password.trim()) {
            Alert.alert('แจ้งเตือน', 'กรุณากรอกข้อมูลให้ครบถ้วน');
            return;
        }
        if (staffForm.password.length < 6) {
            Alert.alert('แจ้งเตือน', 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร');
            return;
        }

        setSubmitting(true);
        try {
            const response = await fetch(`${API_URL}/create-clinic-staff`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    vet_clinic_id: vetClinicId,
                    firstname: staffForm.firstname.trim(),
                    lastname: staffForm.lastname.trim(),
                    email: staffForm.email.trim(),
                    phone: staffForm.phone.trim(),
                    role: staffRole,
                    password: staffForm.password,
                }),
            });
            const result = await response.json();
            setSubmitting(false);

            if (!response.ok) {
                Alert.alert('สร้างบัญชีไม่สำเร็จ', result.message || 'เกิดข้อผิดพลาด');
                return;
            }

            Alert.alert('สำเร็จ', 'สร้างบัญชีพนักงานเรียบร้อยแล้ว พนักงานจะได้รับ OTP ยืนยันตัวตนเมื่อเข้าสู่ระบบครั้งแรก');
            setAddStaffModal(false);
            setStaffForm({ ...EMPTY_FORM });
            setStaffRole('receptionist');
            loadStaff(vetClinicId);
        } catch (error) {
            setSubmitting(false);
            console.log('Create staff error:', error.message);
            Alert.alert('เชื่อมต่อไม่สำเร็จ', 'ไม่สามารถติดต่อเซิร์ฟเวอร์ได้');
        }
    };

    // ===== ลบ(ปิดใช้งาน)พนักงาน =====
    const handleRemoveStaff = (staff) => {
        Alert.alert(
            'ยืนยันการลบ',
            `ต้องการลบ ${staff.firstname} ${staff.lastname} ออกจากคลินิกหรือไม่?`,
            [
                { text: 'ยกเลิก', style: 'cancel' },
                {
                    text: 'ลบออก',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const res = await fetch(`${API_URL}/clinic-staff/${staff.staff_id}/status`, {
                                method: 'PATCH',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ status: 'inactive' }),
                            });
                            const result = await res.json();
                            if (res.ok) {
                                loadStaff(vetClinicId);
                            } else {
                                Alert.alert('ผิดพลาด', result.message || 'ลบไม่สำเร็จ');
                            }
                        } catch (error) {
                            Alert.alert('เชื่อมต่อไม่สำเร็จ', 'ไม่สามารถติดต่อเซิร์ฟเวอร์ได้');
                        }
                    },
                },
            ]
        );
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
                    {staffList.length > 0 && (
                        <View style={styles.badgeRed}><Text style={styles.badgeRedText}>{staffList.length}</Text></View>
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
                                {isOwner && (
                                    <View style={styles.rowRight}>
                                        <TouchableOpacity style={styles.blueAddBtn} onPress={() => setAddStaffModal(true)}>
                                            <Feather name="plus" size={16} color="#FFF" style={{ marginRight: 6 }} />
                                            <Text style={styles.blueAddBtnText}>เพิ่มพนักงาน</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}

                                {loadingClinic || loadingStaff ? (
                                    <ActivityIndicator size="large" color="#9C27B0" style={{ marginTop: 30 }} />
                                ) : !vetClinicId ? (
                                    <View style={styles.emptyBox}>
                                        <MaterialCommunityIcons name="domain-off" size={40} color="#D6C6DE" />
                                        <Text style={styles.emptyText}>ยังไม่พบข้อมูลสถานพยาบาลของคุณ</Text>
                                    </View>
                                ) : staffList.length === 0 ? (
                                    <View style={styles.emptyBox}>
                                        <Feather name="users" size={40} color="#D6C6DE" />
                                        <Text style={styles.emptyText}>ยังไม่มีพนักงานในคลินิก</Text>
                                    </View>
                                ) : (
                                    staffList.map((staff) => (
                                        <View key={staff.staff_id} style={styles.userCard}>
                                            <View style={styles.userCardLeft}>
                                                <View style={styles.avatarBlue}><Feather name="user" size={24} color="#1976D2" /></View>
                                                <View>
                                                    <Text style={styles.userNameBlue}>{staff.firstname} {staff.lastname}</Text>
                                                    <Text style={styles.userEmail}>{staff.email}</Text>
                                                    <View style={styles.badgeBlueSmall}>
                                                        <Text style={styles.badgeBlueSmallText}>{ROLE_LABELS[staff.role] || staff.role}</Text>
                                                    </View>
                                                </View>
                                            </View>
                                            {isOwner && (
                                                <TouchableOpacity onPress={() => handleRemoveStaff(staff)}>
                                                    <Text style={styles.removeText}>ลบออก</Text>
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    ))
                                )}
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
                            <TouchableOpacity onPress={() => { setAddStaffModal(false); setRoleMenuOpen(false); }}>
                                <Feather name="x" size={24} color="#888" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            <View style={styles.formRowTwoCol}>
                                <View style={{ flex: 1, marginRight: 6 }}>
                                    <Text style={styles.inputLabel}>ชื่อ</Text>
                                    <TextInput
                                        style={styles.textInputOutline}
                                        value={staffForm.firstname}
                                        onChangeText={(t) => setStaffForm({ ...staffForm, firstname: t })}
                                    />
                                </View>
                                <View style={{ flex: 1, marginLeft: 6 }}>
                                    <Text style={styles.inputLabel}>นามสกุล</Text>
                                    <TextInput
                                        style={styles.textInputOutline}
                                        value={staffForm.lastname}
                                        onChangeText={(t) => setStaffForm({ ...staffForm, lastname: t })}
                                    />
                                </View>
                            </View>

                            <Text style={styles.inputLabel}>อีเมล</Text>
                            <TextInput
                                style={styles.textInputOutline}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                value={staffForm.email}
                                onChangeText={(t) => setStaffForm({ ...staffForm, email: t })}
                            />

                            <Text style={styles.inputLabel}>เบอร์โทร</Text>
                            <TextInput
                                style={styles.textInputOutline}
                                keyboardType="phone-pad"
                                value={staffForm.phone}
                                onChangeText={(t) => setStaffForm({ ...staffForm, phone: t })}
                            />

                            <Text style={styles.inputLabel}>ตำแหน่ง</Text>
                            <TouchableOpacity style={styles.pickerOutline} onPress={() => setRoleMenuOpen((v) => !v)} activeOpacity={0.7}>
                                <Text style={{ color: '#333' }}>{ROLE_OPTIONS.find((r) => r.value === staffRole)?.label}</Text>
                                <Feather name={roleMenuOpen ? 'chevron-up' : 'chevron-down'} size={18} color="#333" />
                            </TouchableOpacity>
                            {roleMenuOpen && (
                                <View style={styles.roleMenu}>
                                    {ROLE_OPTIONS.map((opt) => (
                                        <TouchableOpacity
                                            key={opt.value}
                                            style={styles.roleMenuItem}
                                            onPress={() => { setStaffRole(opt.value); setRoleMenuOpen(false); }}
                                        >
                                            <Text style={[styles.roleMenuItemText, staffRole === opt.value && styles.roleMenuItemTextActive]}>
                                                {opt.label}
                                            </Text>
                                            {staffRole === opt.value && <Feather name="check" size={16} color="#1976D2" />}
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            )}

                            <Text style={styles.inputLabel}>รหัสผ่านเริ่มต้น</Text>
                            <TextInput
                                style={styles.textInputOutline}
                                secureTextEntry={true}
                                value={staffForm.password}
                                onChangeText={(t) => setStaffForm({ ...staffForm, password: t })}
                            />

                            <TouchableOpacity
                                style={[styles.blueSubmitBtn, submitting && { opacity: 0.7 }]}
                                onPress={handleCreateStaff}
                                disabled={submitting}
                            >
                                {submitting ? (
                                    <ActivityIndicator color="#FFF" />
                                ) : (
                                    <Text style={styles.blueSubmitText}>สร้างบัญชี</Text>
                                )}
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
    userCardLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },

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
    badgeBlueSmall: { backgroundColor: '#E3F2FD', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, alignSelf: 'flex-start', marginTop: 2 },
    badgeBlueSmallText: { color: '#1976D2', fontSize: 10, fontWeight: 'bold' },

    removeText: { fontSize: 12, color: '#888', fontWeight: 'bold' },

    emptyBox: { alignItems: 'center', paddingVertical: 36 },
    emptyText: { fontSize: 13, color: '#9E8CA6', fontWeight: '600', marginTop: 10 },

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
    modalBox: { width: '100%', backgroundColor: '#FFF', borderRadius: 16, padding: 20, maxHeight: '85%' },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    modalTitleBlue: { fontSize: 16, fontWeight: 'bold', color: '#1976D2' },

    formRowTwoCol: { flexDirection: 'row', justifyContent: 'space-between' },
    inputLabel: { fontSize: 12, fontWeight: 'bold', color: '#333', marginTop: 12, marginBottom: 6 },
    textInputOutline: { borderWidth: 1, borderColor: '#D1D1D1', borderRadius: 8, height: 42, paddingHorizontal: 12, fontSize: 14 },
    pickerOutline: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#D1D1D1', borderRadius: 8, height: 42, paddingHorizontal: 12 },

    roleMenu: { borderWidth: 1, borderColor: '#D1D1D1', borderRadius: 8, marginTop: 6, overflow: 'hidden' },
    roleMenuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    roleMenuItemText: { fontSize: 13, color: '#333' },
    roleMenuItemTextActive: { color: '#1976D2', fontWeight: 'bold' },

    blueSubmitBtn: { backgroundColor: '#1976D2', paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 24, marginBottom: 10 },
    blueSubmitText: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' },
});
import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, StatusBar, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

export default function ProfileClinic() {
    const clinicRole = 'ผู้ดูแล';


    const [isEditing, setIsEditing] = useState(false); // แก้ไข/ดูข้อมูล

    const [clinicData, setClinicData] = useState({
        clinicName: 'คลินิกรักษาสัตว์\nHappyPet',
        ownerName: 'น.สพ.สมพง',
        email: 'XXX@gmail.com',
        address: 'เลขที่ 99/8 ซอยสุขุมวิท 55 (ทองหล่อ) ถนนสุขุมวิท แขวงคลองตันเหนือ เขตวัฒนา กรุงเทพมหานคร 10110',
        phone: '02-123-4567 หรือ 02-999-8888',
        hours: 'จันทร์-เสาร์ 09:00-18:00 น.',
        licenseNo: 'XX-XX-XXXX-XXX'
    });

    // ข้อมูลชั่วคราวเวลาแก้ไข
    const [editForm, setEditForm] = useState({ ...clinicData });

    // นสลับโหมด และบันทึกข้อมูล
    const handleToggleEdit = () => {
        if (isEditing) {
            // บันทึกข้อมูล
            setClinicData(editForm);
            Alert.alert('สำเร็จ', 'อัปเดตโปรไฟล์คลินิกเรียบร้อยแล้ว');
        } else {
            // โหลดข้อมูลเข้าฟอร์มก่อนเริ่มแก้
            setEditForm({ ...clinicData });
        }
        setIsEditing(!isEditing);
    };

    // ฟอร์มกรอกข้อมูล
    const renderEditField = (label, key, isMultiline = false) => (
        <View style={styles.editFieldContainer}>
            <Text style={styles.editLabel}>{label}</Text>
            <View style={styles.editInputRow}>
                <TextInput
                    style={[styles.editInput, isMultiline && { height: 60, textAlignVertical: 'top', paddingTop: 10 }]}
                    value={editForm[key]}
                    onChangeText={(text) => setEditForm({ ...editForm, [key]: text })}
                    multiline={isMultiline}
                />
                <TouchableOpacity style={styles.editInlineBtn} onPress={() => Alert.alert('แก้ไข', `อัปเดต ${label}`)}>
                    <Text style={styles.editInlineBtnText}>แก้ไข</Text>
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
                    <Text style={styles.clinicNameText}>{clinicData.clinicName.replace('\n', ' ')}</Text>
                </View>
                <Text style={styles.roleText}>{clinicRole}</Text>
            </View>

            <View style={styles.bodyWrapper}>
                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                    <View style={styles.contentPadding}>

                        <Text style={styles.mainTitle}>โปรไฟล์คลินิก</Text>


                        {/* โปรไฟล์หลัก */}
                        <View style={styles.profileCard}>

                            {/* ปุ่มแก้ไข มุมขวาบน */}
                            <TouchableOpacity style={styles.editIconBtn} onPress={handleToggleEdit}>
                                <Feather name={isEditing ? "download" : "edit"} size={22} color="#1A1A1A" />
                            </TouchableOpacity>

                            <View style={styles.profileTopRow}>
                                <View style={styles.logoPlaceholder}></View>
                                <View style={styles.profileTopInfo}>
                                    <Text style={styles.clinicTitleText}>{clinicData.clinicName}</Text>

                                    {!isEditing && (
                                        <>
                                            <Text style={styles.ownerText}>{clinicData.ownerName}</Text>
                                            <Text style={styles.emailText}>{clinicData.email}</Text>
                                        </>
                                    )}
                                </View>
                            </View>

                            {!isEditing ? (
                                // ข้อมูล
                                <View style={styles.infoSection}>
                                    <View style={styles.infoRow}>
                                        <Feather name="map-pin" size={16} color="#666" style={styles.infoIcon} />
                                        <Text style={styles.infoText}>{clinicData.address}</Text>
                                    </View>
                                    <View style={styles.infoRow}>
                                        <Feather name="phone" size={16} color="#666" style={styles.infoIcon} />
                                        <Text style={styles.infoText}>{clinicData.phone}</Text>
                                    </View>
                                    <View style={styles.infoRow}>
                                        <Feather name="clock" size={16} color="#666" style={styles.infoIcon} />
                                        <Text style={styles.infoText}>{clinicData.hours}</Text>
                                    </View>
                                </View>
                            ) : (
                                // แก้ไขข้อมูล
                                <View style={styles.editSection}>
                                    {renderEditField('ชื่อ', 'ownerName')}
                                    {renderEditField('อีเมล', 'email')}
                                    {renderEditField('ที่อยู่', 'address', true)}
                                    {renderEditField('เบอร์', 'phone')}
                                    {renderEditField('วันเปิด-ปิด', 'hours')}
                                </View>
                            )}
                        </View>

                        {/* การ์ดใบอนุญาต */}
                        <View style={styles.licenseCard}>
                            <View style={styles.licenseLeft}>
                                <MaterialCommunityIcons name="shield-check" size={32} color="#00C853" style={{ marginRight: 12 }} />
                                <View>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Text style={styles.licenseTitle}>ใบอนุญาตดำเนินการ </Text>
                                        <TouchableOpacity onPress={() => Alert.alert('ใบอนุญาต', 'กำลังเปิดดูรายละเอียดเอกสาร...')}>
                                            <Text style={styles.licenseLink}>ดูรายละเอียด</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <Text style={styles.licenseNoText}>{clinicData.licenseNo}</Text>
                                </View>
                            </View>

                            <View style={styles.badgeGreen}>
                                <Text style={styles.badgeGreenText}>ยืนยันแล้ว</Text>
                            </View>
                        </View>

                        {/* ปุ่มออกจากระบบ */}
                        <TouchableOpacity
                            style={styles.logoutBtn}
                            onPress={() => Alert.alert('ออกจากระบบ', 'คุณต้องการออกจากระบบหรือไม่?', [{ text: 'ยกเลิก', style: 'cancel' }, { text: 'ตกลง', style: 'destructive' }])}
                        >
                            <Text style={styles.logoutBtnText}>ออกจากระบบ</Text>
                        </TouchableOpacity>

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

    // Profile Card
    profileCard: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EAEAEC', borderRadius: 16, padding: 16, marginBottom: 20, elevation: 1 },
    editIconBtn: { position: 'absolute', top: 16, right: 16, zIndex: 10, padding: 4 },

    profileTopRow: { flexDirection: 'row', marginBottom: 16, paddingRight: 30 }, // เว้นที่ให้ปุ่ม edit
    logoPlaceholder: { width: 80, height: 80, borderRadius: 16, backgroundColor: '#A21EEA', marginRight: 16 },
    profileTopInfo: { flex: 1, justifyContent: 'center' },
    clinicTitleText: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 8, lineHeight: 24 },
    ownerText: { fontSize: 13, color: '#4A4A4A', marginBottom: 2 },
    emailText: { fontSize: 13, color: '#888' },

    // View Mode Info
    infoSection: { marginTop: 8, borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 16 },
    infoRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
    infoIcon: { width: 20, marginRight: 8, marginTop: 2 },
    infoText: { flex: 1, fontSize: 11, color: '#666', lineHeight: 18 },

    // Edit Mode Info
    editSection: { marginTop: 8, borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 16 },
    editFieldContainer: { marginBottom: 12 },
    editLabel: { fontSize: 13, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 4 },
    editInputRow: { flexDirection: 'row', alignItems: 'stretch' },
    editInput: { flex: 1, borderWidth: 1, borderColor: '#666', borderTopLeftRadius: 8, borderBottomLeftRadius: 8, borderRightWidth: 0, paddingHorizontal: 12, height: 40, fontSize: 12, color: '#333' },
    editInlineBtn: { backgroundColor: '#A21EEA', paddingHorizontal: 16, justifyContent: 'center', alignItems: 'center', borderTopRightRadius: 8, borderBottomRightRadius: 8 },
    editInlineBtnText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },

    // License Card
    licenseCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EAEAEC', borderRadius: 12, padding: 16, marginBottom: 20 },
    licenseLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    licenseTitle: { fontSize: 12, fontWeight: 'bold', color: '#1A1A1A' },
    licenseLink: { fontSize: 12, fontWeight: 'bold', color: '#00C853', textDecorationLine: 'underline' },
    licenseNoText: { fontSize: 12, fontWeight: 'bold', color: '#00C853', marginTop: 4 },
    badgeGreen: { backgroundColor: '#E8F5E9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    badgeGreenText: { color: '#00C853', fontSize: 10, fontWeight: 'bold' },

    // Logout Button
    logoutBtn: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#FF3B30', borderRadius: 8, paddingVertical: 14, alignItems: 'center' },
    logoutBtnText: { color: '#FF3B30', fontSize: 14, fontWeight: 'bold' },
});
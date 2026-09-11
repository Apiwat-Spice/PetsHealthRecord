import React, { useState, useRef } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, StatusBar, Alert, Modal } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from "react-native-safe-area-context";
import { API_URL } from '../../config';
import QRCode from 'react-native-qrcode-svg';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

export default function PetDetail({ route, navigation }) {
    // 🟢 รับข้อมูลสัตว์เลี้ยงที่ส่งมาจากหน้า Pets.js
    console.log("📦 ข้อมูลที่หน้า PetDetail ได้รับ:", route.params);
    const { pet } = route.params || {};
    console.log("🐶 ข้อมูลสัตว์เลี้ยง:", pet);
    // 🟢 State สำหรับจัดการ Tab (info = ข้อมูลทั่วไป, health = ประวัติสุขภาพ, qr = QR Code)
    const [activeTab, setActiveTab] = useState('info');
    const qrRef = useRef();
    const handleDownloadQR = async () => {
        if (qrRef.current) {
            qrRef.current.toDataURL(async (base64Data) => {
                try {
                    // 1. จัดการชื่อไฟล์: แทนที่ช่องว่างด้วย _ (Underscore) ป้องกันระบบ Share ของ Android เออเร่อ
                    const safePetName = (pet?.pet_name || 'Pet').replace(/\s+/g, '_');

                    // 2. 🟢 ใช้ cacheDirectory แทน documentDirectory (เหมาะกับการแชร์ไฟล์ชั่วคราวมากที่สุด)
                    const fileUri = FileSystem.cacheDirectory + `QR_${safePetName}.png`;

                    // 3. สร้างไฟล์รูปภาพ
                    await FileSystem.writeAsStringAsync(fileUri, base64Data, {
                        encoding: FileSystem.EncodingType.Base64,
                    });

                    // 4. เช็กระบบการแชร์
                    const isAvailable = await Sharing.isAvailableAsync();
                    if (!isAvailable) {
                        Alert.alert('แจ้งเตือน', 'อุปกรณ์นี้ไม่รองรับฟังก์ชันการแชร์ไฟล์');
                        return;
                    }

                    // 5. เรียกหน้าต่างแชร์
                    await Sharing.shareAsync(fileUri, {
                        mimeType: 'image/png',
                        dialogTitle: `แชร์หรือบันทึก QR Code ของ ${pet?.pet_name}`,
                        UTI: 'public.png'
                    });

                } catch (error) {
                    console.error("Share QR Error:", error);
                    Alert.alert('ข้อผิดพลาด', 'ไม่สามารถแชร์หรือบันทึกรูปภาพได้');
                }
            });
        }
    };
    // ฟังก์ชันคำนวณอายุคร่าวๆ (ถ้ามีวันเกิด)
    const calculateAge = (birthDateString) => {
        if (!birthDateString) return '-';
        const birthYear = new Date(birthDateString).getFullYear();
        const currentYear = new Date().getFullYear();
        return `${currentYear - birthYear} ปี`;
    };

    const handleDeletePet = () => {
        Alert.alert(
            'ยืนยันการลบข้อมูล',
            `คุณแน่ใจหรือไม่ว่าต้องการลบข้อมูลของ "${pet?.pet_name}"?\n(ข้อมูลและรูปภาพจะถูกลบถาวร)`,
            [
                { text: 'ยกเลิก', style: 'cancel' },
                {
                    text: 'ลบข้อมูล',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            // ยิง API ไปบอก Backend ให้ลบข้อมูล
                            const response = await fetch(`${API_URL}/pets/${pet.pet_id}`, {
                                method: 'DELETE',
                            });

                            // 🟢 1. ดักจับข้อความแบบดิบๆ ก่อนเผื่อ Backend ส่ง HTML (404) กลับมา
                            const responseText = await response.text();

                            let result;
                            try {
                                result = JSON.parse(responseText);
                            } catch (e) {
                                // ถ้าแปลงเป็น JSON ไม่ได้ ให้ปริ้นท์ดูว่า Server ส่งอะไรมา
                                console.log("❌ ข้อความจาก Server (ไม่ใช่ JSON):", responseText);
                                throw new Error(`เซิร์ฟเวอร์ไม่ได้ส่งข้อมูล JSON กลับมา (Status: ${response.status}) \n\nอย่าลืมกด Restart เซิร์ฟเวอร์ Node.js ด้วยนะครับ`);
                            }

                            if (response.ok) {
                                console.log("Delete pet:", pet?.pet_id);
                                Alert.alert('สำเร็จ', 'ลบข้อมูลสัตว์เลี้ยงเรียบร้อยแล้ว', [
                                    { text: 'ตกลง', onPress: () => navigation.goBack() }
                                ]);
                            } else {
                                Alert.alert('เกิดข้อผิดพลาด', result.message || 'ไม่สามารถลบข้อมูลได้');
                            }
                        } catch (error) {
                            console.error("Delete Pet Error:", error);
                            Alert.alert('ข้อผิดพลาด', error.message);
                        }
                    }
                }
            ]
        );
    };


    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#2A4B6A" />

            {/* 🟢 Header สีน้ำเงินเข้ม */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Feather name="arrow-left" size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{pet?.pet_name || 'ชื่อสัตว์เลี้ยง'}</Text>
                <View style={{ width: 24 }} />
                {/* ไว้ถ่วงน้ำหนักให้ Title อยู่ตรงกลาง */}
            </View>

            <View style={styles.bodyContainer}>

                {/* 🟢 ส่วนของ Tab Menu */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tabButton, activeTab === 'info' && styles.tabActive]}
                        onPress={() => setActiveTab('info')}
                    >
                        <Text style={[styles.tabText, activeTab === 'info' && styles.tabTextActive]}>ข้อมูลทั่วไป</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.tabButton, activeTab === 'health' && styles.tabActive]}
                        onPress={() => setActiveTab('health')}
                    >
                        <Text style={[styles.tabText, activeTab === 'health' && styles.tabTextActive]}>ประวัติสุขภาพ</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.tabButton, activeTab === 'qr' && styles.tabActive]}
                        onPress={() => setActiveTab('qr')}
                    >
                        <Text style={[styles.tabText, activeTab === 'qr' && styles.tabTextActive]}>QR Code</Text>
                    </TouchableOpacity>
                </View>

                {/* 🟢 เนื้อหาของ Tab: ข้อมูลทั่วไป */}
                {activeTab === 'info' && (
                    <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.contentScroll}>

                        {/* การ์ดข้อมูลพื้นฐาน */}
                        <View style={styles.card}>
                            <Text style={styles.sectionTitle}>ข้อมูลพื้นฐาน</Text>
                            <View style={styles.divider} />

                            <View style={styles.profileSection}>
                                {pet?.pet_image_url ? (
                                    <Image source={{ uri: pet.pet_image_url }} style={styles.profileImage} />
                                ) : (
                                    <View style={[styles.profileImage, { backgroundColor: '#E0E0E0', justifyContent: 'center', alignItems: 'center' }]}>
                                        <Text style={{ fontSize: 40 }}>🐶</Text>
                                    </View>
                                )}
                            </View>

                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>สายพันธุ์ (ชนิด)</Text>
                                <Text style={styles.infoValue}>{pet?.animal_type || '-'}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>พันธุ์</Text>
                                <Text style={styles.infoValue}>{pet?.species || '-'}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>อายุ</Text>
                                <Text style={styles.infoValue}>{calculateAge(pet?.birth_date)}</Text>
                            </View>
                            <View style={styles.infoRow}>
                                <Text style={styles.infoLabel}>น้ำหนัก</Text>
                                <Text style={styles.infoValue}>{pet?.weight ? `${pet.weight} กก.` : '-'}</Text>
                            </View>

                            {/* ข้อควรระวังทางการแพทย์ */}
                            {pet?.detail && (
                                <View style={{ marginTop: 15 }}>
                                    <Text style={styles.warningTitle}>ข้อควรระวังทางการแพทย์</Text>
                                    <View style={styles.warningBox}>
                                        <Text style={styles.warningText}>{pet.detail}</Text>
                                    </View>
                                </View>
                            )}
                        </View>

                        <TouchableOpacity
                            style={styles.deleteButton}
                            onPress={handleDeletePet}
                        >
                            <Feather name="trash-2" size={20} color="#D32F2F" />
                            <Text style={styles.deleteButtonText}>ลบสัตว์เลี้ยง</Text>
                        </TouchableOpacity>

                    </ScrollView>
                )}

                {/* 🟢 เนื้อหาของ Tab: ประวัติสุขภาพ (สร้างรอไว้) */}
                {activeTab === 'health' && (
                    <View style={styles.centerContent}>
                        <Text style={{ color: '#666' }}>กำลังพัฒนาส่วนประวัติสุขภาพ กราฟ และวัคซีน...</Text>
                    </View>
                )}

                {/* 🟢 เนื้อหาของ Tab: QR Code */}
                {activeTab === 'qr' && (
                    <ScrollView
                        style={{ flex: 1, width: '100%' }}
                        contentContainerStyle={styles.qrScrollContainer}
                        showsVerticalScrollIndicator={false}
                    >
                        <View style={styles.qrCard}>
                            <View style={styles.qrHeader}>
                                <Text style={styles.qrTitle}>QR Code ประจำตัว</Text>
                                <Text style={styles.qrSubtitle}>{pet?.pet_name}</Text>
                            </View>

                            <View style={styles.qrCodeWrapper}>
                                {pet?.qr_code ? (
                                    <QRCode
                                        // 🟢 สำคัญ: ใส่ getRef เพื่อให้ฟังก์ชันดาวน์โหลดดึงรูปออกไปได้
                                        getRef={(c) => (qrRef.current = c)}
                                        value={`https://pawtag-app.com/pet/${pet.qr_code}`}
                                        size={200}
                                        color="#1A1A1A"
                                        backgroundColor="#FFFFFF"
                                    />
                                ) : (
                                    <Text style={styles.errorText}>ไม่พบรหัส QR Code</Text>
                                )}
                            </View>

                            <Text style={styles.qrInstruction}>
                                ให้สัตวแพทย์หรือพนักงานคลินิกสแกน{"\n"}
                                เพื่อเข้าถึงประวัติข้อมูลของ {pet?.pet_name || 'สัตว์เลี้ยง'}
                            </Text>

                            <View style={styles.qrIdBox}>
                                <Text style={styles.qrIdLabel}>รหัสอ้างอิง:</Text>
                                <Text style={styles.qrIdText} numberOfLines={1} ellipsizeMode="middle">
                                    {pet?.qr_code}
                                </Text>
                            </View>

                            {/* 🟢 ปุ่มดาวน์โหลด QR Code */}
                            <TouchableOpacity style={styles.downloadBtn} onPress={handleDownloadQR}>
                                <Feather name="download" size={18} color="#FFFFFF" />
                                <Text style={styles.downloadBtnText}>บันทึกรูป QR Code</Text>
                            </TouchableOpacity>

                        </View>
                    </ScrollView>
                )}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#2A4B6A' },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15 },
    backButton: { padding: 5 },
    headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#FFFFFF' },

    bodyContainer: { flex: 1, backgroundColor: '#F4F7F6', borderTopLeftRadius: 20, borderTopRightRadius: 20, overflow: 'hidden' },

    tabContainer: { flexDirection: 'row', backgroundColor: '#E4ECEC', margin: 15, borderRadius: 25, padding: 4 },
    tabButton: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 20 },
    tabActive: { backgroundColor: '#FFFFFF', elevation: 2, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 4 },
    tabText: { fontSize: 13, color: '#7A8B8B', fontWeight: 'bold' },
    tabTextActive: { color: '#2A4B6A' },

    contentScroll: { paddingHorizontal: 15, paddingBottom: 30 },
    centerContent: { flex: 1, justifyContent: 'center', alignItems: 'center' },

    card: { backgroundColor: '#FFFFFF', borderRadius: 15, padding: 20, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 5, marginBottom: 15 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#2A4B6A', marginBottom: 10 },
    divider: { height: 1, backgroundColor: '#EEEEEE', marginBottom: 20 },
    deleteButton: {
        backgroundColor: '#FEF2F2', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', paddingVertical: 12, borderRadius: 10, marginTop: 30
    },

    profileSection: { alignItems: 'center', marginBottom: 20 },
    profileImage: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: '#FFFFFF', elevation: 3 },

    infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
    infoLabel: { fontSize: 14, color: '#666' },
    infoValue: { fontSize: 14, fontWeight: 'bold', color: '#333' },

    warningTitle: { fontSize: 14, fontWeight: 'bold', color: '#D32F2F', marginBottom: 8 },
    warningBox: { backgroundColor: '#FFEBEE', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#FFCDD2' },
    warningText: { color: '#D32F2F', fontSize: 13 },

    qrScrollContainer: { flexGrow: 1, alignItems: 'center', paddingVertical: 20, paddingHorizontal: 16 },
    qrCard: {
        backgroundColor: '#FFFFFF',
        width: '100%',
        maxWidth: 360, // ป้องกันไม่ให้การ์ดยืดกว้างเกินไปบนจอใหญ่
        borderRadius: 20,
        padding: 25,
        alignItems: 'center', // บังคับให้ของข้างในอยู่ตรงกลางทั้งหมด
        elevation: 3,
        shadowColor: '#000',
        shadowOpacity: 0.1,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 4 }
    },
    qrHeader: { alignItems: 'center', marginBottom: 25 },
    qrTitle: { fontSize: 20, fontWeight: 'bold', color: '#2A4B6A' },
    qrSubtitle: { fontSize: 16, color: '#666', marginTop: 4 },
    qrCodeWrapper: {
        padding: 15,
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        borderWidth: 2,
        borderColor: '#F0F0F0',
        alignItems: 'center',
        justifyContent: 'center'
    },
    qrInstruction: { fontSize: 13, color: '#777', textAlign: 'center', marginTop: 25, lineHeight: 22 },
    qrIdBox: {
        marginTop: 25,
        backgroundColor: '#F8F9FA',
        paddingVertical: 12,
        paddingHorizontal: 15,
        borderRadius: 10,
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: '#EEEEEE'
    },
    qrIdLabel: { fontSize: 12, color: '#888', marginRight: 8, fontWeight: 'bold' },
    qrIdText: { fontSize: 12, color: '#444', flexShrink: 1 },
    errorText: { color: '#D32F2F', marginVertical: 20 },
    downloadBtn: {
        flexDirection: 'row',
        backgroundColor: '#00B862', // สีเขียวให้ดูเป็นการเซฟ/สำเร็จ
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 25,
        width: '100%',
        elevation: 2,
        shadowColor: '#00B862',
        shadowOpacity: 0.3,
        shadowRadius: 5,
        shadowOffset: { width: 0, height: 3 }
    },
    downloadBtnText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: 'bold',
        marginLeft: 8
    },
});
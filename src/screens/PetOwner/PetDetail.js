import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, StatusBar ,button} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { SafeAreaView } from "react-native-safe-area-context";

export default function PetDetail({ route, navigation }) {
    // 🟢 รับข้อมูลสัตว์เลี้ยงที่ส่งมาจากหน้า Pets.js
    const { pet } = route.params || {};

    // 🟢 State สำหรับจัดการ Tab (info = ข้อมูลทั่วไป, health = ประวัติสุขภาพ, qr = QR Code)
    const [activeTab, setActiveTab] = useState('info');

    // ฟังก์ชันคำนวณอายุคร่าวๆ (ถ้ามีวันเกิด)
    const calculateAge = (birthDateString) => {
        if (!birthDateString) return '-';
        const birthYear = new Date(birthDateString).getFullYear();
        const currentYear = new Date().getFullYear();
        return `${currentYear - birthYear} ปี`;
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

                        <button style={{ backgroundColor: '#4F8EF7', padding: 12, borderRadius: 8, alignItems: 'center', marginTop: 10 }}
                            onPress={handleDeletePet}
                        >
                            <Text style={{ color: '#FFF', fontWeight: 'bold' }}>Delete Pet</Text>
                        </button>

                    </ScrollView>
                )}

                {/* 🟢 เนื้อหาของ Tab: ประวัติสุขภาพ (สร้างรอไว้) */}
                {activeTab === 'health' && (
                    <View style={styles.centerContent}>
                        <Text style={{ color: '#666' }}>กำลังพัฒนาส่วนประวัติสุขภาพ กราฟ และวัคซีน...</Text>
                    </View>
                )}

                {/* 🟢 เนื้อหาของ Tab: QR Code (สร้างรอไว้) */}
                {activeTab === 'qr' && (
                    <View style={styles.centerContent}>
                        <Text style={{ color: '#666' }}>แสดงคิวอาร์โค้ดของ: {pet?.pet_name}</Text>
                        <Text style={{ color: '#999', marginTop: 10 }}>ID: {pet?.qr_code}</Text>
                    </View>
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

    profileSection: { alignItems: 'center', marginBottom: 20 },
    profileImage: { width: 100, height: 100, borderRadius: 50, borderWidth: 3, borderColor: '#FFFFFF', elevation: 3 },

    infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
    infoLabel: { fontSize: 14, color: '#666' },
    infoValue: { fontSize: 14, fontWeight: 'bold', color: '#333' },

    warningTitle: { fontSize: 14, fontWeight: 'bold', color: '#D32F2F', marginBottom: 8 },
    warningBox: { backgroundColor: '#FFEBEE', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#FFCDD2' },
    warningText: { color: '#D32F2F', fontSize: 13 },
});
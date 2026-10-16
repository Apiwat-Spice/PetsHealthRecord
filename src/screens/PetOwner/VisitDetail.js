import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, Pressable, ActivityIndicator, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { API_URL } from '../../config';

export default function VisitDetail({ navigation, route }) {
    const { visitId } = route.params || {};
    const [visitData, setVisitData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchVisitDetail();
    }, []);

    const fetchVisitDetail = async () => {
        try {
            // ดึงข้อมูลประวัติการรักษาพร้อมเชื่อมโยงตาราง appointments และ vets
            const response = await fetch(`${API_URL}/visit-records/${visitId}`);
            if (response.ok) {
                const data = await response.json();
                setVisitData(data);
            } else {
                Alert.alert('แจ้งเตือน', 'ไม่สามารถโหลดข้อมูลรายละเอียดการรักษาได้');
            }
        } catch (error) {
            console.log('Error fetching visit detail:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.loaderContainer}>
                <ActivityIndicator size="large" color="#0056D2" />
            </View>
        );
    }

    const translateTitle = (title) => {
        switch (title) {
            case 'Health Checkup': return 'ตรวจสุขภาพประจำปี';
            case 'Vaccination': return 'ฉีดวัคซีน';
            case 'Sick Visit / Consultation': return 'ตรวจรักษาอาการป่วย';
            case 'Spay / Neuter': return 'ทำหมัน';
            case 'Grooming / Boarding': return 'อาบน้ำตัดขน / ฝากเลี้ยง';
            default: return title || 'บันทึกการรักษา';
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Pressable onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Feather name="arrow-left" size={24} color="#FFF" />
                </Pressable>
                <Text style={styles.headerTitle}>รายละเอียดประวัติการรักษา</Text>
            </View>

            <ScrollView contentContainerStyle={styles.contentContainer}>

                {/* ส่วนที่ 1: ข้อมูลทั่วไปการเข้ารับบริการ */}
                <View style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>ข้อมูลการเข้ารับบริการ</Text>

                    <View style={styles.rowItem}>
                        <Text style={styles.label}>หัวข้อการรักษา</Text>
                        <Text style={styles.value}>{translateTitle(visitData?.appointments?.title || visitData?.title)}</Text>
                    </View>

                    <View style={styles.rowItem}>
                        <Text style={styles.label}>วันที่เข้ารับบริการ</Text>
                        <Text style={styles.value}>{visitData?.visit_date} {visitData?.visit_time ? `เวลา ${visitData.visit_time.substring(0, 5)} น.` : ''}</Text>
                    </View>

                    <View style={styles.rowItem}>
                        <Text style={styles.label}>น้ำหนักตัวขณะตรวจ</Text>
                        <Text style={styles.value}>{visitData?.weight ? `${visitData.weight} กก.` : 'ไม่ระบุ'}</Text>
                    </View>
                </View>

                {/* ส่วนที่ 2: ผลการตรวจและวินิจฉัย (จาก Visit Record) */}
                <View style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>ผลการตรวจวินิจฉัย</Text>

                    <View style={styles.blockItem}>
                        <Text style={styles.subLabel}>อาการเบื้องต้น / อาการที่พบ</Text>
                        <Text style={styles.blockValue}>{visitData?.symptoms || 'ไม่มีข้อมูลอาการ'}</Text>
                    </View>

                    <View style={styles.blockItem}>
                        <Text style={styles.subLabel}>การวินิจฉัยโรค (Diagnosis)</Text>
                        <Text style={styles.blockValue}>{visitData?.diagnosis || 'ไม่มีข้อมูลการวินิจฉัย'}</Text>
                    </View>

                    <View style={styles.blockItem}>
                        <Text style={styles.subLabel}>แนวทางการรักษา (Treatment)</Text>
                        <Text style={styles.blockValue}>{visitData?.treatment || 'ไม่มีข้อมูลการรักษา'}</Text>
                    </View>

                    <View style={styles.blockItem}>
                        <Text style={styles.subLabel}>บันทึกเพิ่มเติม / คำแนะนำจากสัตวแพทย์</Text>
                        <Text style={styles.blockValue}>{visitData?.note || 'ไม่มีคำแนะนำเพิ่มเติม'}</Text>
                    </View>
                </View>

                {/* ส่วนที่ 3: บุคลากรผู้ดูแล */}
                <View style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>สัตวแพทย์ผู้ทำการรักษา</Text>

                    <View style={styles.rowItem}>
                        <Text style={styles.label}>สัตวแพทย์</Text>
                        <Text style={styles.value}>
                            {visitData?.vets?.first_name
                                ? `น.สพ. ${visitData.vets.first_name} ${visitData.vets.last_name || ''}`
                                : 'ไม่ระบุรายชื่อสัตวแพทย์'}
                        </Text>
                    </View>
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#EAF4F4' },
    loaderContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    header: { backgroundColor: '#0056D2', padding: 20, paddingTop: 20, flexDirection: 'row', alignItems: 'center' },
    backButton: { marginRight: 15 },
    headerTitle: { color: '#FFF', fontSize: 20, fontWeight: 'bold' },
    contentContainer: { padding: 15, paddingBottom: 30 },

    sectionCard: { backgroundColor: '#FFF', borderRadius: 12, padding: 16, marginBottom: 15, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 3, elevation: 2 },
    sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#0056D2', marginBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F0F0F0', paddingBottom: 6 },

    rowItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
    label: { fontSize: 13, color: '#666', flex: 1, marginRight: 10 },
    value: { fontSize: 13, color: '#333', fontWeight: '500', flex: 1.2, textAlign: 'right' },

    blockItem: { marginBottom: 14 },
    subLabel: { fontSize: 13, fontWeight: '600', color: '#0056D2', marginBottom: 4 },
    blockValue: { fontSize: 13, color: '#333', backgroundColor: '#F8FBFF', padding: 10, borderRadius: 8, borderWidth: 1, borderColor: '#EAF4F4', lineHeight: 18 }
});
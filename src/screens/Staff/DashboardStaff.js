import React from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

export default function DashboardStaff({ navigation }) {
    const staffInfo = { clinicName: 'คลินิกรักษาสัตว์ HappyPet', staffName: 'คุณมานี รักงาน' };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <StatusBar barStyle="light-content" backgroundColor="#2F80ED" />

            {/* Header แถบสีน้ำเงิน */}
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

                        <Text style={styles.mainTitle}>{staffInfo.clinicName}</Text>
                        <Text style={styles.subTitle}>พนักงาน : {staffInfo.staffName}</Text>

                        {/* กล่องสถิติ */}
                        <View style={styles.statsRow}>
                            <TouchableOpacity style={[styles.statBox, { backgroundColor: '#FF8C00' }]} onPress={() => navigation.navigate('Date')}>
                                <Text style={styles.statNumber}>1</Text>
                                <Text style={styles.statLabel}>รออนุมัติ</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={[styles.statBox, { backgroundColor: '#2F80ED' }]} onPress={() => navigation.navigate('Date')}>
                                <Text style={styles.statNumber}>1</Text>
                                <Text style={styles.statLabel}>นัดที่อนุมัติแล้ว</Text>
                            </TouchableOpacity>
                        </View>

                        {/* รออนุมัติ */}
                        <View style={styles.sectionHeader}>
                            <Feather name="info" size={20} color="#FF8C00" style={styles.sectionIcon} />
                            <Text style={styles.sectionTitleOrange}>รออนุมัติ</Text>
                        </View>

                        <TouchableOpacity style={styles.apptCardOrange} onPress={() => navigation.navigate('Date')}>
                            <Text style={styles.apptTitleOrange}>ฉีดวัคซีนพิษสุนัขบ้าประจำปี</Text>
                            <Text style={styles.apptDetailText}>หมูเด้ง - 2027-05-17 เวลา 10.00น.</Text>
                            <Text style={styles.apptDetailText}>เจ้าของ : คุณสมชาย</Text>
                        </TouchableOpacity>

                        {/* นัดหมายล่าสุด */}
                        <View style={[styles.sectionHeader, { marginTop: 16 }]}>
                            <Feather name="calendar" size={20} color="#2F80ED" style={styles.sectionIcon} />
                            <Text style={styles.sectionTitleBlue}>นัดหมายล่าสุด</Text>
                        </View>

                        <TouchableOpacity style={styles.apptCardBlue} onPress={() => navigation.navigate('Date')}>
                            <Text style={styles.apptTitleBlue}>ฉีดวัคซีนพิษสุนัขบ้าประจำปี</Text>
                            <Text style={styles.apptDetailText}>หมูเด้ง - เวลา 10.00น.</Text>
                            <Text style={[styles.apptDetailText, { color: '#2F80ED', fontWeight: 'bold' }]}>หมอ : น.สพ.สมพง</Text>
                        </TouchableOpacity>

                        <View style={{ height: 40 }} />
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
    mainTitle: { fontSize: 22, fontWeight: 'bold', color: '#2F80ED', marginBottom: 4 },
    subTitle: { fontSize: 13, color: '#888', marginBottom: 20 },

    statsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 24 },
    statBox: { flex: 1, borderRadius: 12, paddingVertical: 20, alignItems: 'center', marginHorizontal: 4, elevation: 2 },
    statNumber: { color: '#FFFFFF', fontSize: 24, fontWeight: 'bold', marginBottom: 4 },
    statLabel: { color: '#FFFFFF', fontSize: 13, fontWeight: 'bold' },

    sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    sectionIcon: { marginRight: 8 },
    sectionTitleOrange: { fontSize: 18, fontWeight: 'bold', color: '#FF8C00' },
    sectionTitleBlue: { fontSize: 18, fontWeight: 'bold', color: '#2F80ED' },

    apptCardOrange: { backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#FF9800', borderRadius: 16, padding: 16, marginBottom: 16, borderLeftWidth: 6 },
    apptTitleOrange: { fontSize: 16, fontWeight: 'bold', color: '#FF6B00', marginBottom: 8 },

    apptCardBlue: { backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#2F80ED', borderRadius: 16, padding: 16, marginBottom: 16, borderLeftWidth: 6 },
    apptTitleBlue: { fontSize: 16, fontWeight: 'bold', color: '#2F80ED', marginBottom: 8 },

    apptDetailText: { fontSize: 13, color: '#333', marginBottom: 4, fontWeight: '600' },
});
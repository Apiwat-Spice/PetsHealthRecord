import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

export default function ProfileStaff() {
    const staffInfo = { clinicName: 'คลินิกรักษาสัตว์ HappyPet', staffName: 'คุณมานี รักงาน' };

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
                <View style={styles.contentPadding}>

                    <Text style={styles.mainTitle}>โปรไฟล์พนักงาน</Text>

                    {/* การ์ดโปรไฟล์ */}
                    <View style={styles.profileCard}>
                        <View style={styles.avatarCircle}>
                            <Feather name="user" size={40} color="#1A1A1A" />
                        </View>
                        <View style={styles.profileInfo}>
                            <Text style={styles.profileName}>{staffInfo.staffName}</Text>
                            <Text style={styles.clinicSubText}>{staffInfo.clinicName}</Text>
                            <View style={styles.badgeBlue}>
                                <Text style={styles.badgeBlueText}>พนักงาน</Text>
                            </View>
                        </View>
                    </View>

                    {/* เมนูการตั้งค่า */}
                    <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert('รหัสผ่าน', 'เข้าสู่หน้าเปลี่ยนรหัสผ่าน')}>
                        <View style={styles.menuLeft}>
                            <Feather name="lock" size={20} color="#666" style={styles.menuIcon} />
                            <Text style={styles.menuText}>เปลี่ยนรหัสผ่าน</Text>
                        </View>
                        <Feather name="chevron-right" size={20} color="#CCC" />
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.menuItem} onPress={() => Alert.alert('ออกจากระบบ', 'คุณต้องการออกจากระบบหรือไม่?', [{ text: 'ยกเลิก' }, { text: 'ตกลง' }])}>
                        <View style={styles.menuLeft}>
                            <Feather name="log-out" size={20} color="#FF3B30" style={styles.menuIcon} />
                            <Text style={[styles.menuText, { color: '#FF3B30' }]}>ออกจากระบบ</Text>
                        </View>
                        <Feather name="chevron-right" size={20} color="#CCC" />
                    </TouchableOpacity>

                </View>
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
    contentPadding: { padding: 20 },

    mainTitle: { fontSize: 22, fontWeight: 'bold', color: '#2F80ED', marginBottom: 20 },

    profileCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EAEAEC', borderRadius: 16, padding: 20, marginBottom: 24, elevation: 1 },
    avatarCircle: { width: 70, height: 70, borderRadius: 35, borderWidth: 3, borderColor: '#333', alignItems: 'center', justifyContent: 'center', marginRight: 16 },
    profileInfo: { flex: 1 },
    profileName: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 4 },
    clinicSubText: { fontSize: 12, color: '#888', marginBottom: 8 },
    badgeBlue: { backgroundColor: '#E3F2FD', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-start' },
    badgeBlueText: { color: '#1976D2', fontSize: 11, fontWeight: 'bold' },

    menuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EAEAEC', borderRadius: 12, padding: 16, marginBottom: 12 },
    menuLeft: { flexDirection: 'row', alignItems: 'center' },
    menuIcon: { marginRight: 12 },
    menuText: { fontSize: 14, fontWeight: 'bold', color: '#333' },
});
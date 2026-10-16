import { StyleSheet, Text, View, Image, TouchableOpacity, FlatList, RefreshControl } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

export default function ClinicsTab({ clinics, refreshing, onRefresh, onBookAppointment, onCallClinic }) {
    const formatTime = (timeString) => timeString ? timeString.substring(0, 5) : '-';

    const renderClinicCard = ({ item }) => {
        const fullAddress = [
            item.address_line || item.address,
            item.subdistrict ? `ต.${item.subdistrict}` : '',
            item.district ? `อ.${item.district}` : '',
            item.province ? `จ.${item.province}` : '',
            item.postal_code || ''
        ].filter(Boolean).join(' ') || 'ไม่มีข้อมูลที่อยู่';

        return (
            <View style={styles.card}>
                {/* รูปภาพและป้ายสถานะคลินิก */}
                <View style={styles.imageContainer}>
                    <Image
                        source={
                            item.profile_image_url && item.profile_image_url !== ''
                                ? { uri: item.profile_image_url } //ดึงรูปจาก Database
                                : require('../../../src/public/pictures/background-welcome.png') // ภาพสำรองถ้ายังไม่มีรูป
                        }
                        style={styles.clinicImage}
                        resizeMode="cover"
                    />
                    <View style={styles.badgeOverlay}>
                        <Feather name="check-circle" size={13} color="#FFF" />
                        <Text style={styles.badgeText}> คลินิกพาร์ทเนอร์</Text>
                    </View>
                </View>

                {/* ชื่อและคำโปรย */}
                <View style={styles.titleContainer}>
                    <Text style={styles.clinicName}>{item.clinic_name || 'คลินิกรักษาสัตว์'}</Text>
                    <Text style={styles.clinicTagline}>บริการตรวจรักษาโรคทั่วไป ฉีดวัคซีน และดูแลสัตว์เลี้ยงครบวงจร</Text>
                </View>

                <View style={styles.divider} />

                {/* ข้อมูลรายละเอียด */}
                <View style={styles.infoSection}>
                    <View style={styles.infoRow}>
                        <View style={styles.iconWrapper}>
                            <Feather name="clock" size={16} color="#0056D2" />
                        </View>
                        <View style={styles.infoTextGroup}>
                            <Text style={styles.infoLabel}>เวลาเปิดให้บริการ</Text>
                            <Text style={styles.infoValue}>
                                เปิดทุกวัน: {formatTime(item.open_time)} - {formatTime(item.close_time)} น.
                            </Text>
                        </View>
                    </View>

                    <View style={styles.infoRow}>
                        <View style={styles.iconWrapper}>
                            <Feather name="map-pin" size={16} color="#0056D2" />
                        </View>
                        <View style={styles.infoTextGroup}>
                            <Text style={styles.infoLabel}>ที่อยู่ตั้งสถานพยาบาล</Text>
                            <Text style={styles.infoValue} numberOfLines={2}>{fullAddress}</Text>
                        </View>
                    </View>

                    <View style={styles.infoRow}>
                        <View style={styles.iconWrapper}>
                            <Feather name="phone" size={16} color="#0056D2" />
                        </View>
                        <View style={styles.infoTextGroup}>
                            <Text style={styles.infoLabel}>เบอร์โทรศัพท์ติดต่อ</Text>
                            <Text style={styles.infoValue}>{item.phone || 'ยังไม่ระบุเบอร์โทรศัพท์'}</Text>
                        </View>
                    </View>
                </View>

                {/* ปุ่มทำรายการและโทรออก */}
                <View style={styles.buttonContainer}>
                    <TouchableOpacity
                        style={styles.bookButton}
                        onPress={() => onBookAppointment(item)}
                        activeOpacity={0.8}
                    >
                        <Feather name="calendar" size={18} color="#FFF" style={{ marginRight: 8 }} />
                        <Text style={styles.bookButtonText}>ทำรายการนัดหมาย</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.callButton}
                        onPress={() => onCallClinic(item.phone)}
                        activeOpacity={0.8}
                    >
                        <Feather name="phone-call" size={18} color="#0056D2" />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <FlatList
            data={clinics}
            keyExtractor={(item, index) => index.toString()}
            renderItem={renderClinicCard}
            contentContainerStyle={styles.listContainer}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#0056D2']} tintColor="#0056D2" />
            }
        />
    );
}

const styles = StyleSheet.create({
    listContainer: { paddingHorizontal: 20, paddingBottom: 25, paddingTop: 10 },

    card: {
        backgroundColor: '#FFF',
        borderRadius: 20,
        padding: 18,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.08,
        shadowRadius: 10,
        elevation: 4,
        borderWidth: 1,
        borderColor: '#EAF4F4'
    },

    imageContainer: { position: 'relative', marginBottom: 14 },
    clinicImage: { width: '100%', height: 170, borderRadius: 14 },
    badgeOverlay: {
        position: 'absolute',
        top: 10,
        right: 10,
        backgroundColor: 'rgba(9, 145, 66, 0.9)',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 14
    },
    badgeText: { color: '#FFF', fontSize: 11, fontWeight: 'bold' },

    titleContainer: { alignItems: 'center', marginBottom: 10 },
    clinicName: { fontSize: 20, fontWeight: 'bold', color: '#0056D2', textAlign: 'center', marginBottom: 4 },
    clinicTagline: { fontSize: 12, color: '#666', textAlign: 'center', paddingHorizontal: 10 },

    divider: { height: 1, backgroundColor: '#F0F2F5', marginVertical: 12 },

    infoSection: { marginBottom: 15 },
    infoRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
    iconWrapper: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: '#EAF4F4',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        marginTop: 1
    },
    infoTextGroup: { flex: 1 },
    infoLabel: { fontSize: 11, color: '#888', marginBottom: 2 },
    infoValue: { fontSize: 13, color: '#333', fontWeight: '500', lineHeight: 18 },

    buttonContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 5 },

    bookButton: {
        flex: 4,
        backgroundColor: '#0056D2',
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 14,
        borderRadius: 12,
        marginRight: 10,
        shadowColor: '#0056D2',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 3
    },
    bookButtonText: { color: '#FFF', fontSize: 15, fontWeight: 'bold' },

    callButton: {
        flex: 1,
        backgroundColor: '#F0F4F8',
        borderWidth: 1,
        borderColor: '#D0E1FD',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 13,
        borderRadius: 12
    }
});
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, StatusBar, Platform, Alert, Modal, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../../config';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function ProfileClinic({ setIsLoggedIn }) {
    const navigation = useNavigation();

    const [clinicRole, setClinicRole] = useState('กำลังโหลด...');
    const [vetClass, setVetClass] = useState('-');
    const [isEditing, setIsEditing] = useState(false);

    const [showDocModal, setShowDocModal] = useState(false);
    const [clinicDocs, setClinicDocs] = useState(null); 
    
    //  State สำหรับเก็บ URL รูปภาพที่ต้องการแสดงเต็มจอ
    const [fullScreenImage, setFullScreenImage] = useState(null);

    const [clinicData, setClinicData] = useState({
        clinicName: 'กำลังโหลดข้อมูล...',
        vetName: '-',
        email: '',
        address: '-',
        phone: '-',
        hours: '-',
        licenseNo: '-',
        verified: false,
        isOwner: false
    });

    const [editForm, setEditForm] = useState({ ...clinicData });

    useEffect(() => {
        const fetchClinicData = async () => {
            try {
                const profileStr = await SecureStore.getItemAsync('vet_profile');
                const userStr = await SecureStore.getItemAsync('user');
                
                if (!profileStr) return;

                const profile = JSON.parse(profileStr);
                const user = userStr ? JSON.parse(userStr) : {};
                const vetId = profile.vet_id;

                setVetClass(profile.vet_class ? `สัตวแพทย์ชั้น ${profile.vet_class}` : 'สัตวแพทย์');

                const res = await fetch(`${API_URL}/check-clinic-status/${vetId}`);
                const data = await res.json();

                if (res.ok && data.status === 'pass' && data.submittedDocs) {
                    const docs = data.submittedDocs;
                    
                    setClinicDocs(docs); 

                    const addr = docs.address || {};
                    const fullAddress = `${addr.address_line || ''} ต.${addr.subdistrict || ''} อ.${addr.district || ''} จ.${addr.province || ''} ${addr.postal_code || ''}`.trim();

                    const isOwner = data.role === 'owner';
                    
                    setClinicRole(isOwner ? 'เจ้าของสถานพยาบาล' : 'สัตวแพทย์ประจำคลินิก');

                    setClinicData({
                        clinicName: docs.clinic_name || 'ไม่ระบุชื่อ',
                        vetName: `${profile.firstname} ${profile.lastname}`,
                        email: user.email || profile.email || '',
                        address: fullAddress || '-',
                        phone: profile.phone || '-',
                        hours: docs.operating_hours || '-',
                        licenseNo: docs.clinic_license_id ? `CLC-${docs.clinic_license_id.toString().padStart(6, '0')}` : '-',
                        verified: true,
                        isOwner: isOwner 
                    });
                }
            } catch (error) {
                console.error("Error fetching clinic data:", error);
                Alert.alert("ข้อผิดพลาด", "ไม่สามารถโหลดข้อมูลคลินิกได้");
            }
        };

        fetchClinicData();
    }, []);

    useEffect(() => {
        setEditForm(clinicData);
    }, [clinicData]);

    const handleToggleEdit = () => {
        if (isEditing) {
            setClinicData(editForm);
            Alert.alert('สำเร็จ', 'ฟังก์ชันอัปเดตคลินิกจะถูกเพิ่มในภายหลัง');
        } else {
            setEditForm({ ...clinicData });
        }
        setIsEditing(!isEditing);
    };

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

    const switchToVetMode = () => {
        navigation.navigate("VetNavigator");
    };

    const handleLogout = () => {
        Alert.alert(
            "ออกจากระบบ",
            "คุณต้องการออกจากระบบหรือไม่?",
            [
                { text: "ยกเลิก", style: "cancel" },
                {
                    text: "ออกจากระบบ",
                    style: "destructive",
                    onPress: async () => {
                        try {
                            await SecureStore.deleteItemAsync("token");
                            await SecureStore.deleteItemAsync("user");
                            await SecureStore.deleteItemAsync("vet_profile");
                            
                            if (setIsLoggedIn) {
                                setIsLoggedIn(false);
                            } else {
                                navigation.reset({
                                    index: 0,
                                    routes: [{ name: 'Welcome' }], 
                                });
                            }
                        } catch (error) {
                            console.error("Logout Error:", error);
                            Alert.alert("เกิดข้อผิดพลาด", "ไม่สามารถออกจากระบบได้");
                        }
                    }
                }
            ]
        );
    };

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

                        <View style={styles.switchModeContainer}>
                            <TouchableOpacity style={styles.switchModeBtn} onPress={switchToVetMode}>
                                <View style={styles.switchIconBg}>
                                    <Feather name="user" size={24} color="#FFF" />
                                </View>
                                <View style={styles.switchTextContainer}>
                                    <Text style={styles.switchModeTitle}>สลับเป็นโหมดสัตวแพทย์</Text>
                                    <Text style={styles.switchModeSub}>เปลี่ยนไปจัดการข้อมูลส่วนตัว</Text>
                                </View>
                                <Feather name="chevron-right" size={24} color="#9C27B0" />
                            </TouchableOpacity>
                        </View>

                        <View style={styles.profileCard}>
                            <TouchableOpacity style={styles.editIconBtn} onPress={handleToggleEdit}>
                                <Feather name={isEditing ? "download" : "edit"} size={20} color="#333" />
                            </TouchableOpacity>

                            <View style={styles.profileTopRow}>
                                <View style={styles.logoPlaceholder}></View>
                                <View style={styles.profileTopInfo}>
                                    <Text style={styles.clinicTitleText}>{clinicData.clinicName}</Text>
                                </View>
                            </View>

                            {!isEditing ? (
                                <>
                                    <View style={styles.vetInfoWrapper}>
                                        <Text style={styles.vetNameText}>{clinicData.vetName}</Text>
                                        
                                        <View style={styles.badgeRow}>
                                            <View style={styles.badgeGreenSmall}>
                                                <Text style={styles.badgeGreenSmallText}>{vetClass}</Text>
                                            </View>
                                            
                                            {clinicData.isOwner && (
                                                <View style={[styles.badgePurpleSmall, { marginLeft: 6 }]}>
                                                    <Text style={styles.badgePurpleSmallText}>
                                                        เจ้าของ{clinicData.clinicName}
                                                    </Text>
                                                </View>
                                            )}
                                        </View>
                                        
                                        {clinicData.email && clinicData.email !== '-' ? (
                                            <Text style={styles.emailText}>{clinicData.email}</Text>
                                        ) : null}
                                    </View>

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
                                </>
                            ) : (
                                <View style={styles.editSection}>
                                    {renderEditField('ชื่อแพทย์', 'vetName')}
                                    {renderEditField('อีเมล', 'email')}
                                    {renderEditField('ที่อยู่', 'address', true)}
                                    {renderEditField('เบอร์', 'phone')}
                                    {renderEditField('วันเปิด-ปิด', 'hours')}
                                </View>
                            )}
                        </View>

                        <View style={styles.licenseCard}>
                            <View style={styles.licenseLeft}>
                                <MaterialCommunityIcons name="shield-check" size={32} color="#00C853" style={{ marginRight: 12 }} />
                                <View>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        <Text style={styles.licenseTitle}>ใบอนุญาตดำเนินการ </Text>
                                        <TouchableOpacity onPress={() => setShowDocModal(true)}>
                                            <Text style={styles.licenseLink}>ดูรายละเอียด</Text>
                                        </TouchableOpacity>
                                    </View>
                                    <Text style={styles.licenseNoText}>{clinicData.licenseNo}</Text>
                                </View>
                            </View>

                            {clinicData.verified && (
                                <View style={styles.badgeGreen}>
                                    <Text style={styles.badgeGreenText}>ยืนยันแล้ว</Text>
                                </View>
                            )}
                        </View>

                        <TouchableOpacity
                            style={styles.logoutBtn}
                            onPress={handleLogout}
                        >
                            <Text style={styles.logoutBtnText}>ออกจากระบบ</Text>
                        </TouchableOpacity>

                        <View style={{ height: 40 }} />
                    </View>
                </ScrollView>
            </View>

            {/* Modal รายละเอียดเอกสารหลัก */}
            <Modal
                visible={showDocModal}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setShowDocModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>รายละเอียดเอกสารคำขอ</Text>
                            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setShowDocModal(false)}>
                                <Feather name="x" size={24} color="#666" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.modalBody} showsVerticalScrollIndicator={false}>
                            
                            <View style={styles.docSection}>
                                <Text style={styles.docSectionTitle}>ข้อมูลสถานพยาบาล</Text>
                                <View style={styles.docRow}>
                                    <Text style={styles.docLabel}>ชื่อสถานพยาบาล:</Text>
                                    <Text style={styles.docValue}>{clinicData.clinicName}</Text>
                                </View>
                                <View style={styles.docRow}>
                                    <Text style={styles.docLabel}>รหัสใบอนุญาต:</Text>
                                    <Text style={styles.docValue}>{clinicData.licenseNo}</Text>
                                </View>
                            </View>

                            <View style={styles.docSection}>
                                <Text style={styles.docSectionTitle}>ใบอนุญาตให้ให้ตั้งสถานพยาบาลสัตว์ (ส.ส.๓)</Text>
                                {clinicDocs?.ss3_license_url ? (
                                    //  หุ้มรูปด้วย TouchableOpacity เพื่อกดซูมภาพ
                                    <TouchableOpacity activeOpacity={0.8} onPress={() => setFullScreenImage(clinicDocs.ss3_license_url)}>
                                        <View style={styles.imageContainer}>
                                            <Image 
                                                source={{ uri: clinicDocs.ss3_license_url }} 
                                                style={styles.docPreviewImage} 
                                                resizeMode="cover"
                                            />
                                            <View style={styles.zoomIconOverlay}>
                                                <Feather name="zoom-in" size={24} color="#FFF" />
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                ) : (
                                    <View style={styles.docPlaceholder}>
                                        <Text style={styles.docPlaceholderText}>ไม่พบรูปภาพเอกสาร</Text>
                                    </View>
                                )}
                                <Text style={styles.docExpireText}>
                                    หมดอายุ: <Text style={styles.docExpireBold}>{clinicDocs?.ss3_license_expired || 'ไม่ระบุ'}</Text>
                                </Text>
                            </View>

                            <View style={styles.docSection}>
                                <Text style={styles.docSectionTitle}>ใบอนุญาตดำเนินการสถานพยาบาลสัตว์ (ส.ส.๔)</Text>
                                {clinicDocs?.ss4_license_url ? (
                                    //  หุ้มรูปด้วย TouchableOpacity เพื่อกดซูมภาพ
                                    <TouchableOpacity activeOpacity={0.8} onPress={() => setFullScreenImage(clinicDocs.ss4_license_url)}>
                                        <View style={styles.imageContainer}>
                                            <Image 
                                                source={{ uri: clinicDocs.ss4_license_url }} 
                                                style={styles.docPreviewImage} 
                                                resizeMode="cover"
                                            />
                                            <View style={styles.zoomIconOverlay}>
                                                <Feather name="zoom-in" size={24} color="#FFF" />
                                            </View>
                                        </View>
                                    </TouchableOpacity>
                                ) : (
                                    <View style={styles.docPlaceholder}>
                                        <Text style={styles.docPlaceholderText}>ไม่พบรูปภาพเอกสาร</Text>
                                    </View>
                                )}
                                <Text style={styles.docExpireText}>
                                    หมดอายุ: <Text style={styles.docExpireBold}>{clinicDocs?.ss4_license_expired || 'ไม่ระบุ'}</Text>
                                </Text>
                            </View>

                            <View style={{ height: 30 }} />
                        </ScrollView>

                    </View>
                </View>
            </Modal>

            {/*  Modal สำหรับแสดงรูปภาพเต็มจอ (Full Screen Zoom) */}
            <Modal
                visible={!!fullScreenImage}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setFullScreenImage(null)}
            >
                <View style={styles.fullScreenOverlay}>
                    <TouchableOpacity 
                        style={styles.fullScreenCloseBtn} 
                        onPress={() => setFullScreenImage(null)}
                    >
                        <Feather name="x" size={28} color="#FFF" />
                    </TouchableOpacity>
                    
                    {/* ScrollView จะทำให้รองรับการซูม (Pinch to zoom) บน iOS */}
                    <ScrollView 
                        contentContainerStyle={styles.fullScreenScroll}
                        maximumZoomScale={3}
                        minimumZoomScale={1}
                        centerContent={true}
                        showsHorizontalScrollIndicator={false}
                        showsVerticalScrollIndicator={false}
                    >
                        {fullScreenImage && (
                            <Image 
                                source={{ uri: fullScreenImage }}
                                style={styles.fullScreenImage}
                                resizeMode="contain"
                            />
                        )}
                    </ScrollView>
                </View>
            </Modal>

        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#9C27B0' },
    headerBar: { backgroundColor: '#9C27B0', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14 },
    headerLeft: { flexDirection: 'row', alignItems: 'center' },
    clinicNameText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', marginLeft: 6, flexShrink: 1, maxWidth: 200 },
    roleText: { color: '#FFFFFF', fontSize: 13, fontWeight: 'bold' },

    bodyWrapper: { flex: 1, backgroundColor: '#FFFFFF' },
    scrollView: { flex: 1 },
    contentPadding: { padding: 20 },

    mainTitle: { fontSize: 22, fontWeight: 'bold', color: '#9C27B0', marginBottom: 16 },

    switchModeContainer: { marginBottom: 20 },
    switchModeBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F3E5F5',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: '#E1BEE7',
    },
    switchIconBg: {
        backgroundColor: '#9C27B0',
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    switchTextContainer: { flex: 1 },
    switchModeTitle: { fontSize: 16, fontWeight: 'bold', color: '#9C27B0', marginBottom: 4 },
    switchModeSub: { fontSize: 12, color: '#7B1FA2' },

    profileCard: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EAEAEC', borderRadius: 16, padding: 16, marginBottom: 20, elevation: 1 },
    editIconBtn: { position: 'absolute', top: 18, right: 18, zIndex: 10, padding: 4 },

    profileTopRow: { flexDirection: 'row', marginBottom: 12, paddingRight: 32, alignItems: 'center' },
    logoPlaceholder: { width: 75, height: 75, borderRadius: 16, backgroundColor: '#902BF5', marginRight: 16 }, 
    profileTopInfo: { flex: 1 },
    clinicTitleText: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A', lineHeight: 24 },

    vetInfoWrapper: { marginBottom: 12 },
    vetNameText: { fontSize: 15, fontWeight: 'bold', color: '#333', marginBottom: 6 },
    emailText: { fontSize: 13, color: '#888', marginTop: 4 },

    badgeRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap' },
    badgeGreenSmall: { backgroundColor: '#E8F5E9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-start', marginBottom: 4 },
    badgeGreenSmallText: { color: '#00C853', fontSize: 10, fontWeight: 'bold' },
    
    badgePurpleSmall: { backgroundColor: '#F3E5F5', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-start', marginBottom: 4 },
    badgePurpleSmallText: { color: '#902BF5', fontSize: 10, fontWeight: 'bold' }, 

    infoSection: { marginTop: 4, borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 16 },
    infoRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
    infoIcon: { width: 22, marginRight: 8 },
    infoText: { flex: 1, fontSize: 12, color: '#666', lineHeight: 18 },

    editSection: { marginTop: 8, borderTopWidth: 1, borderTopColor: '#F0F0F0', paddingTop: 16 },
    editFieldContainer: { marginBottom: 12 },
    editLabel: { fontSize: 13, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 4 },
    editInputRow: { flexDirection: 'row', alignItems: 'stretch' },
    editInput: { flex: 1, borderWidth: 1, borderColor: '#666', borderTopLeftRadius: 8, borderBottomLeftRadius: 8, borderRightWidth: 0, paddingHorizontal: 12, height: 40, fontSize: 12, color: '#333' },
    editInlineBtn: { backgroundColor: '#A21EEA', paddingHorizontal: 16, justifyContent: 'center', alignItems: 'center', borderTopRightRadius: 8, borderBottomRightRadius: 8 },
    editInlineBtnText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },

    licenseCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EAEAEC', borderRadius: 12, padding: 16, marginBottom: 20 },
    licenseLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    licenseTitle: { fontSize: 12, fontWeight: 'bold', color: '#1A1A1A' },
    licenseLink: { fontSize: 12, fontWeight: 'bold', color: '#00C853', textDecorationLine: 'underline' },
    licenseNoText: { fontSize: 12, fontWeight: 'bold', color: '#00C853', marginTop: 4 },
    badgeGreen: { backgroundColor: '#E8F5E9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    badgeGreenText: { color: '#00C853', fontSize: 10, fontWeight: 'bold' },

    logoutBtn: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#FF3B30', borderRadius: 8, paddingVertical: 14, alignItems: 'center' },
    logoutBtnText: { color: '#FF3B30', fontSize: 14, fontWeight: 'bold' },

    //  Styles สำหรับ Modal 
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
    modalContent: { backgroundColor: '#FFFFFF', borderTopLeftRadius: 24, borderTopRightRadius: 24, height: '85%', padding: 20 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottomWidth: 1, borderBottomColor: '#F0F0F0', paddingBottom: 15 },
    modalTitle: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A' },
    modalCloseBtn: { padding: 4 },
    modalBody: { flex: 1 },

    docSection: { marginBottom: 24, backgroundColor: '#FAFAFA', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#EAEAEC' },
    docSectionTitle: { fontSize: 15, fontWeight: 'bold', color: '#9C27B0', marginBottom: 12 },
    
    docRow: { flexDirection: 'row', marginBottom: 6 },
    docLabel: { width: 120, fontSize: 13, color: '#666' },
    docValue: { flex: 1, fontSize: 13, fontWeight: 'bold', color: '#333' },

    //  Styles สำหรับรูปภาพที่กดดูได้
    imageContainer: { position: 'relative', width: '100%', height: 200, marginBottom: 12, borderRadius: 8, overflow: 'hidden' },
    docPreviewImage: { width: '100%', height: '100%', backgroundColor: '#EAEAEC' },
    zoomIconOverlay: { position: 'absolute', right: 10, bottom: 10, backgroundColor: 'rgba(0,0,0,0.5)', width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
    
    docPlaceholder: { width: '100%', height: 200, backgroundColor: '#F5F5F5', borderRadius: 8, marginBottom: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#EAEAEC', borderStyle: 'dashed' },
    docPlaceholderText: { color: '#999', fontSize: 14 },
    
    docExpireText: { fontSize: 13, color: '#666', textAlign: 'center' },
    docExpireBold: { fontWeight: 'bold', color: '#D32F2F' },

    //  Styles สำหรับ Modal เต็มหน้าจอ
    fullScreenOverlay: { flex: 1, backgroundColor: '#000' },
    fullScreenCloseBtn: { position: 'absolute', top: Platform.OS === 'ios' ? 50 : 20, right: 20, zIndex: 10, padding: 10, backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: 20 },
    fullScreenScroll: { flexGrow: 1, justifyContent: 'center', alignItems: 'center' },
    fullScreenImage: { width: screenWidth, height: screenHeight * 0.8 },
});
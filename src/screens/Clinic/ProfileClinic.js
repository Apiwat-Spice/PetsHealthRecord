import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, StatusBar, Platform, Alert, Modal, Image, Dimensions, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import * as SecureStore from 'expo-secure-store';
import ImageView from "react-native-image-viewing";
import * as DocumentPicker from 'expo-document-picker';
import { API_URL } from '../../config';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

export default function ProfileClinic({ setIsLoggedIn }) {
    const navigation = useNavigation();

    const [vetId, setVetId] = useState(null);
    const [clinicRole, setClinicRole] = useState('กำลังโหลด...');
    const [vetClass, setVetClass] = useState('-');

    const [showDocModal, setShowDocModal] = useState(false);
    const [clinicDocs, setClinicDocs] = useState(null);
    const [viewerImages, setViewerImages] = useState([]);
    const [isViewerVisible, setIsViewerVisible] = useState(false);

    const [clinicLogo, setClinicLogo] = useState(null);
    const [isUploadingLogo, setIsUploadingLogo] = useState(false);

    const [clinicData, setClinicData] = useState({
        clinicName: 'กำลังโหลดข้อมูล...',
        vetName: '-',
        email: '',
        address: '-',
        phone: '-',
        hours: '-',
        licenseNo: '-',
        verified: false,
        isOwner: false,
        clinicId: null
    });

    useEffect(() => {
        const fetchClinicData = async () => {
            console.log("==== 🔄 [ProfileClinic] เริ่มโหลดข้อมูลคลินิก ====");
            try {
                const profileStr = await SecureStore.getItemAsync('vet_profile');
                const userStr = await SecureStore.getItemAsync('user');

                if (!profileStr) {
                    console.log("⚠️ [ProfileClinic] ไม่พบข้อมูล vet_profile ในเครื่อง");
                    return;
                }

                const profile = JSON.parse(profileStr);
                const user = userStr ? JSON.parse(userStr) : {};
                const currentVetId = profile.vet_id;

                console.log(`👤 [ProfileClinic] Vet ID ปัจจุบัน: ${currentVetId}`);

                setVetId(currentVetId);
                setVetClass(profile.vet_class ? `สัตวแพทย์ชั้น ${profile.vet_class}` : 'สัตวแพทย์');

                console.log(`📡 [ProfileClinic] กำลังเรียก API: ${API_URL}/check-clinic-status/${currentVetId}`);
                const res = await fetch(`${API_URL}/check-clinic-status/${currentVetId}`);
                const data = await res.json();

                console.log(`📥 [ProfileClinic] API ตอบกลับ (Status: ${res.status}):`, JSON.stringify(data, null, 2));

                if (res.ok && data.status === 'pass' && data.submittedDocs) {
                    const docs = data.submittedDocs;
                    setClinicDocs(docs);

                    const addr = docs.address || {};
                    const fullAddress = `${addr.address_line || ''} ต.${addr.subdistrict || ''} อ.${addr.district || ''} จ.${addr.province || ''} ${addr.postal_code || ''}`.trim();

                    const isOwner = data.role === 'owner';
                    console.log(`🛡️ [ProfileClinic] สิทธิ์ของผู้ใช้: ${isOwner ? 'Owner (เจ้าของ)' : 'Staff (พนักงาน)'}`);
                    setClinicRole(isOwner ? 'เจ้าของสถานพยาบาล' : 'สัตวแพทย์ประจำคลินิก');

                    if (docs.vet_clinic_image_url) {
                        console.log(`🖼️ [ProfileClinic] พบโลโก้คลินิก: ${docs.vet_clinic_image_url}`);
                        setClinicLogo(docs.vet_clinic_image_url);
                    }

                    setClinicData({
                        clinicName: docs.clinic_name || 'ไม่ระบุชื่อ',
                        vetName: `${profile.firstname} ${profile.lastname}`,
                        email: user.email || profile.email || '',
                        address: fullAddress || '-',
                        phone: profile.phone || '-',
                        hours: docs.operating_hours || '-',
                        licenseNo: docs.clinic_license_id ? `CLC-${docs.clinic_license_id.toString().padStart(6, '0')}` : '-',
                        verified: true,
                        isOwner: isOwner,
                        clinicId: docs.vet_clinic_id
                    });
                } else {
                    console.log("⚠️ [ProfileClinic] ไม่พบข้อมูลคลินิกที่ผ่านการยืนยันแล้ว");
                }
            } catch (error) {
                console.error("🚨 [ProfileClinic] Error fetching clinic data:", error);
                Alert.alert("ข้อผิดพลาด", "ไม่สามารถโหลดข้อมูลคลินิกได้");
            }
        };

        fetchClinicData();
    }, []);

    const handlePickAndUploadLogo = async () => {
        console.log("==== 📸 [ProfileClinic] เริ่มกระบวนการเปลี่ยนรูปร้าน ====");
        if (!clinicData.isOwner) {
            Alert.alert("สิทธิ์การใช้งาน", "เฉพาะเจ้าของสถานพยาบาลเท่านั้นที่สามารถเปลี่ยนรูปได้");
            return;
        }

        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['image/jpeg', 'image/png'], 
                copyToCacheDirectory: true,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const file = result.assets[0];
                console.log(`📄 [ProfileClinic] ไฟล์ที่เลือก: ${file.name}`);
                
                setIsUploadingLogo(true);
                const formData = new FormData();
                
                formData.append('vet_id', String(vetId));
                
                // 🟢 กลับมาใช้วิธีแปลงเป็น Blob (วิธีที่เวิร์ค 100% สำหรับโปรเจกต์ของคุณ)
                console.log("📦 กำลังแปลงไฟล์เป็น Blob...");
                const fileResponse = await fetch(file.uri);
                const blob = await fileResponse.blob();
                
                // แนบ Blob เข้าไปใน FormData
                formData.append('clinic_logo', blob, file.name || 'logo.jpg');

                console.log(`📤 กำลังส่งข้อมูลไปที่ API: ${API_URL}/upload-clinic-logo`);
                const response = await fetch(`${API_URL}/upload-clinic-logo`, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json',
                        // ห้ามใส่ Content-Type: multipart/form-data ตรงนี้ ปล่อยให้ RN จัดการเอง
                    },
                });

                const resultText = await response.text();
                let resultData;
                try {
                    resultData = JSON.parse(resultText);
                } catch (e) {
                    throw new Error("เซิร์ฟเวอร์ตอบกลับผิดพลาด: " + resultText);
                }

                if (response.ok) {
                    console.log("✅ อัปโหลดรูปสำเร็จ โชว์รูปใหม่บนหน้าจอ");
                    setClinicLogo(resultData.logo_url);
                    Alert.alert("สำเร็จ", "อัปเดตรูปภาพสถานพยาบาลเรียบร้อยแล้ว");
                } else {
                    Alert.alert("ข้อผิดพลาด", resultData.message || "ไม่สามารถอัปโหลดรูปภาพได้");
                }
            }
        } catch (err) {
            console.error("🚨 Upload Logo Error:", err);
            Alert.alert("ข้อผิดพลาด", "เกิดปัญหาในการอัปโหลดรูปภาพ: " + (err.message || "Unknown error"));
        } finally {
            setIsUploadingLogo(false);
            console.log("==== 🏁 จบกระบวนการอัปโหลดรูปร้าน ====");
        }
    };

    const switchToVetMode = () => {
        console.log("🔄 [ProfileClinic] สลับไปโหมดสัตวแพทย์");
        navigation.navigate("VetNavigator", { screen: "Profile" });
    };

    const handleLogout = () => {
        Alert.alert("ออกจากระบบ", "คุณต้องการออกจากระบบหรือไม่?", [
            { text: "ยกเลิก", style: "cancel" },
            {
                text: "ออกจากระบบ", style: "destructive",
                onPress: async () => {
                    console.log("🚪 [ProfileClinic] กดยืนยันออกจากระบบ กำลังเคลียร์ข้อมูล...");
                    try {
                        await SecureStore.deleteItemAsync("token");
                        await SecureStore.deleteItemAsync("user");
                        await SecureStore.deleteItemAsync("vet_profile");

                        console.log("✅ [ProfileClinic] เคลียร์ข้อมูล SecureStore สำเร็จ");

                        if (setIsLoggedIn) {
                            setIsLoggedIn(false);
                        } else {
                            navigation.reset({ index: 0, routes: [{ name: 'Welcome' }] });
                        }
                    } catch (error) {
                        console.error("🚨 [ProfileClinic] Logout Error:", error);
                        Alert.alert("ข้อผิดพลาด", "ไม่สามารถออกจากระบบได้");
                    }
                }
            }
        ]);
    };

    const openFullScreenImage = (imageUrl) => {
        console.log(`🔍 [ProfileClinic] เปิดดูรูปเต็มจอ: ${imageUrl}`);
        setViewerImages([{ uri: imageUrl }]);
        setIsViewerVisible(true);
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
                            <View style={styles.profileTopRow}>
                                <TouchableOpacity
                                    style={styles.logoContainer}
                                    onPress={handlePickAndUploadLogo}
                                    disabled={isUploadingLogo || !clinicData.isOwner}
                                >
                                    {clinicLogo ? (
                                        <Image source={{ uri: clinicLogo }} style={styles.logoImage} />
                                    ) : (
                                        <View style={styles.logoPlaceholder}>
                                            <Feather name="camera" size={24} color="#FFF" />
                                        </View>
                                    )}

                                    {isUploadingLogo && (
                                        <View style={styles.uploadingOverlay}>
                                            <ActivityIndicator size="small" color="#FFF" />
                                        </View>
                                    )}

                                    {clinicData.isOwner && !isUploadingLogo && (
                                        <View style={styles.editBadgeIcon}>
                                            <Feather name="edit-2" size={12} color="#FFF" />
                                        </View>
                                    )}
                                </TouchableOpacity>

                                <View style={styles.profileTopInfo}>
                                    <Text style={styles.clinicTitleText}>{clinicData.clinicName}</Text>
                                </View>
                            </View>

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

                        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
                            <Text style={styles.logoutBtnText}>ออกจากระบบ</Text>
                        </TouchableOpacity>

                        <View style={{ height: 40 }} />
                    </View>
                </ScrollView>
            </View>

            <Modal visible={showDocModal} animationType="slide" transparent={true} onRequestClose={() => setShowDocModal(false)}>
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
                                    <TouchableOpacity activeOpacity={0.8} onPress={() => openFullScreenImage(clinicDocs.ss3_license_url)}>
                                        <View style={styles.imageContainer}>
                                            <Image source={{ uri: clinicDocs.ss3_license_url }} style={styles.docPreviewImage} resizeMode="cover" />
                                            <View style={styles.zoomIconOverlay}><Feather name="zoom-in" size={24} color="#FFF" /></View>
                                        </View>
                                    </TouchableOpacity>
                                ) : (
                                    <View style={styles.docPlaceholder}><Text style={styles.docPlaceholderText}>ไม่พบรูปภาพเอกสาร</Text></View>
                                )}
                            </View>

                            <View style={styles.docSection}>
                                <Text style={styles.docSectionTitle}>ใบอนุญาตดำเนินการสถานพยาบาลสัตว์ (ส.ส.๔)</Text>
                                {clinicDocs?.ss4_license_url ? (
                                    <TouchableOpacity activeOpacity={0.8} onPress={() => openFullScreenImage(clinicDocs.ss4_license_url)}>
                                        <View style={styles.imageContainer}>
                                            <Image source={{ uri: clinicDocs.ss4_license_url }} style={styles.docPreviewImage} resizeMode="cover" />
                                            <View style={styles.zoomIconOverlay}><Feather name="zoom-in" size={24} color="#FFF" /></View>
                                        </View>
                                    </TouchableOpacity>
                                ) : (
                                    <View style={styles.docPlaceholder}><Text style={styles.docPlaceholderText}>ไม่พบรูปภาพเอกสาร</Text></View>
                                )}
                            </View>
                            <View style={{ height: 30 }} />
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            <ImageView
                images={viewerImages}
                imageIndex={0}
                visible={isViewerVisible}
                onRequestClose={() => setIsViewerVisible(false)}
                swipeToCloseEnabled={true}
            />

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
    switchModeBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3E5F5', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: '#E1BEE7' },
    switchIconBg: { backgroundColor: '#9C27B0', width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
    switchTextContainer: { flex: 1 },
    switchModeTitle: { fontSize: 16, fontWeight: 'bold', color: '#9C27B0', marginBottom: 4 },
    switchModeSub: { fontSize: 12, color: '#7B1FA2' },

    profileCard: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EAEAEC', borderRadius: 16, padding: 16, marginBottom: 20, elevation: 1 },

    profileTopRow: { flexDirection: 'row', marginBottom: 12, alignItems: 'center' },

    logoContainer: { width: 75, height: 75, borderRadius: 16, marginRight: 16, position: 'relative', overflow: 'hidden', backgroundColor: '#902BF5' },
    logoImage: { width: '100%', height: '100%', borderRadius: 16 },
    logoPlaceholder: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    uploadingOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
    editBadgeIcon: { position: 'absolute', bottom: 4, right: 4, backgroundColor: 'rgba(0,0,0,0.6)', width: 20, height: 20, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },

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

    licenseCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EAEAEC', borderRadius: 12, padding: 16, marginBottom: 20 },
    licenseLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
    licenseTitle: { fontSize: 12, fontWeight: 'bold', color: '#1A1A1A' },
    licenseLink: { fontSize: 12, fontWeight: 'bold', color: '#00C853', textDecorationLine: 'underline' },
    licenseNoText: { fontSize: 12, fontWeight: 'bold', color: '#00C853', marginTop: 4 },
    badgeGreen: { backgroundColor: '#E8F5E9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    badgeGreenText: { color: '#00C853', fontSize: 10, fontWeight: 'bold' },

    logoutBtn: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#FF3B30', borderRadius: 8, paddingVertical: 14, alignItems: 'center' },
    logoutBtnText: { color: '#FF3B30', fontSize: 14, fontWeight: 'bold' },

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

    imageContainer: { position: 'relative', width: '100%', height: 200, marginBottom: 12, borderRadius: 8, overflow: 'hidden' },
    docPreviewImage: { width: '100%', height: '100%', backgroundColor: '#EAEAEC' },
    zoomIconOverlay: { position: 'absolute', right: 10, bottom: 10, backgroundColor: 'rgba(0,0,0,0.5)', width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },

    docPlaceholder: { width: '100%', height: 200, backgroundColor: '#F5F5F5', borderRadius: 8, marginBottom: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#EAEAEC', borderStyle: 'dashed' },
    docPlaceholderText: { color: '#999', fontSize: 14 }
});
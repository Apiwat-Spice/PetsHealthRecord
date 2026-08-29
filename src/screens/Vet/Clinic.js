import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, Alert, Platform, Modal, ScrollView } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { API_URL } from '../../config';

export default function Clinic({ vetProfile, verificationStatus, clinicStatus, setClinicStatus, clinicDetail }) {
    const [clinicSubView, setClinicSubView] = useState('list');
    const [joinModalVisible, setJoinModalVisible] = useState(false);
    const [joinCodeInput, setJoinCodeInput] = useState('');

    const [clinicForm, setClinicForm] = useState({
        clinicName: '', operatingHours: '', addressLine: '', subdistrict: '', district: '', province: '', postalCode: '', latitude: '', longitude: '', googleMapUrl: ''
    });
    const [ss3File, setSs3File] = useState(null);
    const [ss4File, setSs4File] = useState(null);
    const [clinicVetLicenseFile, setClinicVetLicenseFile] = useState(null);

    // 🟢 ระบบจำกัดสิทธิ์: ดักจับตั้งแต่เริ่มต้น
    if (verificationStatus !== 'pass') {
        return (
            <View style={styles.restrictedContainer}>
                <MaterialCommunityIcons name="lock-alert-outline" size={64} color="#D32F2F" style={{ marginBottom: 16 }} />
                <Text style={styles.restrictedTitle}>ฟังก์ชันนี้ถูกจำกัดสิทธิ์</Text>
                <Text style={styles.restrictedDesc}>
                    คุณต้องผ่านการตรวจสอบเอกสารและได้รับการยืนยันตัวตนจากผู้ดูแลระบบก่อน จึงจะสามารถสมัครเข้าสังกัด หรือส่งคำขอสร้างสถานพยาบาลสัตว์ได้
                </Text>
            </View>
        );
    }

    const handleSelectFile = async (docType) => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: ['application/pdf', 'image/*'],
                copyToCacheDirectory: true,
            });

            if (!result.canceled && result.assets.length > 0) {
                const fileData = result.assets[0];
                if (docType === 'ss3') setSs3File(fileData);
                else if (docType === 'ss4') setSs4File(fileData);
                else if (docType === 'clinicVetLicense') setClinicVetLicenseFile(fileData);
            }
        } catch (error) {
            console.log('Error selecting file:', error);
            Alert.alert("ข้อผิดพลาด", "ไม่สามารถเลือกไฟล์ได้");
        }
    };

    const handleSubmitClinicRequest = async () => {
        if (!clinicForm.clinicName || !clinicForm.addressLine || !ss3File || !ss4File) {
            Alert.alert("แจ้งเตือน", "กรุณากรอกชื่อสถานพยาบาล ที่อยู่ และแนบเอกสารใบอนุญาตให้ครบถ้วน");
            return;
        }

        try {
            const formData = new FormData();
            formData.append('vet_id', String(vetProfile.vet_id || ''));
            formData.append('clinicName', String(clinicForm.clinicName || ''));
            formData.append('operatingHours', String(clinicForm.operatingHours || ''));
            formData.append('addressLine', String(clinicForm.addressLine || ''));
            formData.append('subdistrict', String(clinicForm.subdistrict || ''));
            formData.append('district', String(clinicForm.district || ''));
            formData.append('province', String(clinicForm.province || ''));
            formData.append('postalCode', String(clinicForm.postalCode || ''));
            formData.append('latitude', String(clinicForm.latitude || ''));
            formData.append('longitude', String(clinicForm.longitude || ''));
            formData.append('googleMapUrl', String(clinicForm.googleMapUrl || ''));

            const ss3Res = await fetch(ss3File.uri);
            const ss3Blob = await ss3Res.blob();
            formData.append('ss3_license_pdf', ss3Blob, ss3File.name || 'ss3_license.pdf');

            const ss4Res = await fetch(ss4File.uri);
            const ss4Blob = await ss4Res.blob();
            formData.append('ss4_license_pdf', ss4Blob, ss4File.name || 'ss4_license.pdf');

            if (clinicVetLicenseFile) {
                const cvRes = await fetch(clinicVetLicenseFile.uri);
                const cvBlob = await cvRes.blob();
                formData.append('clinic_vet_license_pdf', cvBlob, clinicVetLicenseFile.name || 'clinic_vet_license.pdf');
            }

            const response = await fetch(`${API_URL}/create-clinic-request`, {
                method: 'POST',
                body: formData,
            });

            const responseText = await response.text();
            let result;
            try { result = JSON.parse(responseText); }
            catch (e) {
                console.error("🚨 Backend Crash Report:\n", responseText);
                Alert.alert('Server Error', 'เซิร์ฟเวอร์ตอบกลับผิดพลาด กรุณาเช็ก Terminal ของ Backend');
                return;
            }

            if (response.ok) {
                // 🟢 เปลี่ยนสถานะเป็น pending ทันทีที่ส่งเสร็จ
                setClinicStatus('pending');
                Alert.alert('สำเร็จ', 'ส่งคำขอสร้างสถานพยาบาลเรียบร้อยแล้ว');
            } else {
                Alert.alert('เกิดข้อผิดพลาด', result.message || 'ไม่สามารถส่งคำขอได้');
            }
        } catch (error) {
            console.error("Clinic Request Error:", error);
            Alert.alert('การเชื่อมต่อขัดข้อง', 'เกิดปัญหาในการแพ็คไฟล์ หรือเซิร์ฟเวอร์ไม่ตอบสนอง');
        }
    };

    const handleClinicAction = (action) => {
        if (action === 'join') {
            if (clinicSubView === 'list') setJoinModalVisible(true);
            else setClinicSubView('list');
        } else if (action === 'create') {
            setClinicSubView('create');
        }
    };

    return (
        <View>
            <View style={styles.actionRow}>
                <TouchableOpacity style={[styles.actionBtn, clinicSubView === 'list' ? styles.btnGreen : styles.btnGray]} onPress={() => handleClinicAction('join')}>
                    <Text style={[styles.actionBtnText, clinicSubView === 'list' ? styles.textWhite : styles.textGray]}>สมัครเข้าสถานพยาบาล</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, (clinicSubView === 'create' || clinicSubView === 'success') ? styles.btnPurple : styles.btnGray]} onPress={() => handleClinicAction('create')}>
                    <Text style={[styles.actionBtnText, (clinicSubView === 'create' || clinicSubView === 'success') ? styles.textWhite : styles.textGray]}>สร้างสถานพยาบาล</Text>
                </TouchableOpacity>
            </View>

            {clinicSubView === 'list' && (
                <View>
                    <Text style={styles.sectionHeading}>สถานพยาบาลที่สังกัด</Text>
                    <View style={styles.warningBox}>
                        <Text style={styles.warningText}>ยังไม่มีสถานพยาบาลที่สังกัด</Text>
                    </View>
                    <TouchableOpacity style={[styles.fabAddButton, verificationStatus !== 'pass' && { backgroundColor: '#A9A9A9' }]} onPress={() => handleClinicAction('join')}>
                        <Feather name="plus" size={28} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            )}

            {clinicSubView === 'create' && (
                <View style={styles.createFormContainer}>
                    {/* 🟢 กรณี: อนุมัติแล้ว (pass) */}
                    {clinicStatus === 'pass' && (
                        <View style={styles.verifiedBox}>
                            <MaterialCommunityIcons name="domain" size={42} color="#00C853" style={{ marginRight: 16 }} />
                            <View style={{ flex: 1 }}>
                                <Text style={styles.verifiedTitle}>อนุมัติสถานพยาบาลแล้ว</Text>
                                <Text style={styles.verifiedDesc}>คำขอสร้างสถานพยาบาลของคุณผ่านการตรวจสอบเรียบร้อยแล้ว</Text>
                            </View>
                        </View>
                    )}

                    {/* 🟢 กรณี: รอตรวจสอบ (pending) */}
                    {clinicStatus === 'pending' && (
                        <View style={styles.pendingBox}>
                            <MaterialCommunityIcons name="clock-outline" size={42} color="#EF6C00" style={{ marginRight: 16 }} />
                            <View style={{ flex: 1 }}>
                                <Text style={styles.pendingTitle}>กำลังตรวจสอบคำขอ...</Text>
                                <Text style={styles.pendingDesc}>เอกสารคำขอเปิดสถานพยาบาลถูกส่งเข้าระบบแล้ว แอดมินจะทำการตรวจสอบและอนุมัติในภายหลัง</Text>
                            </View>
                        </View>
                    )}

                    {/* 🟢 กรณี: ไม่ผ่านอนุมัติ (notpass) พร้อมแสดง detail */}
                    {clinicStatus === 'notpass' && (
                        <View style={[styles.pendingBox, { backgroundColor: '#FFEBEE', borderColor: '#FFCDD2', flexDirection: 'column', alignItems: 'flex-start' }]}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <MaterialCommunityIcons name="close-circle-outline" size={42} color="#D32F2F" style={{ marginRight: 16 }} />
                                <View style={{ flex: 1 }}>
                                    <Text style={[styles.pendingTitle, { color: '#C62828' }]}>คำขอถูกปฏิเสธ</Text>
                                    <Text style={[styles.pendingDesc, { color: '#D32F2F' }]}>ข้อมูลหรือเอกสารสถานพยาบาลของคุณไม่ถูกต้อง กรุณาแก้ไขและส่งใหม่อีกครั้ง</Text>
                                </View>
                            </View>
                            <View style={{ backgroundColor: '#FFF', padding: 12, borderRadius: 8, marginTop: 12, width: '100%', borderWidth: 1, borderColor: '#FFCDD2' }}>
                                <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#C62828', marginBottom: 4 }}>เหตุผลที่ไม่อนุมัติ:</Text>
                                <Text style={{ fontSize: 13, color: '#333' }}>
                                    {clinicDetail ? clinicDetail : "ไม่ได้ระบุเหตุผล กรุณาติดต่อแอดมิน"}
                                </Text>
                            </View>
                            <TouchableOpacity
                                style={{ marginTop: 16, alignSelf: 'flex-start', paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#D32F2F', borderRadius: 8 }}
                                onPress={() => setClinicStatus('unsubmitted')} // ให้กลับไปโชว์ฟอร์ม
                            >
                                <Text style={{ color: '#FFF', fontWeight: 'bold' }}>ส่งคำขอใหม่</Text>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* 🟢 กรณี: ยังไม่ได้ส่ง (unsubmitted) ให้แสดงฟอร์ม */}
                    {clinicStatus === 'unsubmitted' && (
                        <View>
                            <Text style={styles.sectionHeading}>ส่งคำขอสร้างสถานพยาบาลสัตว์</Text>
                            <View style={styles.warningBox}>
                                <Text style={styles.warningText}>การส่งคำขอสร้างสถานพยาบาล</Text>
                                <Text style={styles.warningSubText}>เอกสารจะถูกส่งให้ผู้ดูแลระบบตรวจสอบ</Text>
                                <Text style={styles.warningSubText}>และสร้างบัญชีคลินิกให้หลังอนุมัติ</Text>
                            </View>

                            <Text style={styles.inputLabel}>ชื่อสถานพยาบาลสัตว์</Text>
                            <TextInput style={styles.textInputOutline} placeholder="กรอกชื่อสถานพยาบาลสัตว์" value={clinicForm.clinicName} onChangeText={(t) => setClinicForm({ ...clinicForm, clinicName: t })} />

                            <Text style={styles.inputLabel}>เวลาเปิด-ปิด</Text>
                            <TextInput style={styles.textInputOutline} placeholder="กรอกเวลาเปิด-ปิด" value={clinicForm.operatingHours} onChangeText={(t) => setClinicForm({ ...clinicForm, operatingHours: t })} />

                            <Text style={styles.inputLabel}>ที่อยู่</Text>
                            <TextInput style={styles.textInputOutline} placeholder="กรอกที่อยู่" value={clinicForm.addressLine} onChangeText={(t) => setClinicForm({ ...clinicForm, addressLine: t })} />

                            <View style={styles.rowForm}>
                                <View style={{ flex: 1, marginRight: 8 }}><Text style={styles.inputLabel}>ตำบล</Text><TextInput style={styles.textInputOutline} placeholder="กรอกตำบล" value={clinicForm.subdistrict} onChangeText={(t) => setClinicForm({ ...clinicForm, subdistrict: t })} /></View>
                                <View style={{ flex: 1 }}></View>
                            </View>

                            <View style={styles.rowForm}>
                                <View style={{ flex: 1, marginRight: 8 }}><Text style={styles.inputLabel}>อำเภอ</Text><TextInput style={styles.textInputOutline} placeholder="กรอกอำเภอ" value={clinicForm.district} onChangeText={(t) => setClinicForm({ ...clinicForm, district: t })} /></View>
                                <View style={{ flex: 1 }}><Text style={styles.inputLabel}>จังหวัด</Text><TextInput style={styles.textInputOutline} placeholder="กรอกจังหวัด" value={clinicForm.province} onChangeText={(t) => setClinicForm({ ...clinicForm, province: t })} /></View>
                            </View>

                            <View style={styles.rowForm}>
                                <View style={{ flex: 1, marginRight: 8 }}><Text style={styles.inputLabel}>รหัสไปรษณีย์</Text><TextInput style={styles.textInputOutline} placeholder="กรอกรหัสไปรษณีย์" value={clinicForm.postalCode} onChangeText={(t) => setClinicForm({ ...clinicForm, postalCode: t })} /></View>
                                <View style={{ flex: 1 }}></View>
                            </View>

                            <View style={styles.rowForm}>
                                <View style={{ flex: 1, marginRight: 8 }}><Text style={styles.inputLabel}>ละติจูด</Text><TextInput style={styles.textInputOutline} placeholder="กรอกละติจูด" value={clinicForm.latitude} onChangeText={(t) => setClinicForm({ ...clinicForm, latitude: t })} /></View>
                                <View style={{ flex: 1 }}><Text style={styles.inputLabel}>ลองติจูด</Text><TextInput style={styles.textInputOutline} placeholder="กรอกลองติจูด" value={clinicForm.longitude} onChangeText={(t) => setClinicForm({ ...clinicForm, longitude: t })} /></View>
                            </View>

                            <Text style={styles.inputLabel}>ลิ้ง google map</Text>
                            <TextInput style={styles.textInputOutline} placeholder="กรอกลิ้ง google map" value={clinicForm.googleMapUrl} onChangeText={(t) => setClinicForm({ ...clinicForm, googleMapUrl: t })} />

                            <Text style={styles.inputLabel}>ใบอนุญาตให้ตั้งสถานพยาบาลสัตว์(PDF)</Text>
                            <View style={styles.uploadRow}>
                                <TextInput style={[styles.uploadInput, ss3File && { color: '#9C64A6', fontWeight: 'bold' }]} placeholder="ยังไม่ได้เลือกไฟล์" value={ss3File ? ss3File.name : ''} editable={false} />
                                <TouchableOpacity style={styles.uploadBtn} onPress={() => handleSelectFile('ss3')}><Text style={styles.uploadBtnText}>อัปโหลด</Text></TouchableOpacity>
                            </View>

                            <Text style={styles.inputLabel}>ใบอนุญาตดำเนินการสถานพยาบาลสัตว์(PDF)</Text>
                            <View style={styles.uploadRow}>
                                <TextInput style={[styles.uploadInput, ss4File && { color: '#9C64A6', fontWeight: 'bold' }]} placeholder="ยังไม่ได้เลือกไฟล์" value={ss4File ? ss4File.name : ''} editable={false} />
                                <TouchableOpacity style={styles.uploadBtn} onPress={() => handleSelectFile('ss4')}><Text style={styles.uploadBtnText}>อัปโหลด</Text></TouchableOpacity>
                            </View>

                            <Text style={styles.inputLabel}>ใบอนุญาตประกอบวิชาชีพการสัตวแพทย์(PDF)</Text>
                            <View style={styles.uploadRow}>
                                <TextInput style={[styles.uploadInput, clinicVetLicenseFile && { color: '#9C64A6', fontWeight: 'bold' }]} placeholder="ยังไม่ได้เลือกไฟล์" value={clinicVetLicenseFile ? clinicVetLicenseFile.name : ''} editable={false} />
                                <TouchableOpacity style={styles.uploadBtn} onPress={() => handleSelectFile('clinicVetLicense')}><Text style={styles.uploadBtnText}>อัปโหลด</Text></TouchableOpacity>
                            </View>

                            <TouchableOpacity style={styles.submitFormButton} onPress={handleSubmitClinicRequest}>
                                <Text style={styles.submitFormText}>ส่งคำขอ</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            )}

            {/* Modal สมัครเข้าคลินิก */}
            <Modal visible={joinModalVisible} transparent={true} animationType="fade" onRequestClose={() => setJoinModalVisible(false)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <View style={styles.modalHeaderGreen}><Text style={styles.modalHeaderTitle}>สมัครเข้าสถานพยาบาลสัตว์</Text></View>
                        <View style={styles.modalBody}>
                            <Text style={styles.modalLabelCenter}>รหัสผ่านเข้าสถานพยาบาลสัตว์</Text>
                            <TextInput style={styles.modalInputOutline} placeholder="กรอกรหัส" value={joinCodeInput} onChangeText={setJoinCodeInput} textAlign="center" />
                            <View style={styles.modalBtnRow}>
                                <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setJoinModalVisible(false)}><Text style={styles.modalCancelText}>ยกเลิก</Text></TouchableOpacity>
                                <TouchableOpacity style={styles.modalConfirmBtn} onPress={() => { Alert.alert('สำเร็จ', 'ส่งคำขอสมัครเรียบร้อยแล้ว'); setJoinModalVisible(false); }}><Text style={styles.modalConfirmText}>ยืนยัน</Text></TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
    actionBtn: { flex: 0.48, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
    btnGreen: { backgroundColor: '#00C853' },
    btnPurple: { backgroundColor: '#BA8ECA' },
    btnGray: { backgroundColor: '#EAEAEC' },
    actionBtnText: { fontSize: 12, fontWeight: 'bold' },
    textWhite: { color: '#FFFFFF' },
    textGray: { color: '#888888' },
    sectionHeading: { fontSize: 14, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 10 },
    createFormContainer: { paddingBottom: 20 },
    warningBox: { backgroundColor: '#FFF3CD', padding: 12, borderRadius: 8, marginBottom: 16 },
    warningText: { color: '#D97706', fontSize: 13, fontWeight: 'bold', textAlign: 'center' },
    warningSubText: { color: '#D97706', fontSize: 11, textAlign: 'center', marginTop: 2 },
    inputLabel: { fontSize: 12, fontWeight: 'bold', color: '#333', marginTop: 12, marginBottom: 6 },
    textInputOutline: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#D1C4E9', borderRadius: 8, height: 42, paddingHorizontal: 12, fontSize: 13 },
    rowForm: { flexDirection: 'row', justifyContent: 'space-between' },
    uploadRow: { flexDirection: 'row', alignItems: 'center' },
    uploadInput: { flex: 1, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#D1C4E9', borderRightWidth: 0, borderTopLeftRadius: 8, borderBottomLeftRadius: 8, height: 42, paddingHorizontal: 12, fontSize: 13, color: '#888' },
    uploadBtn: { backgroundColor: '#9C64A6', height: 42, paddingHorizontal: 16, justifyContent: 'center', borderTopRightRadius: 8, borderBottomRightRadius: 8 },
    uploadBtnText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
    submitFormButton: { backgroundColor: '#9C64A6', alignSelf: 'flex-end', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 8, marginTop: 24 },
    submitFormText: { color: '#FFF', fontWeight: 'bold', fontSize: 13 },
    successBox: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#E1BEE7', borderRadius: 16, padding: 40, alignItems: 'center', justifyContent: 'center', marginTop: 20 },
    successTitleText: { fontSize: 18, fontWeight: 'bold', color: '#9C64A6', marginBottom: 20 },
    successBtn: { backgroundColor: '#BA8ECA', paddingHorizontal: 30, paddingVertical: 10, borderRadius: 20 },
    successBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },
    fabAddButton: { width: 52, height: 52, borderRadius: 26, backgroundColor: '#00C853', alignItems: 'center', justifyContent: 'center', alignSelf: 'center', marginTop: 20, elevation: 4 },
    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 24 },
    modalBox: { width: '100%', backgroundColor: '#FFF', borderRadius: 16, overflow: 'hidden' },
    modalHeaderGreen: { backgroundColor: '#00C853', paddingVertical: 16, alignItems: 'center' },
    modalHeaderTitle: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
    modalBody: { padding: 24 },
    modalLabelCenter: { fontSize: 14, fontWeight: 'bold', color: '#333', textAlign: 'center', marginBottom: 16 },
    modalInputOutline: { borderWidth: 1, borderColor: '#EAEAEC', borderRadius: 8, height: 46, fontSize: 14, marginBottom: 24 },
    modalBtnRow: { flexDirection: 'row', justifyContent: 'flex-end' },
    modalCancelBtn: { borderWidth: 1, borderColor: '#EAEAEC', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8, marginRight: 12 },
    modalCancelText: { color: '#666', fontWeight: 'bold', fontSize: 14 },
    modalConfirmBtn: { backgroundColor: '#00C853', paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
    modalConfirmText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },

    // 🟢 Styles สำหรับหน้าจอจำกัดสิทธิ์
    restrictedContainer: {
        backgroundColor: '#FFF',
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#FFCDD2',
        padding: 32,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
    },
    restrictedTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#D32F2F',
        marginBottom: 8,
    },
    restrictedDesc: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 22,
    },
    // 🟢 Styles สำหรับการ์ดสถานะเพิ่มเติม
    pendingBox: { flexDirection: 'row', backgroundColor: '#FFF8E1', borderWidth: 1, borderColor: '#FFE082', borderRadius: 12, padding: 20, alignItems: 'center', marginTop: 10 },
    pendingTitle: { color: '#EF6C00', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
    pendingDesc: { color: '#F57C00', fontSize: 12 },
    verifiedBox: { flexDirection: 'row', backgroundColor: '#E8F5E9', borderWidth: 1, borderColor: '#A5D6A7', borderRadius: 12, padding: 20, alignItems: 'center', marginTop: 10 },
    verifiedTitle: { color: '#00C853', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
    verifiedDesc: { color: '#4CAF50', fontSize: 12 },
});
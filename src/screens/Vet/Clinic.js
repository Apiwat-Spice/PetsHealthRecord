import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, Alert, Modal, ScrollView, Image, Linking } from 'react-native';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import ImageView from "react-native-image-viewing";
import { API_URL } from '../../config';

export default function Clinic({ vetProfile, verificationStatus, clinicStatus, setClinicStatus, clinicDetail, clinicSubmittedDocs }) {
    const [clinicSubView, setClinicSubView] = useState('list');
    const [joinModalVisible, setJoinModalVisible] = useState(false);
    const [joinCodeInput, setJoinCodeInput] = useState('');
    const [isSelecting, setIsSelecting] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [fullScreenImage, setFullScreenImage] = useState(null);

    const [clinicForm, setClinicForm] = useState({
        clinicName: '', addressLine: '', subdistrict: '', district: '', province: '', postalCode: '', latitude: '', longitude: '', googleMapUrl: ''
    });

    const [ss3File, setSs3File] = useState(null);
    const [ss4File, setSs4File] = useState(null);
    const [openTime, setOpenTime] = useState(new Date(new Date().setHours(8, 0, 0, 0)));
    const [closeTime, setCloseTime] = useState(new Date(new Date().setHours(20, 0, 0, 0)));
    const [ss3Expiry, setSs3Expiry] = useState(null);
    const [ss4Expiry, setSs4Expiry] = useState(null);
    const [pickerConfig, setPickerConfig] = useState({ visible: false, mode: 'date', target: '' });

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
        if (isSelecting) return;
        try {
            setIsSelecting(true);
            const result = await DocumentPicker.getDocumentAsync({ type: 'application/pdf', copyToCacheDirectory: true });
            if (!result.canceled && result.assets.length > 0) {
                const fileData = result.assets[0];
                if (!fileData.name.toLowerCase().endsWith('.pdf') && fileData.mimeType !== 'application/pdf') {
                    Alert.alert("ไฟล์ไม่ถูกต้อง", "กรุณาอัปโหลดเฉพาะไฟล์ PDF เท่านั้นครับ");
                    return;
                }
                if (docType === 'ss3') setSs3File(fileData);
                else if (docType === 'ss4') setSs4File(fileData);
            }
        } catch (error) {
            Alert.alert("ข้อผิดพลาด", "ไม่สามารถเลือกไฟล์ได้");
        } finally {
            setTimeout(() => setIsSelecting(false), 500);
        }
    };

    const handlePickerChange = (event, selectedValue) => {
        const { target } = pickerConfig;
        setPickerConfig({ ...pickerConfig, visible: false });
        if (event.type === 'set' && selectedValue) {
            if (target === 'openTime') setOpenTime(selectedValue);
            else if (target === 'closeTime') setCloseTime(selectedValue);
            else if (target === 'ss3') setSs3Expiry(selectedValue);
            else if (target === 'ss4') setSs4Expiry(selectedValue);
        }
    };

    //  ตัวแปลงเวลาส่งเข้า Backend
    const formatDbTime = (date) => `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:00`;
    //  ตัวแปลงเวลาโชว์หน้าจอ
    const formatTime = (date) => date.toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' });

    const formatDate = (date) => {
        if (!date) return "ไม่ระบุ";
        const d = new Date(date);
        return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
    };
    const getDbFormattedDate = (date) => {
        if (!date) return null;
        const d = new Date(date);
        return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
    };

    const handleSubmitClinicRequest = async () => {
        if (!clinicForm.clinicName || !clinicForm.addressLine || !ss3File || !ss4File) {
            Alert.alert("แจ้งเตือน", "กรุณากรอกชื่อสถานพยาบาล ที่อยู่ และแนบเอกสารให้ครบถ้วน");
            return;
        }
        if (!ss3Expiry || !ss4Expiry) {
            Alert.alert("แจ้งเตือน", "กรุณาระบุวันที่หมดอายุของเอกสาร SS.3 และ SS.4 ให้ครบถ้วน");
            return;
        }

        try {
            setIsLoading(true);
            const formData = new FormData();
            formData.append('vet_id', String(vetProfile.vet_id || ''));
            formData.append('clinicName', String(clinicForm.clinicName || ''));

            //  ส่งเป็น format HH:MM:SS ให้ Backend
            formData.append('openTime', formatDbTime(openTime));
            formData.append('closeTime', formatDbTime(closeTime));

            formData.append('addressLine', String(clinicForm.addressLine || ''));
            formData.append('subdistrict', String(clinicForm.subdistrict || ''));
            formData.append('district', String(clinicForm.district || ''));
            formData.append('province', String(clinicForm.province || ''));
            formData.append('postalCode', String(clinicForm.postalCode || ''));
            formData.append('latitude', String(clinicForm.latitude || ''));
            formData.append('longitude', String(clinicForm.longitude || ''));
            formData.append('googleMapUrl', String(clinicForm.googleMapUrl || ''));
            formData.append('ss3_license_expired', getDbFormattedDate(ss3Expiry));
            formData.append('ss4_license_expired', getDbFormattedDate(ss4Expiry));

            const ss3Res = await fetch(ss3File.uri);
            const ss3Blob = await ss3Res.blob();
            formData.append('ss3_license_pdf', ss3Blob, ss3File.name || 'ss3_license.pdf');

            const ss4Res = await fetch(ss4File.uri);
            const ss4Blob = await ss4Res.blob();
            formData.append('ss4_license_pdf', ss4Blob, ss4File.name || 'ss4_license.pdf');

            const response = await fetch(`${API_URL}/create-clinic-request`, { method: 'POST', body: formData });
            const responseText = await response.text();
            let result;
            try { result = JSON.parse(responseText); }
            catch (e) {
                Alert.alert('Server Error', 'เซิร์ฟเวอร์ตอบกลับผิดพลาด');
                return;
            }

            if (response.ok) {
                setClinicStatus('pending');
                Alert.alert('สำเร็จ', 'ส่งคำขอสร้างสถานพยาบาลเรียบร้อยแล้ว');
            } else {
                Alert.alert('เกิดข้อผิดพลาด', result.message || 'ไม่สามารถส่งคำขอได้');
            }
        } catch (error) {
            Alert.alert('การเชื่อมต่อขัดข้อง', 'เกิดปัญหาในการแพ็คไฟล์ หรือเซิร์ฟเวอร์ไม่ตอบสนอง');
        } finally {
            setIsLoading(false);
        }
    };

    //  แสดงรายละเอียดทั้งหมด
    const renderSubmittedDocs = () => {
        if (!clinicSubmittedDocs) return null;
        const address = clinicSubmittedDocs.address || {};

        //  ดูตัวแปรที่รับมา เผื่อเช็กความถูกต้อง
        // console.log("clinic_name: ", clinicSubmittedDocs.clinic_name);
        // console.log("operating_hours: ", clinicSubmittedDocs.operating_hours);

        return (
            <View style={styles.submittedInfoContainer}>
                <Text style={styles.inlineSectionHeading}>ข้อมูลเอกสารที่ส่งคำขอ</Text>

                {/* 1. ส่วนใบอนุญาต */}
                <View style={styles.historyItem}>
                    <Text style={styles.historyLabel}>1. ใบอนุญาตให้ตั้งสถานพยาบาลสัตว์ (ส.ส.๓)</Text>
                    <Text style={styles.historySubText}>หมดอายุ: {formatDate(clinicSubmittedDocs.ss3_license_expired)}</Text>
                    {clinicSubmittedDocs.ss3_license_url ? (
                        <TouchableOpacity onPress={() => setFullScreenImage(clinicSubmittedDocs.ss3_license_url)}>
                            <Image source={{ uri: clinicSubmittedDocs.ss3_license_url }} style={styles.previewImage} resizeMode="cover" />
                            <View style={styles.previewOverlay}><Feather name="zoom-in" size={20} color="#FFF" /><Text style={styles.previewText}>ดูรูปเต็ม</Text></View>
                        </TouchableOpacity>
                    ) : <Text style={styles.noDocText}>ไม่พบไฟล์เอกสาร</Text>}
                </View>

                <View style={styles.historyItem}>
                    <Text style={styles.historyLabel}>2. ใบอนุญาตดำเนินการสถานพยาบาลสัตว์ (ส.ส.๔)</Text>
                    <Text style={styles.historySubText}>หมดอายุ: {formatDate(clinicSubmittedDocs.ss4_license_expired)}</Text>
                    {clinicSubmittedDocs.ss4_license_url ? (
                        <TouchableOpacity onPress={() => setFullScreenImage(clinicSubmittedDocs.ss4_license_url)}>
                            <Image source={{ uri: clinicSubmittedDocs.ss4_license_url }} style={styles.previewImage} resizeMode="cover" />
                            <View style={styles.previewOverlay}><Feather name="zoom-in" size={20} color="#FFF" /><Text style={styles.previewText}>ดูรูปเต็ม</Text></View>
                        </TouchableOpacity>
                    ) : <Text style={styles.noDocText}>ไม่พบไฟล์เอกสาร</Text>}
                </View>

                {/* 2. ส่วนข้อมูลคลินิกและที่ตั้ง */}
                <View style={styles.addressCard}>
                    <View style={styles.addressCardHeader}>
                        <MaterialCommunityIcons name="domain" size={20} color="#0055B3" style={{ marginRight: 8 }} />
                        <Text style={styles.addressCardTitle}>ข้อมูลสถานพยาบาล</Text>
                    </View>

                    <View style={styles.addressCardBody}>
                        {/*  ชื่อคลินิก */}
                        <View style={styles.infoRowBlock}>
                            <Text style={styles.infoTitleGray}>ชื่อสถานพยาบาลสัตว์</Text>
                            <Text style={[styles.infoDetailDark, { fontWeight: 'bold', color: '#0055B3' }]}>
                                {clinicSubmittedDocs.clinic_name || '-'}
                            </Text>
                        </View>

                        {/*  เวลาเปิดปิด */}
                        <View style={styles.infoRowBlock}>
                            <Text style={styles.infoTitleGray}>เวลาเปิด-ปิด</Text>
                            <Text style={styles.infoDetailDark}>
                                {clinicSubmittedDocs.operating_hours || '-'}
                            </Text>
                        </View>

                        <View style={styles.infoRowBlock}>
                            <Text style={styles.infoTitleGray}>ที่อยู่ติดต่อ</Text>
                            <Text style={styles.infoDetailDark}>
                                {`${address.address_line || '-'} ต.${address.subdistrict || '-'} อ.${address.district || '-'} จ.${address.province || '-'} ${address.postal_code || '-'}`}
                            </Text>
                        </View>

                        <View style={styles.infoRowBlock}>
                            <Text style={styles.infoTitleGray}>พิกัด (ละติจูด, ลองติจูด)</Text>
                            <Text style={styles.infoDetailDark}>{address.latitude || '-'}, {address.longitude || '-'}</Text>
                        </View>

                        <View style={[styles.infoRowBlock, { borderBottomWidth: 0, paddingBottom: 0 }]}>
                            <Text style={styles.infoTitleGray}>Google Map</Text>
                            {address.google_map_url ? (
                                <TouchableOpacity
                                    style={styles.mapLinkBtn}
                                    onPress={() => Linking.openURL(address.google_map_url).catch(() => Alert.alert("แจ้งเตือน", "ไม่สามารถเปิดลิงก์ได้"))}
                                >
                                    <Feather name="external-link" size={14} color="#0055B3" style={{ marginRight: 6 }} />
                                    <Text style={styles.mapLinkText} numberOfLines={1}>{address.google_map_url}</Text>
                                </TouchableOpacity>
                            ) : (
                                <Text style={styles.infoDetailDark}>-</Text>
                            )}
                        </View>
                    </View>
                </View>
            </View>
        );
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

                    {clinicStatus === 'pass' && (
                        <View>
                            <View style={styles.verifiedBox}>
                                <MaterialCommunityIcons name="domain" size={42} color="#00C853" style={{ marginRight: 16 }} />
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.verifiedTitle}>อนุมัติสถานพยาบาลแล้ว</Text>
                                    <Text style={styles.verifiedDesc}>คำขอสร้างสถานพยาบาลของคุณผ่านการตรวจสอบเรียบร้อยแล้ว</Text>
                                </View>
                            </View>
                            {renderSubmittedDocs()}
                        </View>
                    )}

                    {clinicStatus === 'pending' && (
                        <View>
                            <View style={styles.pendingBox}>
                                <MaterialCommunityIcons name="clock-outline" size={42} color="#EF6C00" style={{ marginRight: 16 }} />
                                <View style={{ flex: 1 }}>
                                    <Text style={styles.pendingTitle}>กำลังตรวจสอบคำขอ...</Text>
                                    <Text style={styles.pendingDesc}>เอกสารคำขอเปิดสถานพยาบาลถูกส่งเข้าระบบแล้ว แอดมินจะทำการตรวจสอบและอนุมัติในภายหลัง</Text>
                                </View>
                            </View>
                            {renderSubmittedDocs()}
                        </View>
                    )}

                    {clinicStatus === 'notpass' && (
                        <View>
                            <View style={[styles.pendingBox, { backgroundColor: '#FFEBEE', borderColor: '#FFCDD2', flexDirection: 'column', alignItems: 'flex-start' }]}>
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <MaterialCommunityIcons name="close-circle-outline" size={42} color="#D32F2F" style={{ marginRight: 16 }} />
                                    <View style={{ flex: 1 }}>
                                        <Text style={[styles.pendingTitle, { color: '#C62828' }]}>คำขอถูกปฏิเสธ</Text>
                                        <Text style={[styles.pendingDesc, { color: '#D32F2F' }]}>ข้อมูลหรือเอกสารสถานพยาบาลของคุณไม่ถูกต้อง กรุณาแก้ไขและส่งใหม่อีกครั้ง</Text>
                                    </View>
                                </View>
                                <View style={styles.detailBox}>
                                    <Text style={styles.detailLabel}>เหตุผลที่ไม่อนุมัติ:</Text>
                                    <Text style={styles.detailText}>{clinicDetail ? clinicDetail : "ไม่ได้ระบุเหตุผล กรุณาติดต่อแอดมิน"}</Text>
                                </View>
                                <TouchableOpacity style={styles.reSubmitBtn} onPress={() => setClinicStatus('unsubmitted')}>
                                    <Text style={{ color: '#FFF', fontWeight: 'bold' }}>กรอกฟอร์มส่งใหม่</Text>
                                </TouchableOpacity>
                            </View>
                            {renderSubmittedDocs()}
                        </View>
                    )}

                    {clinicStatus === 'unsubmitted' && (
                        <View>
                            <Text style={styles.sectionHeading}>ส่งคำขอสร้างสถานพยาบาลสัตว์</Text>
                            <View style={styles.warningBox}>
                                <Text style={styles.warningText}>การส่งคำขอสร้างสถานพยาบาล</Text>
                                <Text style={styles.warningSubText}>เอกสารจะถูกส่งให้ผู้ดูแลระบบตรวจสอบ และสร้างบัญชีคลินิกให้หลังอนุมัติ</Text>
                            </View>

                            <Text style={styles.inputLabel}>ชื่อสถานพยาบาลสัตว์</Text>
                            <TextInput style={styles.textInputOutline} placeholder="กรอกชื่อสถานพยาบาลสัตว์" value={clinicForm.clinicName} onChangeText={(t) => setClinicForm({ ...clinicForm, clinicName: t })} />

                            <Text style={styles.inputLabel}>เวลาเปิด-ปิด</Text>
                            <View style={styles.rowForm}>
                                <TouchableOpacity style={styles.timePickerBtn} onPress={() => setPickerConfig({ visible: true, mode: 'time', target: 'openTime' })}>
                                    <Feather name="clock" size={16} color="#666" style={{ marginRight: 8 }} />
                                    <Text style={styles.timeText}>{formatTime(openTime)}</Text>
                                </TouchableOpacity>
                                <Text style={styles.timeToText}>ถึง</Text>
                                <TouchableOpacity style={styles.timePickerBtn} onPress={() => setPickerConfig({ visible: true, mode: 'time', target: 'closeTime' })}>
                                    <Feather name="clock" size={16} color="#666" style={{ marginRight: 8 }} />
                                    <Text style={styles.timeText}>{formatTime(closeTime)}</Text>
                                </TouchableOpacity>
                            </View>

                            <Text style={styles.inputLabel}>ที่อยู่</Text>
                            <TextInput style={styles.textInputOutline} placeholder="กรอกที่อยู่" value={clinicForm.addressLine} onChangeText={(t) => setClinicForm({ ...clinicForm, addressLine: t })} />

                            <View style={styles.rowForm}>
                                <View style={{ flex: 1, marginRight: 8 }}><Text style={styles.inputLabel}>ตำบล</Text><TextInput style={styles.textInputOutline} placeholder="กรอกตำบล" value={clinicForm.subdistrict} onChangeText={(t) => setClinicForm({ ...clinicForm, subdistrict: t })} /></View>
                                <View style={{ flex: 1 }}><Text style={styles.inputLabel}>อำเภอ</Text><TextInput style={styles.textInputOutline} placeholder="กรอกอำเภอ" value={clinicForm.district} onChangeText={(t) => setClinicForm({ ...clinicForm, district: t })} /></View>
                            </View>

                            <View style={styles.rowForm}>
                                <View style={{ flex: 1, marginRight: 8 }}><Text style={styles.inputLabel}>จังหวัด</Text><TextInput style={styles.textInputOutline} placeholder="กรอกจังหวัด" value={clinicForm.province} onChangeText={(t) => setClinicForm({ ...clinicForm, province: t })} /></View>
                                <View style={{ flex: 1 }}><Text style={styles.inputLabel}>รหัสไปรษณีย์</Text><TextInput style={styles.textInputOutline} placeholder="กรอกรหัสไปรษณีย์" value={clinicForm.postalCode} onChangeText={(t) => setClinicForm({ ...clinicForm, postalCode: t })} /></View>
                            </View>

                            <View style={styles.rowForm}>
                                <View style={{ flex: 1, marginRight: 8 }}><Text style={styles.inputLabel}>ละติจูด</Text><TextInput style={styles.textInputOutline} placeholder="กรอกละติจูด" value={clinicForm.latitude} onChangeText={(t) => setClinicForm({ ...clinicForm, latitude: t })} /></View>
                                <View style={{ flex: 1 }}><Text style={styles.inputLabel}>ลองติจูด</Text><TextInput style={styles.textInputOutline} placeholder="กรอกลองติจูด" value={clinicForm.longitude} onChangeText={(t) => setClinicForm({ ...clinicForm, longitude: t })} /></View>
                            </View>

                            <Text style={styles.inputLabel}>ลิ้ง google map</Text>
                            <TextInput style={styles.textInputOutline} placeholder="กรอกลิ้ง google map" value={clinicForm.googleMapUrl} onChangeText={(t) => setClinicForm({ ...clinicForm, googleMapUrl: t })} />

                            <View style={styles.docSection}>
                                <Text style={styles.inputLabel}>ใบอนุญาตให้ตั้งสถานพยาบาลสัตว์ (ส.ส.๓)</Text>
                                <Text style={styles.subLabel}>วันที่หมดอายุ</Text>
                                <TouchableOpacity style={styles.datePickerBtn} onPress={() => setPickerConfig({ visible: true, mode: 'date', target: 'ss3' })}>
                                    <Feather name="calendar" size={16} color="#666" style={{ marginRight: 8 }} />
                                    <Text style={ss3Expiry ? styles.dateTextSelected : styles.dateTextPlaceholder}>{formatDate(ss3Expiry)}</Text>
                                </TouchableOpacity>
                                <Text style={styles.subLabel}>ไฟล์เอกสาร (PDF)</Text>
                                <View style={styles.uploadRow}>
                                    <TextInput style={[styles.uploadInput, ss3File && { color: '#9C64A6', fontWeight: 'bold' }]} placeholder="ยังไม่ได้เลือกไฟล์" value={ss3File ? ss3File.name : ''} editable={false} />
                                    <TouchableOpacity style={[styles.uploadBtn, { backgroundColor: isSelecting ? '#999' : '#9C64A6' }]} onPress={() => handleSelectFile('ss3')} disabled={isSelecting}>
                                        <Text style={styles.uploadBtnText}>{isSelecting ? 'รอสักครู่...' : 'เลือกไฟล์'}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <View style={styles.docSection}>
                                <Text style={styles.inputLabel}>ใบอนุญาตดำเนินการสถานพยาบาลสัตว์ (ส.ส.๔)</Text>
                                <Text style={styles.subLabel}>วันที่หมดอายุ</Text>
                                <TouchableOpacity style={styles.datePickerBtn} onPress={() => setPickerConfig({ visible: true, mode: 'date', target: 'ss4' })}>
                                    <Feather name="calendar" size={16} color="#666" style={{ marginRight: 8 }} />
                                    <Text style={ss4Expiry ? styles.dateTextSelected : styles.dateTextPlaceholder}>{formatDate(ss4Expiry)}</Text>
                                </TouchableOpacity>
                                <Text style={styles.subLabel}>ไฟล์เอกสาร (PDF)</Text>
                                <View style={styles.uploadRow}>
                                    <TextInput style={[styles.uploadInput, ss4File && { color: '#9C64A6', fontWeight: 'bold' }]} placeholder="ยังไม่ได้เลือกไฟล์" value={ss4File ? ss4File.name : ''} editable={false} />
                                    <TouchableOpacity style={[styles.uploadBtn, { backgroundColor: isSelecting ? '#999' : '#9C64A6' }]} onPress={() => handleSelectFile('ss4')} disabled={isSelecting}>
                                        <Text style={styles.uploadBtnText}>{isSelecting ? 'รอสักครู่...' : 'เลือกไฟล์'}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <TouchableOpacity style={[styles.submitFormButton, { backgroundColor: isLoading ? '#999' : '#9C64A6' }]} onPress={handleSubmitClinicRequest} disabled={isLoading}>
                                <Text style={styles.submitFormText}>{isLoading ? "กำลังอัปโหลดเอกสาร..." : "ส่งคำขอเปิดสถานพยาบาล"}</Text>
                            </TouchableOpacity>
                        </View>
                    )}
                </View>
            )}

            {pickerConfig.visible && (
                <DateTimePicker
                    value={
                        pickerConfig.target === 'openTime' ? openTime :
                            pickerConfig.target === 'closeTime' ? closeTime :
                                pickerConfig.target === 'ss3' ? (ss3Expiry || new Date()) : (ss4Expiry || new Date())
                    }
                    mode={pickerConfig.mode}
                    display="default"
                    minimumDate={pickerConfig.mode === 'date' ? new Date() : undefined}
                    onChange={handlePickerChange}
                />
            )}

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

            <ImageView
                images={fullScreenImage ? [{ uri: fullScreenImage }] : []}
                imageIndex={0}
                visible={!!fullScreenImage}
                onRequestClose={() => setFullScreenImage(null)}
                swipeToCloseEnabled={true}
            />
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
    inputLabel: { fontSize: 13, fontWeight: 'bold', color: '#333', marginTop: 12, marginBottom: 6 },
    subLabel: { fontSize: 12, color: '#555', marginBottom: 6, fontWeight: '500' },
    textInputOutline: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#D1C4E9', borderRadius: 8, height: 42, paddingHorizontal: 12, fontSize: 13 },
    rowForm: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },

    timePickerBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: '#FFF', borderWidth: 1, borderColor: '#D1C4E9', borderRadius: 8, height: 42 },
    timeText: { fontSize: 14, fontWeight: 'bold', color: '#333' },
    timeToText: { marginHorizontal: 10, fontSize: 13, color: '#666', fontWeight: 'bold' },
    datePickerBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF', borderWidth: 1, borderColor: '#D1C4E9', borderRadius: 8, height: 42, paddingHorizontal: 12, marginBottom: 12 },
    dateTextPlaceholder: { color: '#999', fontSize: 13 },
    dateTextSelected: { color: '#333', fontSize: 13, fontWeight: 'bold' },
    docSection: { marginTop: 12, backgroundColor: '#FAFAFA', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: '#F0F0F0' },

    uploadRow: { flexDirection: 'row', alignItems: 'center' },
    uploadInput: { flex: 1, backgroundColor: '#FFF', borderWidth: 1, borderColor: '#D1C4E9', borderRightWidth: 0, borderTopLeftRadius: 8, borderBottomLeftRadius: 8, height: 42, paddingHorizontal: 12, fontSize: 13, color: '#888' },
    uploadBtn: { backgroundColor: '#9C64A6', height: 42, paddingHorizontal: 16, justifyContent: 'center', borderTopRightRadius: 8, borderBottomRightRadius: 8 },
    uploadBtnText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
    submitFormButton: { backgroundColor: '#9C64A6', alignItems: 'center', paddingVertical: 14, borderRadius: 8, marginTop: 24, width: '100%' },
    submitFormText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },

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

    restrictedContainer: { backgroundColor: '#FFF', borderRadius: 12, borderWidth: 1, borderColor: '#FFCDD2', padding: 32, alignItems: 'center', justifyContent: 'center', marginTop: 20 },
    restrictedTitle: { fontSize: 18, fontWeight: 'bold', color: '#D32F2F', marginBottom: 8 },
    restrictedDesc: { fontSize: 14, color: '#666', textAlign: 'center', lineHeight: 22 },

    pendingBox: { flexDirection: 'row', backgroundColor: '#FFF8E1', borderWidth: 1, borderColor: '#FFE082', borderRadius: 12, padding: 20, alignItems: 'center', marginTop: 10 },
    pendingTitle: { color: '#EF6C00', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
    pendingDesc: { color: '#F57C00', fontSize: 12 },
    verifiedBox: { flexDirection: 'row', backgroundColor: '#E8F5E9', borderWidth: 1, borderColor: '#A5D6A7', borderRadius: 12, padding: 20, alignItems: 'center', marginTop: 10 },
    verifiedTitle: { color: '#00C853', fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
    verifiedDesc: { color: '#4CAF50', fontSize: 12 },

    detailBox: { backgroundColor: '#FFF', padding: 12, borderRadius: 8, marginTop: 12, width: '100%', borderWidth: 1, borderColor: '#FFCDD2' },
    detailLabel: { fontSize: 12, fontWeight: 'bold', color: '#C62828', marginBottom: 4 },
    detailText: { fontSize: 13, color: '#333' },
    reSubmitBtn: { marginTop: 16, alignSelf: 'flex-start', paddingHorizontal: 16, paddingVertical: 10, backgroundColor: '#D32F2F', borderRadius: 8 },

    //  Styles สำหรับ Inline Preview (ปรับให้สวยงามขึ้น)
    submittedInfoContainer: { marginTop: 16, padding: 16, backgroundColor: '#FFF', borderRadius: 12, borderWidth: 1, borderColor: '#EAEAEC' },
    inlineSectionHeading: { fontSize: 14, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 16, textAlign: 'center' },
    historyItem: { marginBottom: 20, paddingBottom: 15, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    historyLabel: { fontSize: 13, fontWeight: 'bold', color: '#1A1A1A', marginBottom: 4 },
    historySubText: { fontSize: 12, color: '#666', marginBottom: 10 },
    previewImage: { width: '100%', height: 160, borderRadius: 8, borderWidth: 1, borderColor: '#EAEAEC', backgroundColor: '#F0F0F0' },
    previewOverlay: { position: 'absolute', bottom: 10, right: 10, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, flexDirection: 'row', alignItems: 'center' },
    previewText: { color: '#FFF', fontSize: 12, marginLeft: 6, fontWeight: 'bold' },
    noDocText: { fontSize: 13, color: '#999', fontStyle: 'italic', marginTop: 8 },

    //  Styles สำหรับข้อมูลที่อยู่ (แบบใหม่)
    addressCard: { backgroundColor: '#F8F9FA', borderRadius: 12, borderWidth: 1, borderColor: '#EAEAEC', overflow: 'hidden', marginTop: 10 },
    addressCardHeader: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F0F4F8', paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#EAEAEC' },
    addressCardTitle: { fontSize: 14, fontWeight: 'bold', color: '#0055B3' },
    addressCardBody: { padding: 16 },
    infoRowBlock: { marginBottom: 16, paddingBottom: 12, borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
    infoTitleGray: { fontSize: 12, color: '#888', fontWeight: 'bold', marginBottom: 4 },
    infoDetailDark: { fontSize: 14, color: '#1A1A1A', lineHeight: 22 },
    mapLinkBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#E3F2FD', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, alignSelf: 'flex-start', marginTop: 4, maxWidth: '100%' },
    mapLinkText: { fontSize: 13, color: '#0055B3', fontWeight: 'bold', flexShrink: 1 }
});
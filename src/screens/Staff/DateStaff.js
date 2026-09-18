import React, { useState, useCallback } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, StatusBar, Alert, Modal, ActivityIndicator, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import { useFocusEffect } from '@react-navigation/native';

import { API_URL } from '../../config';

const STATUS_LABELS = { pending: 'รออนุมัติ', confirm: 'อนุมัติแล้ว', cancel: 'ยกเลิกแล้ว', completed: 'เสร็จสิ้น' };
const TYPE_LABELS = { health_check: 'ตรวจสุขภาพ', treatment: 'รักษาโรค', vaccination: 'ฉีดวัคซีน', other: 'อื่นๆ' };

const formatDate = (value) => {
    if (!value) return '-';
    const d = new Date(value);
    if (isNaN(d.getTime())) return String(value);
    return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()}`;
};
const formatTime = (value) => (value ? String(value).slice(0, 5) : '-');

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;

export default function DateStaff() {
    const [staffInfo, setStaffInfo] = useState({ clinicName: 'คลินิกรักษาสัตว์ HappyPet', staffName: 'พนักงาน' });
    const [vetClinicId, setVetClinicId] = useState(null);
    const [clinicStaffId, setClinicStaffId] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(true);

    const [activeFilter, setActiveFilter] = useState('all');

    const [appointments, setAppointments] = useState([]);
    const [loadingAppts, setLoadingAppts] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const [vetsList, setVetsList] = useState([]);

    const [selectedVetMap, setSelectedVetMap] = useState({});
    const [openVetMenuFor, setOpenVetMenuFor] = useState(null);
    const [actionLoadingId, setActionLoadingId] = useState(null);

    const [rescheduleTarget, setRescheduleTarget] = useState(null);
    const [rescheduleDate, setRescheduleDate] = useState('');
    const [rescheduleTime, setRescheduleTime] = useState('');
    const [reschedSubmitting, setReschedSubmitting] = useState(false);

    const loadVets = useCallback(async (clinicId) => {
        try {
            const res = await fetch(`${API_URL}/clinic-vets/${clinicId}`);
            const data = await res.json();
            if (res.ok) setVetsList(data.vets || []);
        } catch (error) {
            console.log('โหลดรายชื่อหมอไม่สำเร็จ:', error.message);
        }
    }, []);

    const loadAppointments = useCallback(async (clinicId) => {
        setLoadingAppts(true);
        try {
            const res = await fetch(`${API_URL}/clinic-appointments/${clinicId}`);
            const data = await res.json();
            setLoadingAppts(false);
            if (res.ok) setAppointments(data.appointments || []);
        } catch (error) {
            setLoadingAppts(false);
            console.log('โหลดนัดหมายไม่สำเร็จ:', error.message);
        }
    }, []);

    // ===== โหลดโปรไฟล์พนักงาน (มี vet_clinic_id ติดมาด้วยอยู่แล้ว ไม่ต้องยิงซ้ำ) =====
    const loadStaffProfile = useCallback(async () => {
        setLoadingProfile(true);
        try {
            const profileStr = await SecureStore.getItemAsync('clinic_staff_profile');
            if (!profileStr) { setLoadingProfile(false); return; }
            const profile = JSON.parse(profileStr);

            setStaffInfo((prev) => ({ ...prev, staffName: `${profile.firstname || ''} ${profile.lastname || ''}`.trim() || 'พนักงาน' }));
            setClinicStaffId(profile.clinic_staff_permission_id || null);
            setLoadingProfile(false);

            if (profile.vet_clinic_id) {
                setVetClinicId(profile.vet_clinic_id);
                loadVets(profile.vet_clinic_id);
                loadAppointments(profile.vet_clinic_id);
            }
        } catch (error) {
            setLoadingProfile(false);
            console.log('โหลดโปรไฟล์พนักงานไม่สำเร็จ:', error.message);
        }
    }, [loadVets, loadAppointments]);

    useFocusEffect(useCallback(() => { loadStaffProfile(); }, [loadStaffProfile]));

    const onRefresh = async () => {
        setRefreshing(true);
        if (vetClinicId) {
            await Promise.all([loadVets(vetClinicId), loadAppointments(vetClinicId)]);
        } else {
            await loadStaffProfile();
        }
        setRefreshing(false);
    };

    const counts = {
        all: appointments.length,
        pending: appointments.filter((a) => a.status === 'pending').length,
        confirm: appointments.filter((a) => a.status === 'confirm').length,
        completed: appointments.filter((a) => a.status === 'completed').length,
        cancel: appointments.filter((a) => a.status === 'cancel').length,
    };
    const filters = [
        { id: 'all', label: `ทั้งหมด(${counts.all})` },
        { id: 'pending', label: `รออนุมัติ(${counts.pending})` },
        { id: 'confirm', label: `อนุมัติแล้ว(${counts.confirm})` },
        { id: 'completed', label: `เสร็จสิ้น(${counts.completed})` },
        { id: 'cancel', label: `ยกเลิก(${counts.cancel})` },
    ];
    const visibleAppointments = activeFilter === 'all' ? appointments : appointments.filter((a) => a.status === activeFilter);

    const patchAppointment = async (appointmentId, path, body) => {
        setActionLoadingId(appointmentId);
        try {
            const res = await fetch(`${API_URL}/appointment/${appointmentId}/${path}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            const result = await res.json();
            setActionLoadingId(null);
            if (!res.ok) {
                Alert.alert('ผิดพลาด', result.message || 'ดำเนินการไม่สำเร็จ');
                return false;
            }
            loadAppointments(vetClinicId);
            return true;
        } catch (error) {
            setActionLoadingId(null);
            Alert.alert('เชื่อมต่อไม่สำเร็จ', 'ไม่สามารถติดต่อเซิร์ฟเวอร์ได้');
            return false;
        }
    };

    const handleApprove = (appt) => {
        const chosenVet = selectedVetMap[appt.appointment_id] ?? appt.vet_id ?? null;
        patchAppointment(appt.appointment_id, 'status', { status: 'confirm', vet_id: chosenVet, clinic_staff: clinicStaffId });
    };

    const handleReject = (appt) => {
        Alert.alert('ยืนยัน', 'ต้องการปฏิเสธนัดหมายนี้หรือไม่?', [
            { text: 'ยกเลิก', style: 'cancel' },
            { text: 'ปฏิเสธ', style: 'destructive', onPress: () => patchAppointment(appt.appointment_id, 'status', { status: 'cancel', clinic_staff: clinicStaffId }) },
        ]);
    };

    const handleCancel = (appt) => {
        Alert.alert('ยืนยัน', 'ต้องการยกเลิกนัดหมายนี้หรือไม่?', [
            { text: 'ปิด', style: 'cancel' },
            { text: 'ยกเลิกนัด', style: 'destructive', onPress: () => patchAppointment(appt.appointment_id, 'status', { status: 'cancel', clinic_staff: clinicStaffId }) },
        ]);
    };

    const handleComplete = (appt) => {
        patchAppointment(appt.appointment_id, 'status', { status: 'completed', clinic_staff: clinicStaffId });
    };

    const selectVetForPending = (apptId, vetId) => {
        setSelectedVetMap((prev) => ({ ...prev, [apptId]: vetId }));
        setOpenVetMenuFor(null);
    };

    const selectVetForConfirmed = async (appt, vetId) => {
        setOpenVetMenuFor(null);
        await patchAppointment(appt.appointment_id, 'assign-vet', { vet_id: vetId });
    };

    const openReschedule = (appt) => {
        setRescheduleTarget(appt);
        setRescheduleDate(appt.appointment_date || '');
        setRescheduleTime(formatTime(appt.appointment_time) !== '-' ? formatTime(appt.appointment_time) : '');
    };

    const submitReschedule = async () => {
        if (!DATE_RE.test(rescheduleDate.trim())) {
            Alert.alert('แจ้งเตือน', 'กรุณากรอกวันที่ในรูปแบบ YYYY-MM-DD เช่น 2026-05-17');
            return;
        }
        if (!TIME_RE.test(rescheduleTime.trim())) {
            Alert.alert('แจ้งเตือน', 'กรุณากรอกเวลาในรูปแบบ HH:MM เช่น 10:00');
            return;
        }
        setReschedSubmitting(true);
        const ok = await (async () => {
            try {
                const res = await fetch(`${API_URL}/appointment/${rescheduleTarget.appointment_id}/reschedule`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ appointment_date: rescheduleDate.trim(), appointment_time: `${rescheduleTime.trim()}:00` }),
                });
                const result = await res.json();
                if (!res.ok) {
                    Alert.alert('ผิดพลาด', result.message || 'เลื่อนนัดไม่สำเร็จ');
                    return false;
                }
                return true;
            } catch (error) {
                Alert.alert('เชื่อมต่อไม่สำเร็จ', 'ไม่สามารถติดต่อเซิร์ฟเวอร์ได้');
                return false;
            }
        })();
        setReschedSubmitting(false);
        if (ok) {
            setRescheduleTarget(null);
            loadAppointments(vetClinicId);
        }
    };

    const renderVetPicker = (appt, mode) => {
        const isOpen = openVetMenuFor === appt.appointment_id;
        const currentVetId = mode === 'pending' ? (selectedVetMap[appt.appointment_id] ?? appt.vet_id) : appt.vet_id;
        const currentVet = vetsList.find((v) => v.vet_id === currentVetId);
        const currentLabel = currentVet ? `น.สพ. ${currentVet.firstname} ${currentVet.lastname}` : '--ยังไม่ระบุ--';

        return (
            <View>
                <Text style={styles.assignLabel}>{mode === 'pending' ? 'มอบหมายให้สัตวแพทย์ (ไม่บังคับ)' : 'สัตวแพทย์ผู้รับผิดชอบ'}</Text>
                <TouchableOpacity
                    style={styles.assignDropdown}
                    onPress={() => setOpenVetMenuFor(isOpen ? null : appt.appointment_id)}
                    activeOpacity={0.7}
                >
                    <Text style={styles.assignDropdownText}>{currentLabel}</Text>
                    <Feather name={isOpen ? 'chevron-up' : 'chevron-down'} size={18} color="#FF6B00" />
                </TouchableOpacity>
                {isOpen && (
                    <View style={styles.vetMenu}>
                        {vetsList.length === 0 ? (
                            <Text style={styles.vetMenuEmpty}>ไม่พบสัตวแพทย์ในคลินิก</Text>
                        ) : (
                            vetsList.map((v) => (
                                <TouchableOpacity
                                    key={v.vet_id}
                                    style={styles.vetMenuItem}
                                    onPress={() => mode === 'pending' ? selectVetForPending(appt.appointment_id, v.vet_id) : selectVetForConfirmed(appt, v.vet_id)}
                                >
                                    <Text style={[styles.vetMenuItemText, currentVetId === v.vet_id && styles.vetMenuItemTextActive]}>
                                        น.สพ. {v.firstname} {v.lastname}{v.vet_class ? ` (ชั้น ${v.vet_class})` : ''}
                                    </Text>
                                    {currentVetId === v.vet_id && <Feather name="check" size={16} color="#2F80ED" />}
                                </TouchableOpacity>
                            ))
                        )}
                    </View>
                )}
            </View>
        );
    };

    const renderCard = (appt) => {
        const busy = actionLoadingId === appt.appointment_id;
        const typeLabel = TYPE_LABELS[appt.type] || appt.type;
        const cardColor = appt.status === 'confirm' ? styles.cardBlue
            : appt.status === 'completed' ? styles.cardGreen
                : appt.status === 'cancel' ? styles.cardGray
                    : styles.cardOrange;
        const titleColor = appt.status === 'confirm' ? styles.cardTitleBlue
            : appt.status === 'completed' ? styles.cardTitleGreen
                : appt.status === 'cancel' ? styles.cardTitleGray
                    : styles.cardTitleOrange;
        const badgeStyle = appt.status === 'confirm' ? styles.badgeBlue
            : appt.status === 'completed' ? styles.badgeGreen
                : appt.status === 'cancel' ? styles.badgeGray
                    : styles.badgeOrange;
        const badgeTextStyle = appt.status === 'confirm' ? styles.badgeBlueText
            : appt.status === 'completed' ? styles.badgeGreenText
                : appt.status === 'cancel' ? styles.badgeGrayText
                    : styles.badgeOrangeText;

        return (
            <View key={appt.appointment_id} style={[styles.cardBase, cardColor]}>
                <View style={styles.cardHeaderRow}>
                    <Text style={[styles.cardTitleBase, titleColor]}>{appt.title || typeLabel}</Text>
                    <View style={badgeStyle}><Text style={badgeTextStyle}>{STATUS_LABELS[appt.status] || appt.status}</Text></View>
                </View>

                <Text style={styles.petDetailText}><Text style={{ fontWeight: 'bold' }}>{appt.pet_name}</Text> - {formatDate(appt.appointment_date)} เวลา {formatTime(appt.appointment_time)} น.</Text>
                <Text style={styles.petDetailText}><Text style={{ fontWeight: 'bold' }}>เจ้าของ :</Text> {appt.owner_name}</Text>
                <Text style={styles.petDetailText}><Text style={{ fontWeight: 'bold' }}>ประเภท :</Text> {typeLabel}</Text>
                {appt.detail ? <Text style={styles.petDetailText}>{appt.detail}</Text> : null}

                {appt.status === 'pending' && renderVetPicker(appt, 'pending')}
                {appt.status === 'confirm' && renderVetPicker(appt, 'confirm')}
                {(appt.status === 'completed' || appt.status === 'cancel') && (
                    <Text style={[styles.petDetailText, { color: '#2F80ED', fontWeight: 'bold' }]}>
                        หมอ : {appt.vet_name || '-'}
                    </Text>
                )}

                {busy ? (
                    <ActivityIndicator size="small" color="#2F80ED" style={{ marginTop: 16 }} />
                ) : (
                    <>
                        {appt.status === 'pending' && (
                            <View style={styles.cardActionRow}>
                                <TouchableOpacity style={styles.btnSolidGreen} onPress={() => handleApprove(appt)}>
                                    <Text style={styles.btnSolidGreenText}>อนุมัติ</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.btnOutlineRed} onPress={() => handleReject(appt)}>
                                    <Text style={styles.btnOutlineRedText}>ปฏิเสธ</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {appt.status === 'confirm' && (
                            <View style={styles.cardActionRow}>
                                <TouchableOpacity style={styles.btnSolidBlue} onPress={() => handleComplete(appt)}>
                                    <Text style={styles.btnSolidBlueText}>เสร็จสิ้นการรักษา</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {(appt.status === 'pending' || appt.status === 'confirm') && (
                            <TouchableOpacity style={styles.rescheduleBtn} onPress={() => openReschedule(appt)}>
                                <Feather name="clock" size={14} color="#1565C0" style={{ marginRight: 6 }} />
                                <Text style={styles.rescheduleBtnText}>เลื่อนนัด</Text>
                            </TouchableOpacity>
                        )}
                    </>
                )}
            </View>
        );
    };

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
                <ScrollView
                    style={styles.scrollView}
                    showsVerticalScrollIndicator={false}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#2F80ED']} />}
                >
                    <View style={styles.contentPadding}>
                        <Text style={styles.mainTitle}>นัดหมาย</Text>

                        <View style={{ marginBottom: 20 }}>
                            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                                {filters.map((f) => (
                                    <TouchableOpacity
                                        key={f.id}
                                        style={[styles.filterPill, activeFilter === f.id ? styles.filterPillActive : styles.filterPillInactive]}
                                        onPress={() => setActiveFilter(f.id)}
                                    >
                                        <Text style={[styles.filterText, activeFilter === f.id ? styles.filterTextActive : styles.filterTextInactive]}>{f.label}</Text>
                                    </TouchableOpacity>
                                ))}
                            </ScrollView>
                        </View>

                        {loadingProfile || loadingAppts ? (
                            <ActivityIndicator size="large" color="#2F80ED" style={{ marginTop: 30 }} />
                        ) : !vetClinicId ? (
                            <View style={styles.emptyBox}>
                                <MaterialCommunityIcons name="domain-off" size={40} color="#BBDEFB" />
                                <Text style={styles.emptyText}>ยังไม่พบข้อมูลคลินิกของคุณ</Text>
                            </View>
                        ) : visibleAppointments.length === 0 ? (
                            <View style={styles.emptyBox}>
                                <Feather name="calendar" size={40} color="#BBDEFB" />
                                <Text style={styles.emptyText}>ไม่มีนัดหมายในหมวดนี้</Text>
                            </View>
                        ) : (
                            visibleAppointments.map(renderCard)
                        )}

                        <View style={{ height: 20 }} />
                    </View>
                </ScrollView>
            </View>

            {/* Modal เลื่อนนัด */}
            <Modal visible={!!rescheduleTarget} transparent animationType="fade" onRequestClose={() => setRescheduleTarget(null)}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalBox}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>เลื่อนนัดหมาย</Text>
                            <TouchableOpacity onPress={() => setRescheduleTarget(null)}>
                                <Feather name="x" size={22} color="#888" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.inputLabel}>วันที่ใหม่ (YYYY-MM-DD)</Text>
                        <TextInput style={styles.textInputOutline} placeholder="2026-05-17" value={rescheduleDate} onChangeText={setRescheduleDate} />

                        <Text style={styles.inputLabel}>เวลาใหม่ (HH:MM)</Text>
                        <TextInput style={styles.textInputOutline} placeholder="10:00" value={rescheduleTime} onChangeText={setRescheduleTime} />

                        <TouchableOpacity
                            style={[styles.blueSubmitBtn, reschedSubmitting && { opacity: 0.7 }]}
                            onPress={submitReschedule}
                            disabled={reschedSubmitting}
                        >
                            {reschedSubmitting ? <ActivityIndicator color="#FFF" /> : <Text style={styles.blueSubmitText}>บันทึกวันเวลาใหม่</Text>}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

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
    mainTitle: { fontSize: 22, fontWeight: 'bold', color: '#2F80ED', marginBottom: 16 },

    filterPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginRight: 10, borderWidth: 1 },
    filterPillActive: { backgroundColor: '#2F80ED', borderColor: '#2F80ED' },
    filterPillInactive: { backgroundColor: '#FFFFFF', borderColor: '#EAEAEC' },
    filterText: { fontSize: 13, fontWeight: 'bold' },
    filterTextActive: { color: '#FFFFFF' },
    filterTextInactive: { color: '#888888' },

    emptyBox: { alignItems: 'center', paddingVertical: 40 },
    emptyText: { fontSize: 13, color: '#7FA8D9', fontWeight: '600', marginTop: 10 },

    cardHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
    petDetailText: { fontSize: 13, color: '#333', marginBottom: 6 },
    cardActionRow: { flexDirection: 'row', marginTop: 16 },

    cardBase: { backgroundColor: '#FFFFFF', borderWidth: 1.5, borderRadius: 16, padding: 16, marginBottom: 16, elevation: 1 },
    cardTitleBase: { fontSize: 16, fontWeight: 'bold', flex: 1, marginRight: 8 },

    cardBlue: { borderColor: '#2F80ED' },
    cardTitleBlue: { color: '#2F80ED' },
    badgeBlue: { backgroundColor: '#E3F2FD', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    badgeBlueText: { color: '#2F80ED', fontSize: 10, fontWeight: 'bold' },
    btnSolidBlue: { flex: 1, backgroundColor: '#1976D2', borderRadius: 8, alignItems: 'center', justifyContent: 'center', paddingVertical: 12 },
    btnSolidBlueText: { color: '#FFFFFF', fontSize: 13, fontWeight: 'bold' },

    cardOrange: { borderColor: '#FF9800' },
    cardTitleOrange: { color: '#FF6B00' },
    badgeOrange: { backgroundColor: '#FFF3E0', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    badgeOrangeText: { color: '#FF6B00', fontSize: 10, fontWeight: 'bold' },

    cardGreen: { borderColor: '#00C853' },
    cardTitleGreen: { color: '#00A34A' },
    badgeGreen: { backgroundColor: '#E8F5E9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    badgeGreenText: { color: '#00A34A', fontSize: 10, fontWeight: 'bold' },

    cardGray: { borderColor: '#BDBDBD' },
    cardTitleGray: { color: '#757575' },
    badgeGray: { backgroundColor: '#F0F0F0', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    badgeGrayText: { color: '#757575', fontSize: 10, fontWeight: 'bold' },

    assignLabel: { fontSize: 12, color: '#888', marginTop: 10, marginBottom: 6 },
    assignDropdown: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#FF9800', borderRadius: 8, paddingHorizontal: 12, height: 40 },
    assignDropdownText: { fontSize: 13, color: '#333' },
    vetMenu: { borderWidth: 1, borderColor: '#FF9800', borderRadius: 8, marginTop: 6, overflow: 'hidden' },
    vetMenuItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
    vetMenuItemText: { fontSize: 13, color: '#333', flex: 1, marginRight: 8 },
    vetMenuItemTextActive: { color: '#2F80ED', fontWeight: 'bold' },
    vetMenuEmpty: { padding: 12, fontSize: 12, color: '#999' },

    btnSolidGreen: { flex: 1, backgroundColor: '#00C853', borderRadius: 8, alignItems: 'center', justifyContent: 'center', paddingVertical: 12, marginRight: 8 },
    btnSolidGreenText: { color: '#FFFFFF', fontSize: 14, fontWeight: 'bold' },
    btnOutlineRed: { flex: 1, backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#FF3B30', borderRadius: 8, alignItems: 'center', justifyContent: 'center', paddingVertical: 12 },
    btnOutlineRedText: { color: '#FF3B30', fontSize: 14, fontWeight: 'bold' },

    rescheduleBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 12, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: '#BBDEFB', backgroundColor: '#F0F8FF' },
    rescheduleBtnText: { color: '#1565C0', fontSize: 13, fontWeight: 'bold' },

    modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
    modalBox: { width: '100%', backgroundColor: '#FFF', borderRadius: 16, padding: 20 },
    modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    modalTitle: { fontSize: 16, fontWeight: 'bold', color: '#2F80ED' },
    inputLabel: { fontSize: 12, fontWeight: 'bold', color: '#333', marginTop: 10, marginBottom: 6 },
    textInputOutline: { borderWidth: 1, borderColor: '#D1D1D1', borderRadius: 8, height: 42, paddingHorizontal: 12, fontSize: 14 },
    blueSubmitBtn: { backgroundColor: '#2F80ED', paddingVertical: 14, borderRadius: 8, alignItems: 'center', marginTop: 20 },
    blueSubmitText: { color: '#FFFFFF', fontSize: 15, fontWeight: 'bold' },
});
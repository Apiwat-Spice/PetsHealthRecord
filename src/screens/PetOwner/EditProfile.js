import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert, Image, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import * as SecureStore from 'expo-secure-store';
import * as ImagePicker from 'expo-image-picker';
import { API_URL } from '../../config';

export default function EditProfile({ navigation }) {
    const [isLoading, setIsLoading] = useState(false);
    const [userEmail, setUserEmail] = useState('');
    const [formData, setFormData] = useState({
        id: '',
        username: '',
        first_name: '',
        last_name: '',
        gender: '',
        phone: '',
        address_line: '',
        subdistrict: '',
        district: '',
        province: '',
        postal_code: '',
        profile_image_url: '',
        profile_image_public_id: ''
    });
    const [imageBase64, setImageBase64] = useState(null);

    useEffect(() => {
        const loadData = async () => {
            const userStr = await SecureStore.getItemAsync("user");
            const profileStr = await SecureStore.getItemAsync("pet_owners");

            if (userStr) setUserEmail(JSON.parse(userStr).email);

            if (profileStr) {
                const profile = JSON.parse(profileStr);
                setFormData({
                    id: profile.pet_owner_id,
                    username: profile.username || '',
                    first_name: profile.first_name || '',
                    last_name: profile.last_name || '',
                    gender: profile.gender || '',
                    phone: profile.phone || '',
                    address_line: profile.address_line || '',
                    subdistrict: profile.subdistrict || '',
                    district: profile.district || '',
                    province: profile.province || '',
                    postal_code: profile.postal_code || '',
                    profile_image_url: profile.profile_image_url || '',
                    profile_image_public_id: profile.profile_image_public_id || ''
                });
            }
        };
        loadData();
    }, []);

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
            base64: true,
        });

        if (!result.canceled) {
            setFormData({ ...formData, profile_image_url: result.assets[0].uri });
            setImageBase64(result.assets[0].base64);
        }
    };

    const uploadToCloudinary = async (base64) => {
        try {
            const dataUrl = `data:image/jpeg;base64,${base64}`;
            const response = await fetch('https://api.cloudinary.com/v1_1/dedkhhsja/image/upload/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    file: dataUrl,
                    upload_preset: 'pet_app_preset',
                    folder: 'Profile'
                }),
            });
            const result = await response.json();
            return result.secure_url ? { url: result.secure_url, publicId: result.public_id } : null;
        } catch (error) {
            return null;
        }
    };

    const handleSave = async () => {
        if (!formData.first_name || !formData.last_name) {
            return Alert.alert('แจ้งเตือน', 'กรุณากรอกชื่อและนามสกุล');
        }

        setIsLoading(true);
        try {
            let finalUrl = formData.profile_image_url;
            let finalPublicId = formData.profile_image_public_id;

            if (imageBase64) {
                const cloudRes = await uploadToCloudinary(imageBase64);
                if (cloudRes) {
                    finalUrl = cloudRes.url;
                    finalPublicId = cloudRes.publicId;
                }
            }

            const payload = {
                username: formData.username,
                first_name: formData.first_name,
                last_name: formData.last_name,
                gender: formData.gender,
                phone: formData.phone,
                address_line: formData.address_line,
                subdistrict: formData.subdistrict,
                district: formData.district,
                province: formData.province,
                postal_code: formData.postal_code,
                profile_image_url: finalUrl,
                profile_image_public_id: finalPublicId
            };

            const response = await fetch(`${API_URL}/profile/petowner/${formData.id}`, {
                method: 'PUT',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (response.ok) {
                await SecureStore.setItemAsync("pet_owners", JSON.stringify(result.profile));
                Alert.alert('สำเร็จ', 'อัปเดตโปรไฟล์เรียบร้อยแล้ว', [{ text: 'ตกลง', onPress: () => navigation.goBack() }]);
            } else {
                Alert.alert('เกิดข้อผิดพลาด', result.message || 'ไม่สามารถอัปเดตข้อมูลได้');
            }
        } catch (error) {
            Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top']}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
                    <Feather name="arrow-left" size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>แก้ไขโปรไฟล์</Text>
                <View style={{ width: 24 }} />
            </View>

            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

                    <View style={styles.card}>
                        {/* Avatar */}
                        <View style={styles.avatarWrapper}>
                            <TouchableOpacity style={styles.avatarContainer} onPress={pickImage} activeOpacity={0.85}>
                                {formData.profile_image_url ? (
                                    <Image source={{ uri: formData.profile_image_url }} style={styles.avatarImage} />
                                ) : (
                                    <Feather name="user" size={44} color="#96B9D7" />
                                )}
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.editIconBadge} onPress={pickImage} activeOpacity={0.85}>
                                <Feather name="camera" size={13} color="#FFF" />
                            </TouchableOpacity>
                        </View>

                        <Text style={styles.nameHeader}>
                            {formData.first_name || formData.last_name ? `${formData.first_name} ${formData.last_name}` : 'ระบุชื่อ-นามสกุล'}
                        </Text>
                        <Text style={styles.emailHeader}>{userEmail || 'ไม่มีข้อมูลอีเมล'}</Text>

                        {/* 1. ส่วนข้อมูลส่วนตัว */}
                        <View style={styles.formSection}>
                            <Text style={styles.sectionTitle}>ข้อมูลส่วนตัว</Text>

                            <Text style={styles.label}>ชื่อผู้ใช้ (Username)</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.username}
                                onChangeText={(text) => setFormData({ ...formData, username: text })}
                                placeholder="ตั้งชื่อผู้ใช้ของคุณ"
                                placeholderTextColor="#94A3B8"
                            />

                            <Text style={styles.label}>ชื่อจริง (First Name) *</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.first_name}
                                onChangeText={(text) => setFormData({ ...formData, first_name: text })}
                                placeholder="ชื่อจริง"
                                placeholderTextColor="#94A3B8"
                            />

                            <Text style={styles.label}>นามสกุล (Last Name) *</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.last_name}
                                onChangeText={(text) => setFormData({ ...formData, last_name: text })}
                                placeholder="นามสกุล"
                                placeholderTextColor="#94A3B8"
                            />

                            <Text style={styles.label}>เบอร์โทรศัพท์</Text>
                            <TextInput
                                style={styles.input}
                                value={formData.phone}
                                onChangeText={(text) => setFormData({ ...formData, phone: text })}
                                placeholder="08X-XXX-XXXX"
                                keyboardType="phone-pad"
                                placeholderTextColor="#94A3B8"
                            />

                            <Text style={styles.label}>เพศ</Text>
                            <View style={styles.genderRow}>
                                {[
                                    { key: 'male', label: 'ชาย' },
                                    { key: 'female', label: 'หญิง' },
                                    { key: 'other', label: 'อื่นๆ' },
                                    { key: 'prefer_not_to_say', label: 'ไม่ระบุ' }
                                ].map((item) => {
                                    const isActive = formData.gender === item.key;
                                    return (
                                        <TouchableOpacity
                                            key={item.key}
                                            style={[styles.genderBtn, isActive && styles.genderBtnActive]}
                                            onPress={() => setFormData({ ...formData, gender: item.key })}
                                            activeOpacity={0.8}
                                        >
                                            <Text style={[styles.genderText, isActive && styles.genderTextActive]}>
                                                {item.label}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        </View>

                        {/* 2. ส่วนข้อมูลที่อยู่ */}
                        <View style={styles.formSection}>
                            <Text style={styles.sectionTitle}>ข้อมูลที่อยู่</Text>

                            <Text style={styles.label}>บ้านเลขที่ / ถนน / อาคาร</Text>
                            <TextInput
                                style={[styles.input, { height: 70, textAlignVertical: 'top', paddingTop: 10 }]}
                                value={formData.address_line}
                                onChangeText={(text) => setFormData({ ...formData, address_line: text })}
                                placeholder="เช่น 123/45 ซอย 5 ถนนแจ้งวัฒนะ"
                                multiline
                                placeholderTextColor="#94A3B8"
                            />

                            <View style={styles.rowTwoCol}>
                                <View style={{ flex: 1, marginRight: 6 }}>
                                    <Text style={styles.label}>ตำบล / แขวง</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={formData.subdistrict}
                                        onChangeText={(text) => setFormData({ ...formData, subdistrict: text })}
                                        placeholder="ตำบล/แขวง"
                                        placeholderTextColor="#94A3B8"
                                    />
                                </View>

                                <View style={{ flex: 1, marginLeft: 6 }}>
                                    <Text style={styles.label}>อำเภอ / เขต</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={formData.district}
                                        onChangeText={(text) => setFormData({ ...formData, district: text })}
                                        placeholder="อำเภอ/เขต"
                                        placeholderTextColor="#94A3B8"
                                    />
                                </View>
                            </View>

                            <View style={styles.rowTwoCol}>
                                <View style={{ flex: 1, marginRight: 6 }}>
                                    <Text style={styles.label}>จังหวัด</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={formData.province}
                                        onChangeText={(text) => setFormData({ ...formData, province: text })}
                                        placeholder="จังหวัด"
                                        placeholderTextColor="#94A3B8"
                                    />
                                </View>

                                <View style={{ flex: 1, marginLeft: 6 }}>
                                    <Text style={styles.label}>รหัสไปรษณีย์</Text>
                                    <TextInput
                                        style={styles.input}
                                        value={formData.postal_code}
                                        onChangeText={(text) => setFormData({ ...formData, postal_code: text })}
                                        placeholder="10XXX"
                                        keyboardType="number-pad"
                                        placeholderTextColor="#94A3B8"
                                    />
                                </View>
                            </View>
                        </View>

                        {/* ปุ่มบันทึก / ยกเลิก */}
                        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={isLoading} activeOpacity={0.85}>
                            {isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveBtnText}>บันทึกข้อมูล</Text>}
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()} disabled={isLoading} activeOpacity={0.85}>
                            <Text style={styles.cancelBtnText}>ยกเลิก</Text>
                        </TouchableOpacity>

                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#F4F8FB' },
    header: {
        backgroundColor: '#20435C',
        paddingHorizontal: 16,
        paddingVertical: 14,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFF' },
    backBtn: { padding: 4 },
    scrollContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 40 },

    card: {
        backgroundColor: '#FFF',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E2EBF2',
    },
    avatarWrapper: { position: 'relative', marginBottom: 12 },
    avatarContainer: {
        width: 90,
        height: 90,
        borderRadius: 45,
        borderWidth: 3,
        borderColor: '#96B9D7',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F0F5FA',
        overflow: 'hidden',
    },
    avatarImage: { width: '100%', height: '100%' },
    editIconBadge: {
        position: 'absolute',
        right: 0,
        bottom: 0,
        backgroundColor: '#2C4A6F',
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#FFF',
    },
    nameHeader: { fontSize: 18, fontWeight: 'bold', color: '#1E3A5F' },
    emailHeader: { fontSize: 13, color: '#64748B', marginBottom: 16 },

    formSection: { width: '100%', marginBottom: 16 },
    sectionTitle: { fontSize: 14, fontWeight: 'bold', color: '#1E3A5F', marginBottom: 6, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', paddingBottom: 6 },
    label: { fontSize: 13, fontWeight: 'bold', color: '#1E3A5F', marginBottom: 6, marginTop: 10 },
    input: {
        width: '100%',
        height: 46,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 10,
        paddingHorizontal: 14,
        fontSize: 14,
        color: '#1E293B',
        backgroundColor: '#F8FAFC',
    },
    rowTwoCol: { flexDirection: 'row', justifyContent: 'space-between' },

    genderRow: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', marginTop: 4 },
    genderBtn: {
        width: '23%',
        height: 40,
        borderWidth: 1,
        borderColor: '#E2E8F0',
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8FAFC',
    },
    genderBtnActive: { backgroundColor: '#2C4A6F', borderColor: '#2C4A6F' },
    genderText: { fontSize: 12, color: '#64748B', fontWeight: '500' },
    genderTextActive: { color: '#FFF', fontWeight: 'bold' },

    saveBtn: {
        width: '100%',
        height: 48,
        backgroundColor: '#2C4A6F',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
        marginTop: 10,
    },
    saveBtnText: { color: '#FFF', fontSize: 15, fontWeight: 'bold' },
    cancelBtn: {
        width: '100%',
        height: 48,
        backgroundColor: '#F1F5F9',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    cancelBtnText: { color: '#64748B', fontSize: 15, fontWeight: '600' },
});
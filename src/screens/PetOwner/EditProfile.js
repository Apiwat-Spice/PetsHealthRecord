import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, ScrollView, Alert, Image, ActivityIndicator, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
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
        profile_image_url: '',
        profile_image_public_id: ''
    });
    const [imageBase64, setImageBase64] = useState(null);

    // ดึงข้อมูลเดิมมาแสดง
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
                    profile_image_url: profile.profile_image_url || '',
                    profile_image_public_id: profile.profile_image_public_id || ''
                });
            }
        };
        loadData();
    }, []);

    // อัปโหลดรูปจากเครื่อง
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

    // อัปโหลดขึ้น Cloudinary
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

            // ถ้ารูปเปลี่ยน (มี base64) ให้เอาไปขึ้นคลาวด์ก่อน
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
                // บันทึกข้อมูลที่อัปเดตแล้วทับลงในเครื่อง
                await SecureStore.setItemAsync("pet_owners", JSON.stringify(result.profile));
                Alert.alert('สำเร็จ', 'อัปเดตโปรไฟล์เรียบร้อยแล้ว', [{ text: 'ตกลง', onPress: () => navigation.goBack() }]);
            } else {
                Alert.alert('เกิดข้อผิดพลาด', result.message);
            }
        } catch (error) {
            Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
                    <Feather name="arrow-left" size={24} color="#FFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>แก้ไขโปรไฟล์</Text>
                <View style={{ width: 24 }} />
            </View>

            <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                    
                    {/* ข้อมูลด้านบน Card */}
                    <View style={styles.card}>
                        <View style={styles.avatarWrapper}>
                            <TouchableOpacity style={styles.avatarContainer} onPress={pickImage}>
                                {formData.profile_image_url ? (
                                    <Image source={{ uri: formData.profile_image_url }} style={styles.avatarImage} />
                                ) : (
                                    <Feather name="user" size={50} color="#5A7584" />
                                )}
                            </TouchableOpacity>
                            {/* ไอคอนดินสอ */}
                            <View style={styles.editIconBadge}>
                                <Feather name="edit-2" size={14} color="#FFF" />
                            </View>
                        </View>

                        <View style={styles.badge}>
                            <Text style={styles.badgeText}>เจ้าของสัตว์เลี้ยง</Text>
                        </View>
                        <Text style={styles.nameHeader}>{formData.first_name} {formData.last_name}</Text>
                        <Text style={styles.emailHeader}>{userEmail}</Text>

                        {/* ฟอร์มกรอกข้อมูล */}
                        <View style={styles.formContainer}>
                            <Text style={styles.label}>Username</Text>
                            <TextInput style={styles.input} value={formData.username} onChangeText={(text) => setFormData({...formData, username: text})} placeholder="ตั้งชื่อผู้ใช้ของคุณ" />

                            <Text style={styles.label}>ชื่อ (First Name)</Text>
                            <TextInput style={styles.input} value={formData.first_name} onChangeText={(text) => setFormData({...formData, first_name: text})} placeholder="ชื่อจริง" />

                            <Text style={styles.label}>นามสกุล (Last Name)</Text>
                            <TextInput style={styles.input} value={formData.last_name} onChangeText={(text) => setFormData({...formData, last_name: text})} placeholder="นามสกุล" />

                            <Text style={styles.label}>เพศ</Text>
                            <View style={styles.genderRow}>
                                {['male', 'female', 'other'].map((g) => (
                                    <TouchableOpacity 
                                        key={g} 
                                        style={[styles.genderBtn, formData.gender === g && styles.genderBtnActive]}
                                        onPress={() => setFormData({...formData, gender: g})}
                                    >
                                        <Text style={[styles.genderText, formData.gender === g && styles.genderTextActive]}>
                                            {g === 'male' ? 'ชาย' : g === 'female' ? 'หญิง' : 'อื่นๆ'}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* ปุ่มบันทึก / ยกเลิก */}
                        <TouchableOpacity style={styles.saveBtn} onPress={handleSave} disabled={isLoading}>
                            {isLoading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.saveBtnText}>บันทึก</Text>}
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.cancelBtn} onPress={() => navigation.goBack()} disabled={isLoading}>
                            <Text style={styles.cancelBtnText}>ยกเลิก</Text>
                        </TouchableOpacity>

                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#5A7584' },
    header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 15, backgroundColor: '#5A7584' },
    headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#FFF' },
    backBtn: { padding: 5 },
    scrollContent: { padding: 15, paddingBottom: 40 },
    card: { backgroundColor: '#FFF', borderRadius: 20, padding: 25, alignItems: 'center', elevation: 4 },
    avatarWrapper: { position: 'relative', marginBottom: 15 },
    avatarContainer: { width: 110, height: 110, borderRadius: 55, borderWidth: 4, borderColor: '#5A7584', justifyContent: 'center', alignItems: 'center', backgroundColor: '#F0F4F8', overflow: 'hidden' },
    avatarImage: { width: '100%', height: '100%' },
    editIconBadge: { position: 'absolute', right: 0, top: 5, backgroundColor: '#8EB4D0', width: 28, height: 28, borderRadius: 14, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#FFF' },
    badge: { backgroundColor: '#E1F5FE', paddingHorizontal: 15, paddingVertical: 5, borderRadius: 15, marginBottom: 10 },
    badgeText: { fontSize: 13, color: '#0288D1', fontWeight: 'bold' },
    nameHeader: { fontSize: 22, fontWeight: 'bold', color: '#333' },
    emailHeader: { fontSize: 14, color: '#888', marginBottom: 25 },
    
    formContainer: { width: '100%', marginBottom: 20 },
    label: { fontSize: 14, fontWeight: 'bold', color: '#5A7584', marginBottom: 8, marginTop: 15 },
    input: { width: '100%', height: 48, borderWidth: 1, borderColor: '#CCC', borderRadius: 8, paddingHorizontal: 15, fontSize: 15, color: '#333', backgroundColor: '#FAFAFA' },
    
    genderRow: { flexDirection: 'row', justifyContent: 'space-between' },
    genderBtn: { flex: 1, height: 45, borderWidth: 1, borderColor: '#CCC', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginHorizontal: 4, backgroundColor: '#FAFAFA' },
    genderBtnActive: { backgroundColor: '#5A7584', borderColor: '#5A7584' },
    genderText: { fontSize: 14, color: '#666' },
    genderTextActive: { color: '#FFF', fontWeight: 'bold' },

    saveBtn: { width: '100%', height: 50, backgroundColor: '#005BB5', borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
    saveBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
    cancelBtn: { width: '100%', height: 50, backgroundColor: '#A0AAB2', borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
    cancelBtnText: { color: '#FFF', fontSize: 16, fontWeight: 'bold' },
});
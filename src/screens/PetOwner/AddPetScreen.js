import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, StatusBar, Platform, Alert, Image } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { API_URL } from '../../config';
import * as ImagePicker from 'expo-image-picker';
import * as SecureStore from 'expo-secure-store';

export default function AddPetScreen({ navigation }) {
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [imageUri, setImageUri] = useState(null);
    const [imageBase64, setImageBase64] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [currentOwnerId, setCurrentOwnerId] = useState(null);

    useEffect(() => {
        const loadUserData = async () => {
            try {
                // 🟢 เปลี่ยนจาก "user" เป็น "pet_owners" เพื่อดึงข้อมูลอีกกล่องแทนครับ
                const ownerString = await SecureStore.getItemAsync("pet_owners");

                if (ownerString) {
                    const ownerData = JSON.parse(ownerString);
                    console.log("✅ ข้อมูล Pet Owner ที่ดึงมาจากเครื่อง:", ownerData); // ดูใน Log ต้องมี pet_owners_id แน่นอน

                    if (ownerData.pet_owners_id) {
                        setCurrentOwnerId(ownerData.pet_owners_id);
                    } else {
                        console.log("⚠️ คำเตือน: หา pet_owners_id ไม่เจอในกล่องนี้");
                    }
                } else {
                    console.log("❌ ไม่พบข้อมูลกล่อง pet_owners ในเครื่อง (ลืมกดย้อนกลับไปล็อกอินใหม่หรือเปล่า?)");
                }
            } catch (error) {
                console.error("Error loading user data:", error);
            }
        };
        loadUserData();
    }, []);

    const [petData, setPetData] = useState({
        name: '',
        animaltype: '',
        species: '',
        sex: '',
        birth_date: '',
        weight: '',
        detail: '',
    });

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'], // 🟢 แก้ไขเพื่อลบ Warning
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
            base64: true,
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri); // เอาไว้โชว์บนหน้าจอตามปกติ
            setImageBase64(result.assets[0].base64);
        }
    };
    const uploadImageToCloudinary = async (base64String) => {
        try {
            console.log("👉 [1] เริ่มอัปโหลดรูปด้วยวิธี Base64...");

            // นำข้อความ Base64 มาต่อกับโค้ดด้านหน้า เพื่อให้ Cloudinary รู้ว่าเป็นไฟล์ภาพ
            const dataUrl = `data:image/jpeg;base64,${base64String}`;

            // ยิง API แบบ JSON ธรรมดาเลย (หลบปัญหา FormData พังได้ 100%)
            const response = await fetch('https://api.cloudinary.com/v1_1/dedkhhsja/image/upload/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    file: dataUrl,
                    upload_preset: 'pet_app_preset' ,// ชื่อ Preset ของคุณ
                    folder: 'Pet' // ชื่อ Folder ของคุณ
                }),
            });

            const result = await response.json();
            console.log("👉 [2] ข้อมูลที่ Cloudinary ตอบกลับมา:", result);

            if (result.secure_url) {
                console.log("✅ อัปโหลดสำเร็จ Public ID คือ:", result.public_id);
                console.log("✅ อัปโหลดสำเร็จ ลิงก์คือ:", result.secure_url);
                return {
                    url: result.secure_url,
                    publicId: result.public_id // จับ public_id ที่คลาวด์ให้มา ส่งกลับไป
                };
            } else {
                console.error("❌ Cloudinary Upload Error:", result);
                return null;
            }
        } catch (error) {
            console.error("❌ Error uploading:", error);
            return null;
        }
    };

    const handleDateChange = (event, selectedDate) => {
        if (event.type === 'dismissed') {
            setShowDatePicker(false);
            return;
        }

        const currentDate = selectedDate || date;
        setShowDatePicker(Platform.OS === 'ios');
        if (Platform.OS === 'android') setShowDatePicker(false);

        setDate(currentDate);

        const day = currentDate.getDate().toString().padStart(2, '0');
        const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
        const year = currentDate.getFullYear();

        handleChange('birth_date', `${day}/${month}/${year}`);
    };

    const handleChange = (field, value) => {
        setPetData({ ...petData, [field]: value });
    };


    const handleSavePet = async () => {
        if (!petData.name || !petData.animaltype || !petData.sex) {
            Alert.alert('แจ้งเตือน', 'กรุณากรอกชื่อ ชนิด และเลือกเพศสัตว์เลี้ยง');
            return;
        }

        if (!currentOwnerId) {
            Alert.alert('ข้อผิดพลาด', 'ไม่พบข้อมูลผู้ใช้งาน กรุณาล็อกอินใหม่อีกครั้ง');
            return;
        }

        try {
            setIsLoading(true);

            // 🟢 1. จัดการวันที่
            let dbFormattedDate = null;
            if (petData.birth_date) {
                const [day, month, year] = petData.birth_date.split('/');
                dbFormattedDate = `${year}-${month}-${day}`;
            }

            // 🟢 2. อัปโหลดรูป
            // ... โค้ดด้านบน (จัดการวันที่) เหมือนเดิม ...

            // 🟢 เพิ่มตัวแปรสำหรับเก็บ Public ID
            let finalImageUrl = null;
            let finalImagePublicId = null; 

            if (imageBase64) {
                const uploadResult = await uploadImageToCloudinary(imageBase64); 
                
                if (!uploadResult) {
                    Alert.alert('ข้อผิดพลาด', 'อัปโหลดรูปไม่สำเร็จ กรุณาลองใหม่');
                    setIsLoading(false);
                    return; 
                }

                // 🟢 แยกข้อมูล URL และ Public ID ออกมาจากที่ return ไว้
                finalImageUrl = uploadResult.url;
                finalImagePublicId = uploadResult.publicId; 
            }

            // 🟢 นำข้อมูลใส่ Payload เพื่อเตรียมยิง API 
            const payload = {
                pet_owners_id: currentOwnerId,
                pet_name: petData.name,
                animal_type: petData.animaltype,
                species: petData.species,
                sex: petData.sex,
                birth_date: dbFormattedDate,
                weight: petData.weight || null,
                detail: petData.detail,
                pet_image_url: finalImageUrl, 
                pet_image_public_id: finalImagePublicId 
            };

            const response = await fetch(`${API_URL}/pets/add`, {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            // ... โค้ดด้านล่างเหมือนเดิม ...

            const responseText = await response.text();
            let result;
            try {
                result = JSON.parse(responseText);
            } catch (e) {
                throw new Error(`เซิร์ฟเวอร์ไม่ได้ส่งข้อมูล JSON กลับมา (Status: ${response.status})`);
            }

            if (!response.ok) {
                throw new Error(result.message || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
            }

            Alert.alert('สำเร็จ', 'เพิ่มข้อมูลสัตว์เลี้ยงเรียบร้อยแล้ว!', [
                { text: 'ตกลง', onPress: () => navigation?.goBack() }
            ]);

        } catch (error) {
            console.error("Save Pet Error:", error);
            Alert.alert('ข้อผิดพลาด', error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <StatusBar barStyle="light-content" backgroundColor="#0055B3" />

            <View style={styles.headerBar}>
                <TouchableOpacity style={styles.backBtn} onPress={() => navigation?.goBack()}>
                    <Feather name="arrow-left" size={24} color="#FFFFFF" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>เพิ่มสัตว์เลี้ยง</Text>
                <View style={{ width: 24 }} />
            </View>

            <View style={styles.bodyWrapper}>
                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                    <View style={styles.contentPadding}>

                        <View style={styles.uploadPhotoSection}>
                            <TouchableOpacity style={styles.photoCircle} activeOpacity={0.8} onPress={pickImage}>
                                {imageUri ? (
                                    <Image source={{ uri: imageUri }} style={styles.previewImage} />
                                ) : (
                                    <MaterialCommunityIcons name="camera-plus" size={32} color="#0055B3" />
                                )}
                            </TouchableOpacity>
                            <Text style={styles.uploadPhotoText}>
                                {imageUri ? "เปลี่ยนรูปภาพ" : "เพิ่มรูปภาพสัตว์เลี้ยง"}
                            </Text>
                        </View>

                        <View style={styles.formContainer}>

                            <Text style={styles.inputLabel}>ชื่อสัตว์เลี้ยง <Text style={styles.textRequired}>*</Text></Text>
                            <TextInput
                                style={styles.textInputOutline}
                                placeholder="เช่น หมูเด้ง, ลัคกี้"
                                value={petData.name}
                                onChangeText={(text) => handleChange('name', text)}
                            />

                            <View style={styles.rowForm}>
                                <View style={{ flex: 1, marginRight: 8 }}>
                                    <Text style={styles.inputLabel}>ชนิดสัตว์เลี้ยง <Text style={styles.textRequired}>*</Text></Text>
                                    <TextInput
                                        style={styles.textInputOutline}
                                        placeholder="เช่น สุนัข, แมว..."
                                        value={petData.animaltype}
                                        onChangeText={(text) => handleChange('animaltype', text)}
                                    />
                                </View>
                                <View style={{ flex: 1, marginLeft: 8 }}>
                                    <Text style={styles.inputLabel}>สายพันธุ์</Text>
                                    <TextInput
                                        style={styles.textInputOutline}
                                        placeholder="เช่น ปอมเมอเรเนียน..."
                                        value={petData.species}
                                        onChangeText={(text) => handleChange('species', text)}
                                    />
                                </View>
                            </View>

                            <Text style={styles.inputLabel}>เพศ <Text style={styles.textRequired}>*</Text></Text>
                            <View style={styles.sexRow}>
                                <TouchableOpacity
                                    style={[styles.sexBtn, petData.sex === 'male' && styles.sexBtnActiveBlue]}
                                    onPress={() => handleChange('sex', 'male')}
                                >
                                    <MaterialCommunityIcons name="gender-male" size={20} color={petData.sex === 'male' ? '#FFF' : '#1976D2'} />
                                    <Text style={[styles.sexText, petData.sex === 'male' && { color: '#FFF' }]}>ตัวผู้</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.sexBtn, petData.sex === 'female' && styles.sexBtnActivePink]}
                                    onPress={() => handleChange('sex', 'female')}
                                >
                                    <MaterialCommunityIcons name="gender-female" size={20} color={petData.sex === 'female' ? '#FFF' : '#E91E63'} />
                                    <Text style={[styles.sexText, petData.sex === 'female' && { color: '#FFF' }]}>ตัวเมีย</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.rowForm}>
                                <View style={{ flex: 1, marginRight: 8 }}>
                                    <Text style={styles.inputLabel}>วันเกิด</Text>
                                    <TouchableOpacity
                                        style={styles.datePickerInput}
                                        onPress={() => setShowDatePicker(true)}
                                    >
                                        <Text style={{ color: petData.birth_date ? '#1A1A1A' : '#A0A0A0', fontSize: 14 }}>
                                            {petData.birth_date || "วว/ดด/ปปปป"}
                                        </Text>
                                        <Feather name="calendar" size={18} color="#0055B3" />
                                    </TouchableOpacity>
                                </View>
                                <View style={{ flex: 1, marginLeft: 8 }}>
                                    <Text style={styles.inputLabel}>น้ำหนัก (กก.)</Text>
                                    <TextInput
                                        style={styles.textInputOutline}
                                        placeholder="0.0"
                                        keyboardType="numeric"
                                        value={petData.weight}
                                        onChangeText={(text) => handleChange('weight', text)}
                                    />
                                </View>
                            </View>

                            <Text style={styles.inputLabel}>ข้อควรระวังทางการแพทย์ / แพ้ยา</Text>
                            <TextInput
                                style={[styles.textInputOutline, styles.textArea]}
                                placeholder="เช่น แพ้ยา, ดุเวลาเจอคนแปลกหน้า..."
                                multiline={true}
                                numberOfLines={3}
                                value={petData.detail}
                                onChangeText={(text) => handleChange('detail', text)}
                            />

                        </View>

                        <TouchableOpacity style={styles.submitBtn} onPress={handleSavePet}>
                            <Text style={styles.submitBtnText}>บันทึกข้อมูลสัตว์เลี้ยง</Text>
                        </TouchableOpacity>

                        <View style={{ height: 40 }} />
                    </View>
                </ScrollView>
            </View>
            {showDatePicker && (
                <DateTimePicker
                    value={date}
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                    maximumDate={new Date()}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#96B9D7' },

    headerBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, backgroundColor: '#0055B3' },
    backBtn: { padding: 4 },
    headerTitle: { color: '#FFFFFF', fontSize: 18, fontWeight: 'bold' },

    bodyWrapper: { flex: 1, backgroundColor: '#FAFAFA', borderTopLeftRadius: 0, borderTopRightRadius: 0, overflow: 'hidden' },
    scrollView: { flex: 1 },
    contentPadding: { padding: 20 },

    uploadPhotoSection: { alignItems: 'center', marginVertical: 20 },
    photoCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#ECFBFF', borderWidth: 2, borderColor: '#0055B3', borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', marginBottom: 12, overflow: 'hidden' },
    previewImage: { width: '100%', height: '100%' },
    uploadPhotoText: { color: '#0055B3', fontSize: 14, fontWeight: 'bold' },

    formContainer: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#EAEAEC', elevation: 1, marginBottom: 24 },
    rowForm: { flexDirection: 'row', justifyContent: 'space-between' },
    inputLabel: { fontSize: 13, fontWeight: 'bold', color: '#333', marginTop: 12, marginBottom: 6 },
    textRequired: { color: '#FF3B30' },

    textInputOutline: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#D1D1D1', borderRadius: 8, height: 46, paddingHorizontal: 12, fontSize: 14, color: '#1A1A1A' },
    textArea: { height: 80, paddingTop: 12, textAlignVertical: 'top' },

    datePickerInput: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFF', borderWidth: 1, borderColor: '#D1D1D1', borderRadius: 8, height: 46, paddingHorizontal: 12 },

    sexRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
    sexBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 46, borderWidth: 1, borderColor: '#D1D1D1', borderRadius: 8, marginHorizontal: 4 },
    sexText: { fontSize: 14, fontWeight: 'bold', color: '#666', marginLeft: 6 },

    sexBtnActiveBlue: { backgroundColor: '#1976D2', borderColor: '#1976D2' },
    sexBtnActivePink: { backgroundColor: '#E91E63', borderColor: '#E91E63' },

    submitBtn: { backgroundColor: '#0055B3', borderRadius: 12, paddingVertical: 14, alignItems: 'center', shadowColor: '#0055B3', shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
    submitBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});
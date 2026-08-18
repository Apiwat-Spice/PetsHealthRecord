import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, StatusBar, Platform, Alert, Image } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';
import { API_URL } from '../../config';
import * as ImagePicker from 'expo-image-picker';

export default function AddPetScreen({ navigation }) {
    const [date, setDate] = useState(new Date()); 
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [imageUri, setImageUri] = useState(null);

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
        });

        if (!result.canceled) {
            setImageUri(result.assets[0].uri); 
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

    const handleSavePet = () => {
        // 🟢 รวมข้อมูลทั้งหมด รวมถึงรูปภาพ
        const finalData = { ...petData, image_url: imageUri };

        // 🟢 ปริ้นท์ลง Log
        console.log('\n--- ข้อมูลสัตว์เลี้ยงที่จะส่งเข้า Database ---');
        console.log(JSON.stringify(finalData, null, 2));
        console.log('-----------------------------------------\n');

        // 🟢 แสดง Pop-up บนจอมือถือเพื่อให้รู้ว่าปุ่มทำงานแล้ว
        Alert.alert('เรียบร้อย!', 'ข้อมูลถูกส่งเข้า Log แล้ว เช็คใน Terminal ได้เลยครับ');
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
                                    style={[styles.sexBtn, petData.sex === 'Male' && styles.sexBtnActiveBlue]}
                                    onPress={() => handleChange('sex', 'Male')}
                                >
                                    <MaterialCommunityIcons name="gender-male" size={20} color={petData.sex === 'Male' ? '#FFF' : '#1976D2'} />
                                    <Text style={[styles.sexText, petData.sex === 'Male' && { color: '#FFF' }]}>ตัวผู้</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.sexBtn, petData.sex === 'Female' && styles.sexBtnActivePink]}
                                    onPress={() => handleChange('sex', 'Female')}
                                >
                                    <MaterialCommunityIcons name="gender-female" size={20} color={petData.sex === 'Female' ? '#FFF' : '#E91E63'} />
                                    <Text style={[styles.sexText, petData.sex === 'Female' && { color: '#FFF' }]}>ตัวเมีย</Text>
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
import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, StatusBar, Platform, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

export default function AddPetScreen({ navigation }) {
    const [petData, setPetData] = useState({
        name: '',
        species: '',
        breed: '',
        age: '',
        weight: '',
        note: ''
    });

    const [gender, setGender] = useState('');

    const handleChange = (field, value) => {
        setPetData({ ...petData, [field]: value });
    };

    const handleSavePet = () => {
        if (!petData.name || !petData.species || !gender) {
            Alert.alert('แจ้งเตือน', 'กรุณากรอกชื่อ ชนิด และเลือกเพศสัตว์เลี้ยง');
            return;
        }
        Alert.alert('สำเร็จ', 'เพิ่มข้อมูลสัตว์เลี้ยงเรียบร้อยแล้ว!', [
            { text: 'ตกลง', onPress: () => navigation?.goBack() }
        ]);
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
                            <TouchableOpacity style={styles.photoCircle} activeOpacity={0.8}>
                                <MaterialCommunityIcons name="camera-plus" size={32} color="#0055B3" />
                            </TouchableOpacity>
                            <Text style={styles.uploadPhotoText}>เพิ่มรูปภาพสัตว์เลี้ยง</Text>
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
                                        value={petData.species}
                                        onChangeText={(text) => handleChange('species', text)}
                                    />
                                </View>
                                <View style={{ flex: 1, marginLeft: 8 }}>
                                    <Text style={styles.inputLabel}>สายพันธุ์</Text>
                                    <TextInput
                                        style={styles.textInputOutline}
                                        placeholder="เช่น ปอมเมอเรเนียน..."
                                        value={petData.breed}
                                        onChangeText={(text) => handleChange('breed', text)}
                                    />
                                </View>
                            </View>

                            <Text style={styles.inputLabel}>เพศ <Text style={styles.textRequired}>*</Text></Text>
                            <View style={styles.genderRow}>
                                <TouchableOpacity
                                    style={[styles.genderBtn, gender === 'M' && styles.genderBtnActiveBlue]}
                                    onPress={() => setGender('M')}
                                >
                                    <MaterialCommunityIcons name="gender-male" size={20} color={gender === 'M' ? '#FFF' : '#1976D2'} />
                                    <Text style={[styles.genderText, gender === 'M' && { color: '#FFF' }]}>ตัวผู้</Text>
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={[styles.genderBtn, gender === 'F' && styles.genderBtnActivePink]}
                                    onPress={() => setGender('F')}
                                >
                                    <MaterialCommunityIcons name="gender-female" size={20} color={gender === 'F' ? '#FFF' : '#E91E63'} />
                                    <Text style={[styles.genderText, gender === 'F' && { color: '#FFF' }]}>ตัวเมีย</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.rowForm}>
                                <View style={{ flex: 1, marginRight: 8 }}>
                                    <Text style={styles.inputLabel}>อายุ</Text>
                                    <TextInput
                                        style={styles.textInputOutline}
                                        placeholder="เช่น 2 ปี 3 เดือน"
                                        value={petData.age}
                                        onChangeText={(text) => handleChange('age', text)}
                                    />
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
                                value={petData.note}
                                onChangeText={(text) => handleChange('note', text)}
                            />

                        </View>

                        <TouchableOpacity style={styles.submitBtn} onPress={handleSavePet}>
                            <Text style={styles.submitBtnText}>บันทึกข้อมูลสัตว์เลี้ยง</Text>
                        </TouchableOpacity>

                        <View style={{ height: 40 }} />
                    </View>
                </ScrollView>
            </View>
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
    photoCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#ECFBFF', borderWidth: 2, borderColor: '#0055B3', borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
    uploadPhotoText: { color: '#0055B3', fontSize: 14, fontWeight: 'bold' },

    formContainer: { backgroundColor: '#FFFFFF', padding: 20, borderRadius: 16, borderWidth: 1, borderColor: '#EAEAEC', elevation: 1, marginBottom: 24 },
    rowForm: { flexDirection: 'row', justifyContent: 'space-between' },
    inputLabel: { fontSize: 13, fontWeight: 'bold', color: '#333', marginTop: 12, marginBottom: 6 },
    textRequired: { color: '#FF3B30' },

    textInputOutline: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#D1D1D1', borderRadius: 8, height: 46, paddingHorizontal: 12, fontSize: 14, color: '#1A1A1A' },
    textArea: { height: 80, paddingTop: 12, textAlignVertical: 'top' },

    genderRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
    genderBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', height: 46, borderWidth: 1, borderColor: '#D1D1D1', borderRadius: 8, marginHorizontal: 4 },
    genderText: { fontSize: 14, fontWeight: 'bold', color: '#666', marginLeft: 6 },

    genderBtnActiveBlue: { backgroundColor: '#1976D2', borderColor: '#1976D2' },
    genderBtnActivePink: { backgroundColor: '#E91E63', borderColor: '#E91E63' },

    submitBtn: { backgroundColor: '#0055B3', borderRadius: 12, paddingVertical: 14, alignItems: 'center', shadowColor: '#0055B3', shadowOpacity: 0.3, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, elevation: 4 },
    submitBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
});
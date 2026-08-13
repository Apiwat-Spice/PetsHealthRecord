import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, StatusBar, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

export default function ReceiptStaff() {
    const staffInfo = { clinicName: 'คลินิกรักษาสัตว์ HappyPet', staffName: 'คุณมานี รักงาน' };

    const [showCreateForm, setShowCreateForm] = useState(true);


    const [receiptItems, setReceiptItems] = useState([
        { id: Date.now().toString(), name: '', price: '' }
    ]);

    // เพิ่มรายการใหม่
    const addItem = () => {
        const newItem = { id: Date.now().toString(), name: '', price: '' };
        setReceiptItems([...receiptItems, newItem]);
    };

    // ลบรายการ
    const removeItem = (id) => {
        // ป้องกันการลบจนหมด ให้เหลือไว้อย่างน้อย 1 แถวเสมอ
        if (receiptItems.length > 1) {
            const filteredItems = receiptItems.filter(item => item.id !== id);
            setReceiptItems(filteredItems);
        } else {
            // ถ้าเหลือ 1 แถวแล้วกดลบ ให้แค่เคลียร์ค่าให้ว่าง
            setReceiptItems([{ id: Date.now().toString(), name: '', price: '' }]);
        }
    };

    // อัปเดตข้อมูลเมื่อมีการพิมพ์ช่องชื่อรายการหรือราคา
    const handleItemChange = (id, field, value) => {
        const updatedItems = receiptItems.map(item => {
            if (item.id === id) {
                return { ...item, [field]: value };
            }
            return item;
        });
        setReceiptItems(updatedItems);
    };

    // คำนวณยอดรวม
    const calculateTotal = () => {
        return receiptItems.reduce((sum, item) => {
            const itemPrice = parseFloat(item.price) || 0;
            return sum + itemPrice;
        }, 0);
    };

    return (
        <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
            <StatusBar barStyle="light-content" backgroundColor="#2F80ED" />

            {/* Header แถบสีน้ำเงิน */}
            <View style={styles.headerBar}>
                <View style={styles.headerLeft}>
                    <MaterialCommunityIcons name="domain" size={20} color="#FFFFFF" />
                    <Text style={styles.clinicNameText}>{staffInfo.clinicName}</Text>
                </View>
                <Text style={styles.roleText}>พนักงาน : {staffInfo.staffName}</Text>
            </View>

            <View style={styles.bodyWrapper}>
                <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
                    <View style={styles.contentPadding}>

                        <View style={styles.pageHeaderRow}>
                            <Text style={styles.mainTitle}>ใบเสร็จ / การเงิน</Text>
                            {!showCreateForm && (
                                <TouchableOpacity style={styles.addReceiptBtn} onPress={() => setShowCreateForm(true)}>
                                    <Feather name="plus" size={16} color="#FFF" style={{ marginRight: 4 }} />
                                    <Text style={styles.addReceiptBtnText}>สร้างใบเสร็จ</Text>
                                </TouchableOpacity>
                            )}
                        </View>

                        {/* ฟอร์มสร้างใบเสร็จ (คำนวณและเพิ่มแถวได้) */}
                        {showCreateForm && (
                            <View style={styles.createFormCard}>
                                <View style={styles.formHeaderRow}>
                                    <Text style={styles.formTitle}>สร้างใบเสร็จ</Text>
                                    <TouchableOpacity onPress={() => setShowCreateForm(false)}>
                                        <Feather name="x" size={20} color="#888" />
                                    </TouchableOpacity>
                                </View>

                                <Text style={styles.inputLabel}>เลือกนัดหมายที่เสร็จสิ้น</Text>
                                <View style={styles.dropdownBox}>
                                    <Text style={styles.dropdownText}>--เลือกนัดหมาย--</Text>
                                    <Feather name="chevron-down" size={18} color="#999" />
                                </View>

                                {/* หัวข้อรายการ และ ปุ่มเพิ่มรายการ */}
                                <View style={styles.itemHeaderRow}>
                                    <Text style={styles.inputLabel}>รายการค่าบริการ</Text>
                                    <TouchableOpacity onPress={addItem}>
                                        <Text style={styles.addItemText}>+ เพิ่มรายการ</Text>
                                    </TouchableOpacity>
                                </View>

                                {/* รายการ */}
                                {receiptItems.map((item) => (
                                    <View key={item.id} style={styles.itemRow}>
                                        <TextInput
                                            style={[styles.textInput, { flex: 2, marginRight: 8 }]}
                                            placeholder="กรอกรายการ เช่น ค่าตรวจ..."
                                            value={item.name}
                                            onChangeText={(text) => handleItemChange(item.id, 'name', text)}
                                        />
                                        <TextInput
                                            style={[styles.textInput, { flex: 1, marginRight: 8 }]}
                                            placeholder="0"
                                            keyboardType="numeric"
                                            value={item.price}
                                            onChangeText={(text) => handleItemChange(item.id, 'price', text)}
                                        />
                                        <TouchableOpacity style={styles.delBtn} onPress={() => removeItem(item.id)}>
                                            <Feather name="trash-2" size={18} color="#FF3B30" />
                                        </TouchableOpacity>
                                    </View>
                                ))}

                                {/* แสดงยอดรวม */}
                                <View style={styles.totalRow}>
                                    <Text style={styles.totalText}>ยอดรวม</Text>
                                    <Text style={styles.totalAmount}>฿{calculateTotal().toLocaleString()}</Text>
                                </View>

                                <TouchableOpacity
                                    style={styles.submitBtn}
                                    onPress={() => {
                                        Alert.alert('สำเร็จ', `สร้างใบเสร็จยอดรวม ฿${calculateTotal().toLocaleString()} เรียบร้อยแล้ว`);
                                        setShowCreateForm(false);
                                        setReceiptItems([{ id: Date.now().toString(), name: '', price: '' }]); // รีเซ็ตฟอร์ม
                                    }}
                                >
                                    <Text style={styles.submitBtnText}>สร้างใบเสร็จ</Text>
                                </TouchableOpacity>
                            </View>
                        )}

                        {/* ประวัติใบเสร็จที่เคยสร้าง */}
                        <View style={styles.receiptCard}>
                            <View style={styles.receiptHeaderRow}>
                                <Text style={styles.receiptTitle}>ฉีดวัคซีนพิษสุนัขบ้าประจำปี</Text>
                                <View style={styles.badgeGreen}><Text style={styles.badgeGreenText}>ชำระแล้ว</Text></View>
                            </View>
                            <Text style={styles.detailText}><Text style={{ fontWeight: 'bold' }}>หมูเด้ง</Text> - 2025-05-17 เวลา 10.00น.</Text>
                            <Text style={styles.detailText}>จัดทำโดย คุณมานี รักงาน</Text>

                            <View style={styles.divider} />

                            <View style={styles.receiptItemRow}>
                                <Text style={styles.receiptItemName}>วัคซีนป้องกันโรคพิษสุนัขบ้า</Text>
                                <Text style={styles.receiptItemPrice}>150 บาท</Text>
                            </View>
                            <View style={styles.receiptItemRow}>
                                <Text style={styles.receiptItemName}>ค่าบริการทางการแพทย์</Text>
                                <Text style={styles.receiptItemPrice}>100 บาท</Text>
                            </View>

                            <View style={[styles.receiptItemRow, { marginTop: 8 }]}>
                                <Text style={styles.receiptTotalLabel}>ยอดรวม</Text>
                                <Text style={styles.receiptTotalValue}>250 บาท</Text>
                            </View>
                        </View>

                        <View style={{ height: 40 }} />
                    </View>
                </ScrollView>
            </View>
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

    pageHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
    mainTitle: { fontSize: 20, fontWeight: 'bold', color: '#2F80ED' },
    addReceiptBtn: { flexDirection: 'row', backgroundColor: '#1976D2', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, alignItems: 'center' },
    addReceiptBtnText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },

    // Create Form Card
    createFormCard: { backgroundColor: '#FFFFFF', borderWidth: 1.5, borderColor: '#2F80ED', borderRadius: 16, padding: 16, marginBottom: 20, elevation: 2 },
    formHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
    formTitle: { fontSize: 16, fontWeight: 'bold', color: '#2F80ED' },
    inputLabel: { fontSize: 12, color: '#666', marginBottom: 6 },
    dropdownBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#D1D1D1', borderRadius: 8, paddingHorizontal: 12, height: 42, marginBottom: 16 },
    dropdownText: { fontSize: 13, color: '#333' },
    itemHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
    addItemText: { color: '#2F80ED', fontSize: 12, fontWeight: 'bold' },
    itemRow: { flexDirection: 'row', marginBottom: 10, alignItems: 'center' },
    textInput: { borderWidth: 1, borderColor: '#D1D1D1', borderRadius: 8, height: 40, paddingHorizontal: 12, fontSize: 13 },
    delBtn: { borderWidth: 1, borderColor: '#FF3B30', borderRadius: 8, width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#F0FDF4', padding: 12, borderRadius: 8, marginTop: 10, marginBottom: 16 },
    totalText: { fontSize: 14, fontWeight: 'bold', color: '#666' },
    totalAmount: { fontSize: 16, fontWeight: 'bold', color: '#00C853' },
    submitBtn: { backgroundColor: '#1976D2', borderRadius: 8, paddingVertical: 14, alignItems: 'center' },
    submitBtnText: { color: '#FFF', fontSize: 14, fontWeight: 'bold' },

    // Receipt Card
    receiptCard: { backgroundColor: '#FFFFFF', borderWidth: 1, borderColor: '#EAEAEC', borderRadius: 12, padding: 16, elevation: 1 },
    receiptHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
    receiptTitle: { fontSize: 15, fontWeight: 'bold', color: '#1976D2' },
    badgeGreen: { backgroundColor: '#E8F5E9', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    badgeGreenText: { color: '#00C853', fontSize: 10, fontWeight: 'bold' },
    detailText: { fontSize: 12, color: '#666', marginBottom: 4 },
    divider: { height: 1, backgroundColor: '#F0F0F0', marginVertical: 12 },
    receiptItemRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
    receiptItemName: { fontSize: 12, color: '#666' },
    receiptItemPrice: { fontSize: 12, color: '#333', fontWeight: 'bold' },
    receiptTotalLabel: { fontSize: 13, fontWeight: 'bold', color: '#00C853' },
    receiptTotalValue: { fontSize: 14, fontWeight: 'bold', color: '#00C853' },
});
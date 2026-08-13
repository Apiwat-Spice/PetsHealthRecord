import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, TextInput, StatusBar, Platform, Modal, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

export default function PetScanned() {
  const clinicInfo = { clinicName: 'คลินิกรักษาสัตว์ HappyPet', vetName: 'น.สพ.สมพง' };

  const [petData, setPetData] = useState({
    name: 'หมูเด้ง',
    subTitle: 'รายละเอียด',
    weight: '25 กก.',
    species: 'สุนัข',
    breed: 'โกลเด้น รีทรีฟเวอร์',
    age: '2 ปี',
  });

  const [viewMode, setViewMode] = useState('list');
  const [activeTab, setActiveTab] = useState('info');

  //แก้ไขข้อมูลพื้นฐาน
  const [isEditingInfo, setIsEditingInfo] = useState(false);
  const [editForm, setEditForm] = useState({ ...petData });

  const [modalHistoryVisible, setModalHistoryVisible] = useState(false);
  const [modalApptVisible, setModalApptVisible] = useState(false);

  // บันทึกข้อมูลแก้ไข
  const handleSaveInfo = () => {
    setPetData(editForm);
    setIsEditingInfo(false);
    Alert.alert('สำเร็จ', 'อัปเดตข้อมูลพื้นฐานเรียบร้อยแล้ว');
  };

  // รายการสัตว์เลี้ยงที่สแกน
  const renderScannedListView = () => (
    <View style={styles.containerInner}>
      <Text style={styles.pageMainTitle}>สัตว์เลี้ยงที่สแกน</Text>

      <View style={styles.searchBarBox}>
        <TextInput style={styles.searchBarInput} placeholder="ค้นหาชื่อสัตว์เลี้ยงที่เคยสแกน" placeholderTextColor="#999" />
      </View>

      <TouchableOpacity style={styles.scannedPetCard} activeOpacity={0.8} onPress={() => setViewMode('detail')}>
        <View style={styles.petAvatarCircle}>
          <MaterialCommunityIcons name="dog" size={36} color="#8EB4D0" />
        </View>
        <View style={styles.scannedPetInfo}>
          <Text style={styles.scannedPetName}>{petData.name}</Text>
          <Text style={styles.scannedPetSub}>{petData.species}</Text>
          <Text style={styles.scannedPetSub}>พันธุ์ {petData.breed}</Text>
          <View style={styles.tagRow}>
            <View style={styles.tagGray}><Text style={styles.tagGrayText}>{petData.age}</Text></View>
            <View style={styles.tagBlue}><Text style={styles.tagBlueText}>{petData.weight}</Text></View>
            <View style={styles.tagGreen}><Text style={styles.tagGreenText}>ยืนยันแล้ว</Text></View>
          </View>
        </View>
        <MaterialCommunityIcons name="arrow-right-circle" size={28} color="#00C853" />
      </TouchableOpacity>
    </View>
  );

  // ข้อมูล (Info Tab)
  const renderInfoTab = () => (
    <View style={styles.tabBodyContainer}>

      {/* กราฟแนวโน้มน้ำหนัก */}
      <View style={styles.cardBox}>
        <Text style={styles.cardBoxTitleBlue}>📈 แนวโน้มน้ำหนัก (ทั้งหมด)</Text>
        <View style={styles.mockChartBox}>
          <View style={{ height: 110, borderLeftWidth: 1, borderBottomWidth: 1, borderColor: '#EAEAEC', flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-around', paddingBottom: 10 }}>
            {[21, 22, 22.5, 23, 23.5, 24, 25].map((val, idx) => (
              <View key={idx} style={{ alignItems: 'center' }}>
                {/* ตัวเลขบอกน้ำหนัก */}
                <Text style={{ fontSize: 10, color: '#1976D2', fontWeight: 'bold', marginBottom: 4 }}>{val}</Text>
                {/* แท่งกราฟ */}
                <View style={{ width: 8, height: (val - 15) * 6, backgroundColor: '#2F80ED', borderRadius: 4 }} />
              </View>
            ))}
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginTop: 8 }}>
            {['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.'].map(m => <Text key={m} style={{ fontSize: 11, color: '#888', fontWeight: '600' }}>{m}</Text>)}
          </View>
        </View>
      </View>

      {/* กราฟสถิติการรับบริการ */}
      <View style={styles.cardBox}>
        <Text style={styles.cardBoxTitleGreen}>⚡ สถิติการรับบริการ(ทั้งหมด)</Text>
        <View style={styles.mockBarChartBox}>
          <View style={styles.mockBarCol}>
            <Text style={{ fontSize: 12, color: '#999', fontWeight: 'bold', marginBottom: 4 }}>0</Text>
            <View style={[styles.mockBar, { height: 6, backgroundColor: '#E0E0E0' }]} />
            <Text style={styles.mockBarLabel}>ตรวจสุขภาพ</Text>
          </View>
          <View style={styles.mockBarCol}>
            <Text style={{ fontSize: 12, color: '#00C853', fontWeight: 'bold', marginBottom: 4 }}>1</Text>
            <View style={[styles.mockBar, { height: 45, backgroundColor: '#00C853' }]} />
            <Text style={styles.mockBarLabel}>ฉีดวัคซีน</Text>
          </View>
          <View style={styles.mockBarCol}>
            <Text style={{ fontSize: 12, color: '#999', fontWeight: 'bold', marginBottom: 4 }}>0</Text>
            <View style={[styles.mockBar, { height: 6, backgroundColor: '#E0E0E0' }]} />
            <Text style={styles.mockBarLabel}>รักษาโรค</Text>
          </View>
        </View>
      </View>

      {/* ข้อมูลพื้นฐาน (แก้ไขได้) */}
      <View style={styles.cardBox}>
        <View style={styles.rowBetweenHeader}>
          <Text style={styles.cardBoxTitleBlack}>ข้อมูลพื้นฐาน</Text>

          {/* แก้ไข / บันทึก */}
          {!isEditingInfo ? (
            <TouchableOpacity style={styles.editBadgeBtn} onPress={() => { setEditForm({ ...petData }); setIsEditingInfo(true); }}>
              <Text style={styles.editBadgeText}>แก้ไข</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.saveBadgeBtn} onPress={handleSaveInfo}>
              <Text style={styles.saveBadgeText}>บันทึก</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabelText}>สายพันธุ์ (ชนิด)</Text>
          {!isEditingInfo ? <Text style={styles.infoValueText}>{petData.species}</Text>
            : <TextInput style={styles.editInput} value={editForm.species} onChangeText={t => setEditForm({ ...editForm, species: t })} />}
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabelText}>พันธุ์</Text>
          {!isEditingInfo ? <Text style={styles.infoValueText}>{petData.breed}</Text>
            : <TextInput style={styles.editInput} value={editForm.breed} onChangeText={t => setEditForm({ ...editForm, breed: t })} />}
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabelText}>อายุ</Text>
          {!isEditingInfo ? <Text style={styles.infoValueText}>{petData.age}</Text>
            : <TextInput style={styles.editInput} value={editForm.age} onChangeText={t => setEditForm({ ...editForm, age: t })} />}
        </View>
        <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
          <Text style={styles.infoLabelText}>น้ำหนัก</Text>
          {!isEditingInfo ? <Text style={styles.infoValueText}>{petData.weight}</Text>
            : <TextInput style={styles.editInput} value={editForm.weight} onChangeText={t => setEditForm({ ...editForm, weight: t })} />}
        </View>
      </View>
    </View>
  );


  // แท็บประวัติ
  const renderHistoryTab = () => (
    <View style={styles.tabBodyContainer}>
      <View style={styles.rowBetweenHeader}>
        <View style={styles.rowTitleIcon}>
          <Feather name="link" size={18} color="#00B862" style={{ marginRight: 6 }} />
          <Text style={styles.sectionHeadingText}>ประวัติการรักษา</Text>
        </View>
        <TouchableOpacity style={styles.greenAddButton} onPress={() => setModalHistoryVisible(true)}>
          <Text style={styles.greenAddText}>เพิ่มประวัติใหม่</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.historyCard}>
        <View style={styles.historyCardHeader}>
          <View style={styles.historyTitleRow}>
            <Text style={styles.historyTitleText}>วัคซีนพิษสุนัขบ้า</Text>
            <View style={styles.badgeVaccine}><Text style={styles.badgeVaccineText}>Vaccine</Text></View>
          </View>
          <View style={styles.historyActionsRow}>
            <TouchableOpacity onPress={() => alert('แก้ไขประวัติ')} style={{ marginRight: 12 }}>
              <Feather name="edit" size={18} color="#2F80ED" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => alert('ลบประวัติ')}>
              <Feather name="trash-2" size={18} color="#EB5757" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.historyDetailBox}>
          <Text style={styles.historyDetailText}>ฉีดวัคซีนประจำปี</Text>
        </View>
        <View style={styles.historyFooterRow}>
          <Text style={styles.historyDateText}>11-04-2025</Text>
          <View>
            <Text style={styles.historyVetText}>โดย น.สพ. สมพง • คลินิกรักษาสัตว์ HappyPet</Text>
            <Text style={styles.historyPriceText}>250 บาท</Text>
          </View>
        </View>
      </View>
    </View>
  );

  // แท็บนัดหมาย
  const renderAppointmentTab = () => (
    <View style={styles.tabBodyContainer}>
      <View style={styles.rowBetweenHeader}>
        <View style={styles.rowTitleIcon}>
          <Feather name="calendar" size={18} color="#FF6B00" style={{ marginRight: 6 }} />
          <Text style={styles.sectionHeadingText}>นัดหมาย</Text>
        </View>
        <TouchableOpacity style={styles.orangeAddButton} onPress={() => setModalApptVisible(true)}>
          <Text style={styles.orangeAddText}>เพิ่มนัด</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.apptCard}>
        <View style={styles.apptCardHeader}>
          <Text style={styles.apptTitleText}>ตรวจสุขภาพประจำปี</Text>
          <TouchableOpacity onPress={() => alert('ลบนัดหมาย')}><Text style={{ color: '#999', fontSize: 12 }}>ลบ</Text></TouchableOpacity>
        </View>
        <View style={styles.apptBadgeDate}>
          <Feather name="calendar" size={13} color="#FF6B00" style={{ marginRight: 6 }} />
          <Text style={styles.apptBadgeText}>11-04-2026 เวลา 14:00น.</Text>
        </View>
        <Text style={styles.apptPlaceText}>ที่ คลินิกรักษาสัตว์ HappyPet</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container} edges={['left', 'right']}>
      <StatusBar barStyle="light-content" backgroundColor="#00B862" />

      {/* Header หลัก */}
      <View style={styles.headerBar}>
        <View style={styles.headerLeft}>
          <MaterialCommunityIcons name="plus-box" size={20} color="#FFFFFF" />
          <Text style={styles.clinicNameText}>{clinicInfo.clinicName}</Text>
        </View>
        <Text style={styles.vetNameText}>{clinicInfo.vetName}</Text>
      </View>

      {viewMode === 'list' ? renderScannedListView() : (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>

          {/* ข้อมูลสัตว์เลี้ยงด้านบน */}
          <View style={styles.petHeaderBanner}>
            <TouchableOpacity onPress={() => setViewMode('list')} style={{ marginRight: 16 }}>
              <Feather name="arrow-left" size={24} color="#00C853" />
            </TouchableOpacity>
            <View style={styles.petAvatarSmall}>
              <MaterialCommunityIcons name="dog" size={28} color="#8EB4D0" />
            </View>
            <View style={styles.petHeaderInfo}>
              <Text style={styles.petHeaderName}>{petData.name}</Text>
              <Text style={styles.petHeaderSub}>{petData.subTitle}</Text>
            </View>
            <View style={styles.petWeightBox}>
              <Text style={styles.petWeightLabel}>น้ำหนัก</Text>
              <Text style={styles.petWeightVal}>{petData.weight}</Text>
            </View>
          </View>

          {/* tab ข้อมูล ประวัติ นัด */}
          <View style={styles.topTabBar}>
            <TouchableOpacity style={[styles.topTabItem, activeTab === 'info' && styles.topTabActive]} onPress={() => setActiveTab('info')}>
              <Text style={[styles.topTabText, activeTab === 'info' && styles.topTabTextActive]}>ข้อมูล</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.topTabItem, activeTab === 'history' && styles.topTabActive]} onPress={() => setActiveTab('history')}>
              <Text style={[styles.topTabText, activeTab === 'history' && styles.topTabTextActive]}>ประวัติ(1)</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.topTabItem, activeTab === 'appointment' && styles.topTabActive]} onPress={() => setActiveTab('appointment')}>
              <Text style={[styles.topTabText, activeTab === 'appointment' && styles.topTabTextActive]}>นัด(1)</Text>
            </TouchableOpacity>
          </View>

          {activeTab === 'info' && renderInfoTab()}
          {activeTab === 'history' && renderHistoryTab()}
          {activeTab === 'appointment' && renderAppointmentTab()}
          <View style={{ height: 40 }} />
        </ScrollView>
      )}

      {/* ประวัติการรักษา */}
      <Modal visible={modalHistoryVisible} transparent={true} animationType="fade" onRequestClose={() => setModalHistoryVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalWhiteBox}>
            <View style={{ marginBottom: 16 }}>
              <Text style={styles.modalTitleGreen}>เพิ่มประวัติการรักษา</Text>
            </View>

            <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
              <View style={styles.formRowTwoCol}>
                <View style={{ flex: 1, marginRight: 6 }}>
                  <Text style={styles.modalLabelText}>ประเภท</Text>
                  <View style={styles.modalInputBox}>
                    <Text style={{ fontSize: 13, color: '#333' }}>ตรวจสุขภาพ</Text>
                    <Feather name="chevron-down" size={16} color="#00C853" />
                  </View>
                </View>
                <View style={{ flex: 1, marginLeft: 6 }}>
                  <Text style={styles.modalLabelText}>วันที่</Text>
                  <View style={styles.modalInputBox}>
                    <Text style={{ fontSize: 13, color: '#333' }}>05/12/2026</Text>
                    <Feather name="calendar" size={16} color="#00C853" />
                  </View>
                </View>
              </View>

              <Text style={styles.modalLabelText}>หัวข้อการรักษา</Text>
              <TextInput style={styles.modalTextInput} placeholder="เช่น ตรวจสุขภาพประจำปี" />

              <Text style={styles.modalLabelText}>รายละเอียดผลการตรวจ/การรักษา</Text>
              <TextInput style={[styles.modalTextInput, { height: 80, textAlignVertical: 'top' }]} placeholder="ระบุอาการ ผลการตรวจ..." multiline />

              <Text style={styles.modalLabelText}>ค่าใช้จ่าย(บาท)</Text>
              <TextInput style={styles.modalTextInput} placeholder="0" keyboardType="numeric" />

              <Text style={styles.modalLabelText}>เชื่อมกับนัด</Text>
              <View style={[styles.modalInputBox, { marginBottom: 20 }]}>
                <Text style={{ fontSize: 13, color: '#333' }}>-ไม่มีนัด-</Text>
                <Feather name="chevron-down" size={16} color="#00C853" />
              </View>
            </ScrollView>

            <View style={styles.modalButtonRightRow}>
              <TouchableOpacity style={styles.modalGrayCancelBtn} onPress={() => setModalHistoryVisible(false)}>
                <Text style={styles.modalGrayCancelText}>ยกเลิก</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalGreenSubmitBtn} onPress={() => { Alert.alert('สำเร็จ', 'เพิ่มประวัติแล้ว'); setModalHistoryVisible(false); }}>
                <Text style={styles.modalGreenSubmitText}>บันทึก</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* เพิ่มนัดหมาย*/}
      <Modal visible={modalApptVisible} transparent={true} animationType="fade" onRequestClose={() => setModalApptVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalWhiteBox}>
            <View style={[styles.modalHeaderRow, { borderBottomWidth: 0, paddingBottom: 0 }]}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Feather name="calendar" size={18} color="#FF6B00" style={{ marginRight: 8 }} />
                <Text style={styles.modalTitleOrange}>นัดหมาย</Text>
              </View>
              <TouchableOpacity onPress={() => setModalApptVisible(false)}>
                <Text style={{ fontSize: 12, color: '#999' }}>ยกเลิก</Text>
              </TouchableOpacity>
            </View>

            <View style={{ paddingVertical: 10 }}>
              <Text style={styles.modalLabelText}>หัวข้อนัดหมาย</Text>
              <TextInput style={styles.modalTextInput} placeholder="เช่น นัดฉีดวัคซีน 2 เข็ม" />

              <View style={styles.formRowTwoCol}>
                <View style={{ flex: 1, marginRight: 6 }}>
                  <Text style={styles.modalLabelText}>วันที่</Text>
                  <View style={[styles.modalInputBox, { borderColor: '#FF6B00' }]}>
                    <Text style={{ fontSize: 13, color: '#333' }}>05/12/2026</Text>
                    <Feather name="calendar" size={16} color="#FF6B00" />
                  </View>
                </View>
                <View style={{ flex: 1, marginLeft: 6 }}>
                  <Text style={styles.modalLabelText}>เวลา</Text>
                  <View style={[styles.modalInputBox, { borderColor: '#FF6B00' }]}>
                    <Text style={{ fontSize: 13, color: '#333' }}>10:00 AM</Text>
                    <Feather name="clock" size={16} color="#FF6B00" />
                  </View>
                </View>
              </View>

              <TouchableOpacity style={styles.modalOrangeSubmitBtn} onPress={() => { Alert.alert('สำเร็จ', 'บันทึกการนัดหมายเรียบร้อย'); setModalApptVisible(false); }}>
                <Text style={styles.modalOrangeSubmitText}>บันทึกการนัดหมาย</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  headerBar: { backgroundColor: '#00B862', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 12, paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 12 : 14 },
  headerLeft: { flexDirection: 'row', alignItems: 'center' },
  clinicNameText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold', marginLeft: 6 },
  vetNameText: { color: '#FFFFFF', fontSize: 14, fontWeight: '500' },
  scrollView: { flex: 1 },

  // List View
  containerInner: { flex: 1, padding: 16 },
  pageMainTitle: { fontSize: 18, fontWeight: 'bold', color: '#00B862', marginBottom: 16 },
  searchBarBox: { backgroundColor: '#FFFFFF', borderRadius: 12, paddingHorizontal: 16, height: 48, justifyContent: 'center', marginBottom: 16, borderWidth: 1, borderColor: '#EAEAEC' },
  searchBarInput: { fontSize: 14 },
  scannedPetCard: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#EAEAEC', elevation: 1 },
  petAvatarCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#E8F1F5', alignItems: 'center', justifyContent: 'center', marginRight: 14 },
  scannedPetInfo: { flex: 1 },
  scannedPetName: { fontSize: 16, fontWeight: 'bold', color: '#00B862' },
  scannedPetSub: { fontSize: 12, color: '#666' },
  tagRow: { flexDirection: 'row', marginTop: 6 },
  tagGray: { backgroundColor: '#E8F5E9', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, marginRight: 4 },
  tagGrayText: { fontSize: 10, color: '#00C853' },
  tagBlue: { backgroundColor: '#E3F2FD', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, marginRight: 4 },
  tagBlueText: { fontSize: 10, color: '#1976D2' },
  tagGreen: { backgroundColor: '#E8F5E9', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  tagGreenText: { fontSize: 10, color: '#00C853', fontWeight: 'bold' },

  // Detail View Header
  petHeaderBanner: { backgroundColor: '#FFFFFF', flexDirection: 'row', alignItems: 'center', padding: 16 },
  petAvatarSmall: { width: 50, height: 50, borderRadius: 25, backgroundColor: '#E8F1F5', alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  petHeaderInfo: { flex: 1 },
  petHeaderName: { fontSize: 18, fontWeight: 'bold', color: '#1A1A1A' },
  petHeaderSub: { fontSize: 12, color: '#1A1A1A', fontWeight: 'bold' },
  petWeightBox: { alignItems: 'flex-end' },
  petWeightLabel: { fontSize: 11, color: '#888' },
  petWeightVal: { fontSize: 14, fontWeight: 'bold', color: '#1A1A1A' },

  // Tabs
  topTabBar: { flexDirection: 'row', backgroundColor: '#FFFFFF', borderBottomWidth: 1, borderBottomColor: '#EAEAEC' },
  topTabItem: { flex: 1, paddingVertical: 14, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  topTabActive: { borderBottomColor: '#00B862' },
  topTabText: { fontSize: 14, color: '#888', fontWeight: 'bold' },
  topTabTextActive: { color: '#00B862' },
  tabBodyContainer: { padding: 16 },

  // Info Tab
  cardBox: { backgroundColor: '#FFFFFF', borderRadius: 12, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: '#EAEAEC' },
  cardBoxTitleBlue: { fontSize: 16, fontWeight: 'bold', color: '#1976D2', marginBottom: 16 },
  cardBoxTitleGreen: { fontSize: 16, fontWeight: 'bold', color: '#00C853', marginBottom: 16 },
  cardBoxTitleBlack: { fontSize: 16, fontWeight: 'bold', color: '#1A1A1A' },
  mockBarChartBox: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'flex-end', height: 110, paddingTop: 10 },
  mockBarCol: { alignItems: 'center', flex: 1 },
  mockBar: { width: 32, borderRadius: 4, marginBottom: 8 },
  mockBarLabel: { fontSize: 10, color: '#888', textAlign: 'center' },

  // ข้อมูลที่แก้ไขได้
  rowBetweenHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  editBadgeBtn: { backgroundColor: '#00C853', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 6 },
  editBadgeText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  saveBadgeBtn: { backgroundColor: '#FF6B00', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 6 },
  saveBadgeText: { color: '#FFF', fontSize: 12, fontWeight: 'bold' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F5F5F5' },
  infoLabelText: { fontSize: 13, color: '#888' },
  infoValueText: { fontSize: 13, fontWeight: 'bold', color: '#1A1A1A' },
  editInput: { backgroundColor: '#F0F0F0', borderRadius: 6, paddingHorizontal: 10, height: 32, fontSize: 13, color: '#1A1A1A', minWidth: 120, textAlign: 'right' },

  // History Tab
  rowTitleIcon: { flexDirection: 'row', alignItems: 'center' },
  sectionHeadingText: { fontSize: 16, fontWeight: 'bold', color: '#1A1A1A' },
  greenAddButton: { backgroundColor: '#00C853', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16 },
  greenAddText: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },
  historyCard: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#EAEAEC', marginBottom: 12 },
  historyCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  historyTitleRow: { flexDirection: 'row', alignItems: 'center' },
  historyTitleText: { fontSize: 16, fontWeight: 'bold', color: '#1A1A1A', marginRight: 8 },
  badgeVaccine: { backgroundColor: '#E8F5E9', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  badgeVaccineText: { color: '#00C853', fontSize: 10, fontWeight: 'bold' },
  historyActionsRow: { flexDirection: 'row' },
  historyDetailBox: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#EAEAEC', padding: 10, borderRadius: 8, marginBottom: 12 },
  historyDetailText: { fontSize: 13, color: '#4A4A4A' },
  historyFooterRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  historyDateText: { fontSize: 12, color: '#888' },
  historyVetText: { fontSize: 11, color: '#00C853', fontWeight: 'bold', textAlign: 'right' },
  historyPriceText: { fontSize: 14, fontWeight: 'bold', color: '#00C853', textAlign: 'right', marginTop: 4 },

  // Appointment Tab
  orangeAddButton: { backgroundColor: '#FF6B00', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16 },
  orangeAddText: { color: '#FFFFFF', fontSize: 12, fontWeight: 'bold' },
  apptCard: { backgroundColor: '#FFFFFF', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#FFE0B2', borderLeftWidth: 5, borderLeftColor: '#FF6B00', marginBottom: 12 },
  apptCardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  apptTitleText: { fontSize: 16, fontWeight: 'bold', color: '#FF6B00' },
  apptBadgeDate: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF3E0', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8, marginBottom: 8 },
  apptBadgeText: { color: '#FF6B00', fontSize: 12, fontWeight: 'bold' },
  apptPlaceText: { fontSize: 12, color: '#888' },

  // Modals (Green & Orange)
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.5)', justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  modalWhiteBox: { width: '100%', backgroundColor: '#FFFFFF', borderRadius: 16, padding: 20 },
  modalHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalTitleGreen: { fontSize: 16, fontWeight: 'bold', color: '#00C853' },
  modalTitleOrange: { fontSize: 16, fontWeight: 'bold', color: '#FF6B00' },
  modalLabelText: { fontSize: 12, fontWeight: 'bold', color: '#333', marginBottom: 6, marginTop: 10 },
  formRowTwoCol: { flexDirection: 'row', justifyContent: 'space-between' },
  modalInputBox: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFF', borderWidth: 1, borderColor: '#00C853', height: 42, borderRadius: 10, paddingHorizontal: 12 },
  modalTextInput: { backgroundColor: '#FFF', borderWidth: 1, borderColor: '#00C853', height: 42, borderRadius: 10, paddingHorizontal: 12, fontSize: 13, color: '#1A1A1A' },
  modalButtonRightRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 16 },
  modalGrayCancelBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 10, backgroundColor: '#EAEAEC', marginRight: 10 },
  modalGrayCancelText: { color: '#666', fontWeight: 'bold', fontSize: 13 },
  modalGreenSubmitBtn: { paddingHorizontal: 24, paddingVertical: 10, borderRadius: 10, backgroundColor: '#00C853' },
  modalGreenSubmitText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 13 },
  modalOrangeSubmitBtn: { backgroundColor: '#FF6B00', height: 46, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginTop: 20 },
  modalOrangeSubmitText: { color: '#FFFFFF', fontWeight: 'bold', fontSize: 15 },
});
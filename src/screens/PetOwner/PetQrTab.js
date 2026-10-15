import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Alert, Switch } from 'react-native';
import { Feather } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { API_URL } from '../../config';

export default function PetQrTab({ pet, onResetQr, isResettingQr }) {
  const qrSvgRef = useRef();
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);

  const [settings, setSettings] = useState({
    Pet_name: false,
    Animal_type: false,
    species: false,
    weight: false,
    birthdate: false,
    detail: false,
    Pet_owner_name: false,
    email: false,
    phone: false,
  });

  useEffect(() => {
    if (pet?.pet_id) {
      fetchShowQrSettings();
    }
  }, [pet?.pet_id]);

  const fetchShowQrSettings = async () => {
    try {
      const response = await fetch(`${API_URL}/pets/showqr/${pet.pet_id}`);
      if (response.ok) {
        const data = await response.json();
        // ดึงค่าจริงจากดาต้าเบสมาเปิดค้างไว้ตามสถานะ True/False
        setSettings({
          Pet_name: Boolean(data.Pet_name),
          Animal_type: Boolean(data.Animal_type),
          species: Boolean(data.species),
          weight: Boolean(data.weight),
          birthdate: Boolean(data.birthdate),
          detail: Boolean(data.detail),
          Pet_owner_name: Boolean(data.Pet_owner_name),
          email: Boolean(data.email),
          phone: Boolean(data.phone),
        });
      }
    } catch (error) {
      console.log('Fetch ShowQr Error:', error);
    } finally {
      setLoadingSettings(false);
    }
  };

  const handleToggle = (field) => {
    setSettings(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    try {
      const response = await fetch(`${API_URL}/pets/showqr/${pet.pet_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      const result = await response.json();

      if (response.ok) {
        Alert.alert('สำเร็จ', 'บันทึกการตั้งค่าการแสดงผลสำเร็จ');
      } else {
        Alert.alert('เกิดข้อผิดพลาด', result.message || 'ไม่สามารถบันทึกการตั้งค่าได้');
      }
    } catch (error) {
      console.log('Save ShowQr Network Error:', error);
      Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
    } finally {
      setSavingSettings(false);
    }
  };

  const handleSaveOrShareQr = async () => {
    if (!qrSvgRef.current) {
      Alert.alert('แจ้งเตือน', 'ไม่พบรูปภาพ QR Code');
      return;
    }

    qrSvgRef.current.toDataURL(async (dataURL) => {
      try {
        const filename = `pet_qr_${pet?.pet_id}.png`;
        const fileUri = `${FileSystem.cacheDirectory}${filename}`;

        await FileSystem.writeAsStringAsync(fileUri, dataURL, {
          encoding: FileSystem.EncodingType.Base64,
        });

        if (await Sharing.isAvailableAsync()) {
          await Sharing.shareAsync(fileUri, {
            mimeType: 'image/png',
            dialogTitle: 'บันทึกหรือแชร์ QR Code สัตว์เลี้ยง',
            UTI: 'image/png',
          });
        } else {
          Alert.alert('แจ้งเตือน', 'อุปกรณ์นี้ไม่รองรับการแชร์หรือบันทึกรูปภาพ');
        }
      } catch (err) {
        console.log('Share QR Error:', err);
        Alert.alert('เกิดข้อผิดพลาด', 'ไม่สามารถดำเนินการได้');
      }
    });
  };

  // URL สำหรับลิงก์เว็บสาธารณะเมื่อสแกน QR Code  /////////////////////////////////////////////
  const publicWebUrl = `http://localhost:3001/guest/pet/${pet?.qr_code || pet?.pet_id}`;

  return (
    <View style={{ paddingBottom: 30 }}>
      {/* ส่วนแสดง QR Code */}
      <View style={styles.qrCardContainer}>
        <View style={styles.qrTopBar} />
        <View style={styles.qrInnerBox}>
          <QRCode
            value={publicWebUrl}
            size={180}
            color="#1A2D3E"
            backgroundColor="#FFF"
            getRef={(ref) => (qrSvgRef.current = ref)}
          />
        </View>
        <Text style={styles.qrPetName}>{pet?.pet_name}</Text>
        <Text style={styles.qrSubText}>สแกนเพื่อดูข้อมูลฉุกเฉิน</Text>
      </View>

      <TouchableOpacity style={styles.saveQrBtn} onPress={handleSaveOrShareQr} activeOpacity={0.8}>
        <Feather name="share-2" size={16} color="#FFF" style={{ marginRight: 6 }} />
        <Text style={styles.saveQrBtnText}>บันทึกหรือแชร์ QR Code</Text>
      </TouchableOpacity>

      {/* ปุ่มรีเซ็ตคิวอาร์โค้ด (สร้าง QR Code ใหม่) */}
      <View style={styles.resetCard}>
        <View style={styles.resetTitleRow}>
          <Feather name="refresh-cw" size={16} color="#B36B15" />
          <Text style={styles.resetTitle}> รีเซ็ตคิวอาร์โค้ด</Text>
        </View>
        <Text style={styles.resetSub}>สร้าง QR Code ใหม่ (โค้ดเดิมจะไม่สามารถใช้ได้อีกต่อไป)</Text>
        <TouchableOpacity style={styles.resetActionBtn} onPress={onResetQr} disabled={isResettingQr}>
          {isResettingQr ? (
            <ActivityIndicator size="small" color="#9A3412" />
          ) : (
            <>
              <Feather name="refresh-cw" size={14} color="#B36B15" style={{ marginRight: 6 }} />
              <Text style={styles.resetActionBtnText}>รีเซ็ตคิวอาร์โค้ด</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* ส่วนตั้งค่าข้อมูลสาธารณะ (สวิตช์ภาษาไทยเปิดค้างตามดาต้าเบส) */}
      <Text style={styles.sectionHeaderTitle}>ข้อมูลที่แสดง สาธารณะ</Text>

      <View style={styles.configCard}>
        {loadingSettings ? (
          <ActivityIndicator size="small" color="#0056D2" style={{ marginVertical: 20 }} />
        ) : (
          <>
            <Text style={styles.groupTitle}>ข้อมูลสัตว์เลี้ยง</Text>

            <SwitchItem label="ชื่อสัตว์เลี้ยง" value={settings.Pet_name} onToggle={() => handleToggle('Pet_name')} />
            <SwitchItem label="ชนิดสัตว์" value={settings.Animal_type} onToggle={() => handleToggle('Animal_type')} />
            <SwitchItem label="สายพันธุ์" value={settings.species} onToggle={() => handleToggle('species')} />
            <SwitchItem label="น้ำหนัก" value={settings.weight} onToggle={() => handleToggle('weight')} />
            <SwitchItem label="อายุ / วันเกิด" value={settings.birthdate} onToggle={() => handleToggle('birthdate')} />
            <SwitchItem label="ข้อควรระวัง / แพ้ยา" value={settings.detail} onToggle={() => handleToggle('detail')} />

            <Text style={[styles.groupTitle, { marginTop: 15 }]}>ข้อมูลเจ้าของ</Text>

            <SwitchItem label="ชื่อ-นามสกุล" value={settings.Pet_owner_name} onToggle={() => handleToggle('Pet_owner_name')} />
            <SwitchItem label="อีเมล" value={settings.email} onToggle={() => handleToggle('email')} />
            <SwitchItem label="เบอร์โทร" value={settings.phone} onToggle={() => handleToggle('phone')} />

            <TouchableOpacity
              style={styles.submitConfigBtn}
              onPress={handleSaveSettings}
              disabled={savingSettings}
            >
              {savingSettings ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={styles.submitConfigBtnText}>แก้ไข / บันทึก</Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </View>

      <Text style={styles.footerWarning}>
        <Feather name="alert-circle" size={12} color="#E53E3E" /> หมายเหตุ : ระวังการเปิดเผยข้อมูลส่วนตัว
      </Text>
    </View>
  );
}

function SwitchItem({ label, value, onToggle }) {
  return (
    <View style={styles.switchRow}>
      <Text style={styles.switchLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#D0D0D0', true: '#90CDF4' }}
        thumbColor={value ? '#0056D2' : '#f4f3f4'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  qrCardContainer: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2EBF0',
    overflow: 'hidden',
  },
  qrTopBar: { position: 'absolute', top: 0, left: 0, right: 0, height: 5, backgroundColor: '#3B82F6' },
  qrInnerBox: { padding: 12, marginBottom: 16 },
  qrPetName: { fontSize: 16, fontWeight: 'bold', color: '#20435C' },
  qrSubText: { fontSize: 12, color: '#7E909E', marginTop: 4 },

  saveQrBtn: {
    backgroundColor: '#3B82F6',
    borderRadius: 10,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  saveQrBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },

  resetCard: { backgroundColor: '#FFF7ED', borderWidth: 1, borderColor: '#FED7AA', borderRadius: 12, padding: 14, marginBottom: 20 },
  resetTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  resetTitle: { fontSize: 14, fontWeight: 'bold', color: '#9A3412' },
  resetSub: { fontSize: 11, color: '#C2410C', marginBottom: 10 },
  resetActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FDBA74',
    borderRadius: 8,
    paddingVertical: 8,
    backgroundColor: '#FFF',
  },
  resetActionBtnText: { color: '#9A3412', fontWeight: 'bold', fontSize: 13 },

  sectionHeaderTitle: { fontSize: 14, fontWeight: 'bold', color: '#333', marginBottom: 10 },

  configCard: {
    backgroundColor: '#FFF',
    borderWidth: 2,
    borderColor: '#3B82F6',
    borderRadius: 16,
    padding: 16,
    marginBottom: 15,
  },
  groupTitle: { fontSize: 14, fontWeight: 'bold', color: '#20435C', marginBottom: 8 },

  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  switchLabel: { fontSize: 14, color: '#333' },

  submitConfigBtn: {
    backgroundColor: '#0056D2',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  submitConfigBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },

  footerWarning: { fontSize: 11, color: '#E53E3E', textAlign: 'center', marginTop: 5 }
});
import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator, Alert, Switch } from 'react-native';
import { Feather } from '@expo/vector-icons';
import QRCode from 'react-native-qrcode-svg';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { API_URL, GUEST_WEB_URL } from '../../config';

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
    setSettings((prev) => ({ ...prev, [field]: !prev[field] }));
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

  // กำหนดลิงก์ปลายทางชี้ไปที่ Vercel
  const publicWebUrl = `${GUEST_WEB_URL}/guest/pet/${pet?.qr_code || pet?.pet_id}`;

  return (
    <View style={styles.container}>
      {/* การ์ดแสดง QR Code */}
      <View style={styles.qrCardContainer}>
        <View style={styles.qrTopBar} />
        <View style={styles.qrInnerBox}>
          <QRCode
            value={publicWebUrl}
            size={180}
            color="#1E293B"
            backgroundColor="#FFF"
            getRef={(ref) => (qrSvgRef.current = ref)}
          />
        </View>
        <Text style={styles.qrPetName}>{pet?.pet_name}</Text>
        <Text style={styles.qrSubText}>สแกนเพื่อดูข้อมูลฉุกเฉินและข้อมูลติดต่อ</Text>
      </View>

      {/* ปุ่มแชร์ / บันทึก QR Code */}
      <TouchableOpacity style={styles.saveQrBtn} onPress={handleSaveOrShareQr} activeOpacity={0.85}>
        <Feather name="share-2" size={18} color="#FFF" style={{ marginRight: 8 }} />
        <Text style={styles.saveQrBtnText}>บันทึกหรือแชร์ QR Code</Text>
      </TouchableOpacity>

      {/* การ์ดรีเซ็ต QR Code */}
      <View style={styles.resetCard}>
        <View style={styles.resetTitleRow}>
          <Feather name="refresh-cw" size={16} color="#D97706" style={{ marginRight: 6 }} />
          <Text style={styles.resetTitle}>รีเซ็ตคิวอาร์โค้ด</Text>
        </View>
        <Text style={styles.resetSub}>หากสร้าง QR Code ใหม่ โค้ดเดิมจะไม่สามารถนำมาสแกนดูข้อมูลได้อีกต่อไป</Text>
        <TouchableOpacity
          style={styles.resetActionBtn}
          onPress={onResetQr}
          disabled={isResettingQr}
          activeOpacity={0.8}
        >
          {isResettingQr ? (
            <ActivityIndicator size="small" color="#D97706" />
          ) : (
            <>
              <Feather name="refresh-cw" size={14} color="#D97706" style={{ marginRight: 6 }} />
              <Text style={styles.resetActionBtnText}>สร้าง QR Code ใหม่</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* ตั้งค่าข้อมูลที่ต้องการให้แสดงผลสาธารณะ */}
      <View style={styles.sectionHeaderRow}>
        <Feather name="sliders" size={16} color="#20435C" style={{ marginRight: 6 }} />
        <Text style={styles.sectionHeaderTitle}>ตั้งค่าข้อมูลที่แสดงสาธารณะ</Text>
      </View>

      <View style={styles.configCard}>
        {loadingSettings ? (
          <ActivityIndicator size="small" color="#2563EB" style={{ marginVertical: 24 }} />
        ) : (
          <>
            <View style={styles.groupHeader}>
              <Feather name="heart" size={14} color="#2563EB" style={{ marginRight: 6 }} />
              <Text style={styles.groupTitle}>ข้อมูลสัตว์เลี้ยง</Text>
            </View>

            <SwitchItem label="ชื่อสัตว์เลี้ยง" value={settings.Pet_name} onToggle={() => handleToggle('Pet_name')} />
            <SwitchItem label="ชนิดสัตว์" value={settings.Animal_type} onToggle={() => handleToggle('Animal_type')} />
            <SwitchItem label="สายพันธุ์" value={settings.species} onToggle={() => handleToggle('species')} />
            <SwitchItem label="น้ำหนัก" value={settings.weight} onToggle={() => handleToggle('weight')} />
            <SwitchItem label="อายุ / วันเกิด" value={settings.birthdate} onToggle={() => handleToggle('birthdate')} />
            <SwitchItem label="ข้อควรระวัง / แพ้ยา" value={settings.detail} onToggle={() => handleToggle('detail')} />

            <View style={[styles.groupHeader, { marginTop: 18 }]}>
              <Feather name="user" size={14} color="#2563EB" style={{ marginRight: 6 }} />
              <Text style={styles.groupTitle}>ข้อมูลเจ้าของ</Text>
            </View>

            <SwitchItem label="ชื่อ-นามสกุล" value={settings.Pet_owner_name} onToggle={() => handleToggle('Pet_owner_name')} />
            <SwitchItem label="อีเมล" value={settings.email} onToggle={() => handleToggle('email')} />
            <SwitchItem label="เบอร์โทรศัพท์" value={settings.phone} onToggle={() => handleToggle('phone')} isLast />

            <TouchableOpacity
              style={styles.submitConfigBtn}
              onPress={handleSaveSettings}
              disabled={savingSettings}
              activeOpacity={0.85}
            >
              {savingSettings ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <Text style={styles.submitConfigBtnText}>บันทึกการตั้งค่า</Text>
              )}
            </TouchableOpacity>
          </>
        )}
      </View>

      {/* แถบแจ้งเตือนความปลอดภัย */}
      <View style={styles.warningBanner}>
        <Feather name="alert-circle" size={14} color="#DC2626" style={{ marginRight: 6 }} />
        <Text style={styles.footerWarning}>
          โปรดระมัดระวังการเปิดเผยข้อมูลติดต่อส่วนบุคคลสู่สาธารณะ
        </Text>
      </View>
    </View>
  );
}

function SwitchItem({ label, value, onToggle, isLast }) {
  return (
    <View style={[styles.switchRow, isLast && styles.switchRowLast]}>
      <Text style={styles.switchLabel}>{label}</Text>
      <Switch
        value={value}
        onValueChange={onToggle}
        trackColor={{ false: '#CBD5E1', true: '#93C5FD' }}
        thumbColor={value ? '#2563EB' : '#FFFFFF'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { paddingBottom: 30 },
  qrCardContainer: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  qrTopBar: { position: 'absolute', top: 0, left: 0, right: 0, height: 4, backgroundColor: '#2563EB' },
  qrInnerBox: {
    padding: 14,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    marginBottom: 12,
  },
  qrPetName: { fontSize: 18, fontWeight: 'bold', color: '#1E293B' },
  qrSubText: { fontSize: 12, color: '#64748B', marginTop: 4 },

  saveQrBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 12,
    height: 48,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    shadowColor: '#2563EB',
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },
  saveQrBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 15 },

  resetCard: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 14,
    padding: 14,
    marginBottom: 18,
  },
  resetTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  resetTitle: { fontSize: 14, fontWeight: 'bold', color: '#B45309' },
  resetSub: { fontSize: 12, color: '#92400E', marginBottom: 10, lineHeight: 18 },
  resetActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FCD34D',
    borderRadius: 8,
    height: 38,
    backgroundColor: '#FFF',
  },
  resetActionBtnText: { color: '#B45309', fontWeight: 'bold', fontSize: 13 },

  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  sectionHeaderTitle: { fontSize: 15, fontWeight: 'bold', color: '#20435C' },

  configCard: {
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  groupTitle: { fontSize: 14, fontWeight: 'bold', color: '#1E293B' },

  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  switchRowLast: { borderBottomWidth: 0 },
  switchLabel: { fontSize: 14, color: '#334155', fontWeight: '500' },

  submitConfigBtn: {
    backgroundColor: '#2563EB',
    borderRadius: 10,
    height: 46,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
  },
  submitConfigBtnText: { color: '#FFF', fontWeight: 'bold', fontSize: 14 },

  warningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 10,
    padding: 10,
  },
  footerWarning: { fontSize: 11, color: '#991B1B', fontWeight: '500' },
});
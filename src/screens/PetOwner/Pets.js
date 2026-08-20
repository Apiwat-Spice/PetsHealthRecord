import React, { useState, useCallback } from 'react';
import { StatusBar } from "expo-status-bar";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, ActivityIndicator, Image } from "react-native";
import { useFocusEffect } from '@react-navigation/native'; // 🟢 ใช้สำหรับรีเฟรชหน้าตอนสลับกลับมา
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '../../config'; // 🟢 อย่าลืมเช็ก path ของ config ให้ถูกต้อง

export default function Pets({ navigation }) {
  const [pets, setPets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // ฟังก์ชันดึงข้อมูลสัตว์เลี้ยงจาก Backend
  const fetchPets = async () => {
    try {
      setIsLoading(true);

      // 1. ดึง ID เจ้าของจากเครื่อง
      const ownerString = await SecureStore.getItemAsync("pet_owners");
      if (!ownerString) {
        setIsLoading(false);
        return;
      }

      const ownerData = JSON.parse(ownerString);
      const ownerId = ownerData.pet_owners_id;

      // 🟢 2. แก้ไข URL ตรงนี้ (ลบ /api ออก เพราะ API_URL มีให้แล้ว)
      const response = await fetch(`${API_URL}/pets/${ownerId}`);

      // 🟢 3. ดักจับข้อความแบบดิบๆ ก่อน เผื่อ Backend ส่ง HTML (404) กลับมา
      const responseText = await response.text();

      let result;
      try {
        result = JSON.parse(responseText);
      } catch (e) {
        console.log("❌ ข้อความจาก Server (ไม่ใช่ JSON):", responseText);
        throw new Error(`เซิร์ฟเวอร์ไม่ได้ส่งข้อมูล JSON กลับมา (Status: ${response.status}) \n\nอย่าลืมกด Restart เซิร์ฟเวอร์ Node.js ด้วยนะครับ`);
      }

      if (response.ok) {
        setPets(result.pets); // นำข้อมูลไปเก็บใน State
      } else {
        console.error("ดึงข้อมูลไม่สำเร็จ:", result.message);
      }
    } catch (error) {
      console.error("Fetch Pets Error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // ดึงข้อมูลใหม่ทุกครั้งที่ผู้ใช้เปิดเข้ามาหน้านี้ (รวมถึงตอนเพิ่งเพิ่มสัตว์เลี้ยงเสร็จด้วย)
  useFocusEffect(
    useCallback(() => {
      fetchPets();
    }, [])
  );

  // ฟังก์ชันสุ่ม Emoji ตามชนิดสัตว์เลี้ยง
  const getAnimalEmoji = (type) => {
    const t = type ? type.toLowerCase() : '';
    if (t.includes('cat') || t.includes('แมว')) return '🐱';
    if (t.includes('rabbit') || t.includes('กระต่าย')) return '🐰';
    if (t.includes('bird') || t.includes('นก')) return '🐦';
    return '🐶'; // ค่าเริ่มต้นถ้าเป็นหมาหรืออื่นๆ
  };

  return (
    <ScrollView style={styles.container}>
      <StatusBar style="dark" />

      <View style={styles.header}>
        <Text style={styles.title}>My Pets</Text>

        {/* ปุ่มเพิ่มสัตว์เลี้ยง */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddPetScreen')}
        >
          <Text style={styles.addButtonText}>+ Add Pet</Text>
        </TouchableOpacity>
      </View>

      {/* ถ้ากำลังโหลด ให้โชว์วงกลมหมุนๆ */}
      {isLoading ? (
        <ActivityIndicator size="large" color="#4F8EF7" style={{ marginTop: 50 }} />
      ) : pets.length === 0 ? (
        /* ถ้าโหลดเสร็จแล้ว แต่ไม่มีสัตว์เลี้ยงเลย */
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>ยังไม่มีสัตว์เลี้ยง</Text>
          <Text style={styles.emptySubText}>กดปุ่ม + Add Pet เพื่อเพิ่มสัตว์เลี้ยงได้เลย!</Text>
        </View>
      ) : (
        /* โชว์ข้อมูลจริงจากการ วนลูป (map) */
        pets.map((pet, index) => (
          <View style={styles.card} key={pet.pet_id || index}>
            <View style={styles.imagePlaceholder}>
              {pet.pet_image_url ? (
                <Image source={{ uri: pet.pet_image_url }} style={styles.petImage} />
              ) : (
                <Text style={styles.imageText}>{getAnimalEmoji(pet.animal_type)}</Text>
              )}
            </View>

            <View style={styles.info}>
              <Text style={styles.petName}>{pet.pet_name}</Text>
              <Text style={styles.detail}>Animal Type : {pet.animal_type}</Text>
              <Text style={styles.detail}>Species : {pet.species || '-'}</Text>
              <Text style={styles.detail}>Sex : {pet.sex === 'male' ? 'Male ♂' : pet.sex === 'female' ? 'Female ♀' : '-'}</Text>

              {/* ถ้ามีวันเกิด โชว์วันเกิด */}
              {pet.birth_date && (
                <Text style={styles.detail}>Birth Date : {pet.birth_date}</Text>
              )}

              <TouchableOpacity style={styles.detailButton}>
                <Text style={styles.buttonText}>View Detail</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}

      <View style={{ height: 30 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F7FA",
    paddingHorizontal: 20,
  },
  header: {
    marginTop: 60,
    marginBottom: 25,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },
  addButton: {
    backgroundColor: "#4F8EF7",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    flexDirection: "row",
    marginBottom: 20,
    elevation: 3,
  },
  imagePlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#E6F0FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
    overflow: "hidden", // 🟢 เพิ่มบรรทัดนี้ เพื่อไม่ให้รูปเหลี่ยมๆ ล้นขอบวงกลมออกมา
  },
  // 🟢 เพิ่มสไตล์สำหรับรูปภาพ
  petImage: {
    width: '100%',
    height: '100%',
  },
  imageText: {
    fontSize: 42,
  },
  info: {
    flex: 1,
  },
  petName: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 6,
  },
  detail: {
    color: "#666",
    marginBottom: 3,
    fontSize: 15,
  },
  detailButton: {
    marginTop: 10,
    backgroundColor: "#4F8EF7",
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  emptyContainer: {
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#888',
  },
  emptySubText: {
    fontSize: 14,
    color: '#aaa',
    marginTop: 8,
  }
});
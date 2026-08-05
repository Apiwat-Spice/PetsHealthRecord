import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from "react-native";

export default function Pets() {
  return (
    <ScrollView style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>My Pets</Text>

        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>+ Add Pet</Text>
        </TouchableOpacity>
      </View>

      {/* Pet Card 1 */}
      <View style={styles.card}>
        <View style={styles.imagePlaceholder}>
          <Text style={styles.imageText}>🐶</Text>
        </View>

        <View style={styles.info}>
          <Text style={styles.petName}>Lucky</Text>
          <Text style={styles.detail}>Species : Dog</Text>
          <Text style={styles.detail}>Breed : Golden Retriever</Text>
          <Text style={styles.detail}>Gender : Male</Text>
          <Text style={styles.detail}>Age : 3 Years</Text>

          <TouchableOpacity style={styles.detailButton}>
            <Text style={styles.buttonText}>View Detail</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Pet Card 2 */}
      <View style={styles.card}>
        <View style={styles.imagePlaceholder}>
          <Text style={styles.imageText}>🐱</Text>
        </View>

        <View style={styles.info}>
          <Text style={styles.petName}>Momo</Text>
          <Text style={styles.detail}>Species : Cat</Text>
          <Text style={styles.detail}>Breed : British Shorthair</Text>
          <Text style={styles.detail}>Gender : Female</Text>
          <Text style={styles.detail}>Age : 2 Years</Text>

          <TouchableOpacity style={styles.detailButton}>
            <Text style={styles.buttonText}>View Detail</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Pet Card 3 */}
      <View style={styles.card}>
        <View style={styles.imagePlaceholder}>
          <Text style={styles.imageText}>🐰</Text>
        </View>

        <View style={styles.info}>
          <Text style={styles.petName}>Snow</Text>
          <Text style={styles.detail}>Species : Rabbit</Text>
          <Text style={styles.detail}>Breed : Holland Lop</Text>
          <Text style={styles.detail}>Gender : Female</Text>
          <Text style={styles.detail}>Age : 1 Year</Text>

          <TouchableOpacity style={styles.detailButton}>
            <Text style={styles.buttonText}>View Detail</Text>
          </TouchableOpacity>
        </View>
      </View>

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
});
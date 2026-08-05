import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
} from "react-native";

export default function Dashboard() {
  return (
    <ScrollView style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.greeting}>Hello 👋</Text>
        <Text style={styles.name}>Welcome Back!</Text>
      </View>

      {/* Summary */}
      <Text style={styles.sectionTitle}>Overview</Text>

      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>2</Text>
          <Text style={styles.summaryLabel}>Pets</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>1</Text>
          <Text style={styles.summaryLabel}>Appointments</Text>
        </View>
      </View>

      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>3</Text>
          <Text style={styles.summaryLabel}>Vaccines</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryNumber}>5</Text>
          <Text style={styles.summaryLabel}>Records</Text>
        </View>
      </View>

      {/* Appointment */}
      <Text style={styles.sectionTitle}>Upcoming Appointment</Text>

      <View style={styles.card}>
        <Text style={styles.petName}>🐶 Lucky</Text>
        <Text style={styles.cardText}>Happy Vet Clinic</Text>
        <Text style={styles.cardText}>12 August 2026</Text>
        <Text style={styles.cardText}>10:00 AM</Text>

        <TouchableOpacity style={styles.button}>
          <Text style={styles.buttonText}>View Detail</Text>
        </TouchableOpacity>
      </View>

      {/* Recent History */}
      <Text style={styles.sectionTitle}>Recent History</Text>

      <View style={styles.historyCard}>
        <Text style={styles.historyTitle}>Vaccination</Text>
        <Text style={styles.historyText}>Lucky received Rabies Vaccine</Text>
        <Text style={styles.historyDate}>20 Jul 2026</Text>
      </View>

      <View style={styles.historyCard}>
        <Text style={styles.historyTitle}>Weight Record</Text>
        <Text style={styles.historyText}>Lucky - 24.3 kg</Text>
        <Text style={styles.historyDate}>15 Jul 2026</Text>
      </View>

      <View style={styles.historyCard}>
        <Text style={styles.historyTitle}>General Checkup</Text>
        <Text style={styles.historyText}>Everything is normal.</Text>
        <Text style={styles.historyDate}>5 Jul 2026</Text>
      </View>

      <TouchableOpacity style={styles.allButton}>
        <Text style={styles.buttonText}>View All History</Text>
      </TouchableOpacity>

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
    marginBottom: 20,
  },

  greeting: {
    fontSize: 18,
    color: "#666",
  },

  name: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 5,
  },

  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 12,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
  },

  summaryCard: {
    width: "48%",
    backgroundColor: "#4F8EF7",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
  },

  summaryNumber: {
    fontSize: 28,
    color: "#fff",
    fontWeight: "bold",
  },

  summaryLabel: {
    color: "#fff",
    marginTop: 8,
    fontSize: 16,
  },

  card: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    elevation: 3,
  },

  petName: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 10,
  },

  cardText: {
    fontSize: 16,
    color: "#555",
    marginBottom: 5,
  },

  button: {
    backgroundColor: "#4F8EF7",
    marginTop: 15,
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },

  allButton: {
    backgroundColor: "#4F8EF7",
    marginTop: 15,
    marginBottom: 20,
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },

  historyCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 18,
    marginBottom: 12,
    elevation: 2,
  },

  historyTitle: {
    fontWeight: "bold",
    fontSize: 17,
    marginBottom: 5,
  },

  historyText: {
    color: "#666",
    fontSize: 15,
  },

  historyDate: {
    color: "#999",
    marginTop: 8,
    fontSize: 13,
  },
});
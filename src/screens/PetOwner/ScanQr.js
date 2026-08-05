import { StatusBar } from "expo-status-bar";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { useState } from "react";

export default function ScanQR() {
  const [qrCode, setQrCode] = useState("");

  const handleScan = () => {
    // Mockup ยังไม่มี API
    alert(`QR Code: ${qrCode || "Please enter code"}`);
  };

  return (
    <ScrollView style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <Text style={styles.title}>Scan QR Code</Text>
      <Text style={styles.subtitle}>
        Scan pet collar QR code to view pet information
      </Text>


      {/* Camera Mockup */}
      <View style={styles.cameraBox}>
        <Text style={styles.cameraIcon}>📷</Text>
        <Text style={styles.cameraText}>
          Camera Scanner
        </Text>

        <Text style={styles.cameraSubText}>
          QR Code Area
        </Text>
      </View>


      {/* Scan Button */}
      <TouchableOpacity style={styles.scanButton}>
        <Text style={styles.buttonText}>
          Scan QR
        </Text>
      </TouchableOpacity>


      {/* Divider */}
      <View style={styles.divider}>
        <Text style={styles.orText}>OR</Text>
      </View>


      {/* Manual Input */}
      <Text style={styles.label}>
        Enter QR Code Manually
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Example : PET-001234"
        value={qrCode}
        onChangeText={setQrCode}
      />


      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleScan}
      >
        <Text style={styles.buttonText}>
          Submit
        </Text>
      </TouchableOpacity>


      {/* Result Mockup */}
      <View style={styles.resultCard}>

        <Text style={styles.resultTitle}>
          Example Result
        </Text>

        <Text style={styles.resultText}>
          🐶 Lucky
        </Text>

        <Text style={styles.resultText}>
          Owner : John Doe
        </Text>

        <Text style={styles.resultText}>
          Breed : Golden Retriever
        </Text>

        <Text style={styles.resultText}>
          Emergency Contact Available
        </Text>

      </View>

      <View style={{height:30}} />

    </ScrollView>
  );
}


const styles = StyleSheet.create({

  container:{
    flex:1,
    backgroundColor:"#F5F7FA",
    paddingHorizontal:20,
  },


  title:{
    marginTop:60,
    fontSize:28,
    fontWeight:"bold",
  },


  subtitle:{
    marginTop:8,
    color:"#666",
    fontSize:15,
  },


  cameraBox:{
    height:280,
    marginTop:30,
    backgroundColor:"#222",
    borderRadius:20,
    justifyContent:"center",
    alignItems:"center",
  },


  cameraIcon:{
    fontSize:60,
  },


  cameraText:{
    color:"#fff",
    fontSize:22,
    fontWeight:"bold",
    marginTop:15,
  },


  cameraSubText:{
    color:"#ccc",
    marginTop:5,
  },


  scanButton:{
    backgroundColor:"#4F8EF7",
    padding:15,
    borderRadius:12,
    alignItems:"center",
    marginTop:20,
  },


  divider:{
    alignItems:"center",
    marginVertical:25,
  },


  orText:{
    color:"#888",
    fontWeight:"bold",
  },


  label:{
    fontSize:17,
    fontWeight:"bold",
    marginBottom:10,
  },


  input:{
    backgroundColor:"#fff",
    padding:15,
    borderRadius:12,
    fontSize:16,
    borderWidth:1,
    borderColor:"#ddd",
  },


  submitButton:{
    backgroundColor:"#10B981",
    padding:15,
    borderRadius:12,
    alignItems:"center",
    marginTop:15,
  },


  buttonText:{
    color:"#fff",
    fontWeight:"bold",
    fontSize:16,
  },


  resultCard:{
    backgroundColor:"#fff",
    marginTop:25,
    padding:20,
    borderRadius:15,
    elevation:2,
  },


  resultTitle:{
    fontSize:20,
    fontWeight:"bold",
    marginBottom:10,
  },


  resultText:{
    fontSize:16,
    marginBottom:8,
    color:"#555",
  }

});
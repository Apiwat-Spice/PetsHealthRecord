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

export default function SearchClinic() {
  const [search, setSearch] = useState("");

  const clinics = [
    {
      id: 1,
      name: "Happy Vet Clinic",
      location: "Nakhon Pathom",
      rating: "★★★★★",
      open: "Open 09:00 - 20:00",
    },
    {
      id: 2,
      name: "Pet Care Hospital",
      location: "Bangkok",
      rating: "★★★★☆",
      open: "Open 08:00 - 18:00",
    },
    {
      id: 3,
      name: "Animal Health Center",
      location: "Samut Sakhon",
      rating: "★★★★★",
      open: "Open 24 Hours",
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <Text style={styles.title}>
        Search Clinic
      </Text>

      <Text style={styles.subtitle}>
        Find veterinary clinics and book appointments
      </Text>


      {/* Search Box */}
      <View style={styles.searchBox}>
        <Text style={styles.icon}>
          🔍
        </Text>

        <TextInput
          style={styles.input}
          placeholder="Search clinic name..."
          value={search}
          onChangeText={setSearch}
        />
      </View>


      {/* Filter */}
      <View style={styles.filterRow}>

        <TouchableOpacity style={styles.filter}>
          <Text>
            📍 Location
          </Text>
        </TouchableOpacity>


        <TouchableOpacity style={styles.filter}>
          <Text>
            ⭐ Rating
          </Text>
        </TouchableOpacity>


        <TouchableOpacity style={styles.filter}>
          <Text>
            Distance
          </Text>
        </TouchableOpacity>

      </View>


      {/* Clinic List */}
      <Text style={styles.sectionTitle}>
        Nearby Clinics
      </Text>


      {
        clinics.map((clinic)=>(
          <View
            key={clinic.id}
            style={styles.card}
          >

            <View style={styles.clinicIcon}>
              <Text style={{fontSize:40}}>
                🏥
              </Text>
            </View>


            <View style={styles.info}>

              <Text style={styles.clinicName}>
                {clinic.name}
              </Text>


              <Text style={styles.detail}>
                📍 {clinic.location}
              </Text>


              <Text style={styles.detail}>
                {clinic.rating}
              </Text>


              <Text style={styles.detail}>
                🕒 {clinic.open}
              </Text>


              <TouchableOpacity
                style={styles.bookButton}
              >
                <Text style={styles.bookText}>
                  Book Appointment
                </Text>
              </TouchableOpacity>


            </View>

          </View>
        ))
      }


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
  },


  searchBox:{
    backgroundColor:"#fff",
    flexDirection:"row",
    alignItems:"center",
    paddingHorizontal:15,
    borderRadius:15,
    marginTop:25,
    height:55,
  },


  icon:{
    fontSize:20,
    marginRight:10,
  },


  input:{
    flex:1,
    fontSize:16,
  },


  filterRow:{
    flexDirection:"row",
    justifyContent:"space-between",
    marginTop:20,
  },


  filter:{
    backgroundColor:"#fff",
    padding:12,
    borderRadius:12,
    elevation:1,
  },


  sectionTitle:{
    fontSize:20,
    fontWeight:"bold",
    marginTop:25,
    marginBottom:15,
  },


  card:{
    backgroundColor:"#fff",
    borderRadius:15,
    padding:15,
    flexDirection:"row",
    marginBottom:15,
    elevation:2,
  },


  clinicIcon:{
    width:70,
    height:70,
    borderRadius:35,
    backgroundColor:"#E6F0FF",
    justifyContent:"center",
    alignItems:"center",
    marginRight:15,
  },


  info:{
    flex:1,
  },


  clinicName:{
    fontSize:19,
    fontWeight:"bold",
    marginBottom:5,
  },


  detail:{
    color:"#666",
    marginBottom:5,
  },


  bookButton:{
    backgroundColor:"#4F8EF7",
    padding:10,
    borderRadius:10,
    alignItems:"center",
    marginTop:10,
  },


  bookText:{
    color:"#fff",
    fontWeight:"bold",
  }

});
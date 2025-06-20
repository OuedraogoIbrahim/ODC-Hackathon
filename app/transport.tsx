import { MaterialIcons } from "@expo/vector-icons";
import * as Location from "expo-location";
import * as Network from "expo-network";
import * as Speech from "expo-speech";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Linking,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { agences } from "./mock-data/agences";
import { voyages } from "./mock-data/voyages";
import { voyagesSync } from "./mock-data/voyages-sync";

interface Voyage {
  id: number;
  agenceId: number;
  depart: string;
  arrivee: string;
  date: string; // ISO format : '2025-06-20'
  heure: string;
  prix: number;
  placesDisponibles: number;
}

interface Agence {
  id: number;
  nom: string;
  telephone: string;
  email: string;
  ville: string;
  latitude: number;
  longitude: number;
}

interface LocationCoords {
  latitude: number;
  longitude: number;
}

export default function TransportScreen() {
  const { t } = useTranslation();
  const [depart, setDepart] = useState<string>("");
  const [arrivee, setArrivee] = useState<string>("");
  const [dateVoyage, setDateVoyage] = useState("");
  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");
  const [filteredVoyages, setFilteredVoyages] = useState<Voyage[]>([]);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [selectedVoyage, setSelectedVoyage] = useState<Voyage | null>(null);
  const [userLocation, setUserLocation] = useState<LocationCoords | null>(null);
  const [isUserLoggedIn, setIsUserLoggedIn] = useState<boolean>(true); // Simulation de l'état de connexion
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Fonction pour calculer la distance en kilomètres avec la formule de Haversine
  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number => {
    const R = 6371; // Rayon de la Terre en km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return Number(distance.toFixed(1)); // Arrondi à 1 décimale
  };

  useEffect(() => {
    const initialize = async () => {
      Speech.speak(t("transport_screen_speak_welcome"));

      // Demander la permission de géolocalisation au chargement
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        try {
          const location = await Location.getCurrentPositionAsync({});
          setUserLocation({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
        } catch (error) {
          console.error(t("transport_screen_log_location_error"), error);
        }
      }

      // Simuler le chargement des données
      setTimeout(() => {
        setFilteredVoyages(voyages);
        setIsLoading(false);
      }, 1500);
    };

    initialize();
  }, []);

  useEffect(() => {
    if (!isLoading) {
      const filtered = voyages.filter((voyage) => {
        const matchDepart = depart
          ? voyage.depart.toLowerCase().includes(depart.toLowerCase())
          : true;
        const matchArrivee = arrivee
          ? voyage.arrivee.toLowerCase().includes(arrivee.toLowerCase())
          : true;
        const matchDate = dateVoyage ? voyage.date === dateVoyage : true;
        const matchMinPrice = minPrice
          ? voyage.prix >= parseFloat(minPrice) || isNaN(parseFloat(minPrice))
          : true;
        const matchMaxPrice = maxPrice
          ? voyage.prix <= parseFloat(maxPrice) || isNaN(parseFloat(maxPrice))
          : true;

        return (
          matchDepart &&
          matchArrivee &&
          matchDate &&
          matchMinPrice &&
          matchMaxPrice
        );
      });

      setFilteredVoyages(filtered);
    }
  }, [depart, arrivee, dateVoyage, minPrice, maxPrice, isLoading]);

  const getAgenceName = (agenceId: number): string => {
    const agence = agences.find((a) => a.id === agenceId);
    return agence ? agence.nom : t("transport_screen_unknown_agency");
  };

  const getAgenceCoords = (
    agenceId: number
  ): { latitude: number; longitude: number } | null => {
    const agence = agences.find((a) => a.id === agenceId);
    return agence
      ? { latitude: agence.latitude, longitude: agence.longitude }
      : null;
  };

  const getAgenceDistance = (agenceId: number): string => {
    if (!userLocation) return "";
    const coords = getAgenceCoords(agenceId);
    if (!coords) return "";
    const distance = calculateDistance(
      userLocation.latitude,
      userLocation.longitude,
      coords.latitude,
      coords.longitude
    );
    return `${distance} ${t("transport_screen_km")}`;
  };

  const handleVoyagePress = (voyage: Voyage) => {
    setSelectedVoyage(voyage);
    setModalVisible(true);
  };

  const requestLocationPermission = async (): Promise<boolean> => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === "granted";
  };

  const handleSync = async () => {
    if (!isUserLoggedIn) {
      Alert.alert(
        t("transport_screen_login_required"),
        t("transport_screen_login_required_message")
      );
      return;
    }

    setIsSyncing(true);

    try {
      const networkState = await Network.getNetworkStateAsync();
      const isConnected = networkState.isConnected;

      if (isConnected) {
        // Simuler la synchronisation avec la BDD
        setTimeout(() => {
          // Remplacer les données existantes par les nouvelles
          voyages.length = 0; // Vider le tableau original
          voyages.push(...voyagesSync); // Remplacer par les nouvelles données
          setFilteredVoyages([...voyagesSync]);
          setIsSyncing(false);
          Speech.speak(t("transport_screen_speak_sync_success"));
          Alert.alert(
            t("transport_screen_success"),
            t("transport_screen_sync_success")
          );
        }, 2000);
      } else {
        // Simuler une synchronisation hors ligne
        setTimeout(() => {
          setIsSyncing(false);
          Speech.speak(t("transport_screen_speak_offline_sync"));
          Alert.alert(
            t("transport_screen_offline"),
            t("transport_screen_offline_sync_message")
          );
        }, 2000);
      }
    } catch (error) {
      setIsSyncing(false);
      Speech.speak(t("transport_screen_speak_sync_error"));
      Alert.alert(
        t("transport_screen_error"),
        t("transport_screen_sync_error")
      );
    }
  };

  const handleItinerary = async () => {
    if (!selectedVoyage) return;

    const agence = agences.find((a) => a.id === selectedVoyage.agenceId);
    if (!agence) {
      Speech.speak(t("transport_screen_speak_agency_coords_error"));
      return;
    }

    let permissionGranted = await requestLocationPermission();

    if (!permissionGranted) {
      Speech.speak(t("transport_screen_speak_location_denied"));
      Alert.alert(
        t("transport_screen_permission_denied"),
        t("transport_screen_permission_denied_message"),
        [
          {
            text: t("transport_screen_retry"),
            onPress: async () => {
              permissionGranted = await requestLocationPermission();
              if (permissionGranted) {
                await handleItinerary();
              } else {
                Speech.speak(t("transport_screen_speak_location_denied_again"));
                Alert.alert(
                  t("transport_screen_permission_denied"),
                  t("transport_screen_permission_denied_settings")
                );
              }
            },
          },
          {
            text: t("transport_screen_cancel"),
            style: "cancel",
            onPress: () => setModalVisible(false),
          },
        ]
      );
      return;
    }

    try {
      let location = await Location.getCurrentPositionAsync({});
      const userLat = location.coords.latitude;
      const userLon = location.coords.longitude;
      const coords = getAgenceCoords(selectedVoyage.agenceId);
      if (!coords) return;

      const { latitude: destLat, longitude: destLon } = coords;
      const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&origin=${userLat},${userLon}&destination=${destLat},${destLon}&travelmode=driving`;
      const supported = await Linking.canOpenURL(googleMapsUrl);

      if (supported) {
        await Linking.openURL(googleMapsUrl);
        Speech.speak(
          t("transport_screen_speak_open_itinerary", {
            agencyName: getAgenceName(selectedVoyage.agenceId),
          })
        );
      } else {
        Speech.speak(t("transport_screen_speak_map_app_error"));
        Alert.alert(
          t("transport_screen_error"),
          t("transport_screen_map_app_error")
        );
      }
    } catch (error) {
      Speech.speak(t("transport_screen_speak_location_error"));
      Alert.alert(
        t("transport_screen_error"),
        t("transport_screen_location_error")
      );
    }

    setModalVisible(false);
  };

  const handleReserve = () => {
    if (selectedVoyage) {
      Speech.speak(
        t("transport_screen_speak_reservation_success", {
          date: selectedVoyage.date,
          heure: selectedVoyage.heure,
        })
      );
      setModalVisible(false);
    }
  };

  const handleFavorite = () => {
    if (selectedVoyage) {
      if (!favorites.includes(selectedVoyage.agenceId)) {
        setFavorites([...favorites, selectedVoyage.agenceId]);
        Speech.speak(t("transport_screen_speak_add_favorite"));
      } else {
        Speech.speak(t("transport_screen_speak_already_favorite"));
      }
      setModalVisible(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t("transport_screen_title")}</Text>
        <TouchableOpacity onPress={handleSync} disabled={isSyncing}>
          <MaterialIcons
            name="sync"
            size={28}
            color={isSyncing ? "#aaa" : "#F28C38"}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.filterSection}>
        <Text style={styles.filterTitle}>
          {t("transport_screen_filter_title")}
        </Text>
        <TextInput
          style={styles.input}
          placeholder={t("transport_screen_departure_placeholder")}
          value={depart}
          onChangeText={setDepart}
        />
        <TextInput
          style={styles.input}
          placeholder={t("transport_screen_arrival_placeholder")}
          value={arrivee}
          onChangeText={setArrivee}
        />
        <TextInput
          style={styles.input}
          placeholder={t("transport_screen_date_placeholder")}
          value={dateVoyage}
          onChangeText={setDateVoyage}
        />
        {/* <TextInput
          style={styles.input}
          placeholder={t("transport_screen_min_price_placeholder")}
          value={minPrice}
          onChangeText={setMinPrice}
          keyboardType="numeric"
        />
        <TextInput
          style={styles.input}
          placeholder={t("transport_screen_max_price_placeholder")}
          value={maxPrice}
          onChangeText={setMaxPrice}
          keyboardType="numeric"
        /> */}
      </View>

      <Text style={styles.resultTitle}>
        {t("transport_screen_results_title")}
      </Text>

      {isSyncing && (
        <View style={styles.syncLoaderContainer}>
          <ActivityIndicator size="large" color="#F28C38" />
          <Text style={styles.syncLoaderText}>
            {t("transport_screen_syncing")}
          </Text>
        </View>
      )}

      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#F28C38" />
          <Text style={styles.loaderText}>{t("transport_screen_loading")}</Text>
        </View>
      ) : (
        <FlatList
          data={filteredVoyages}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={
            <Text style={styles.empty}>{t("transport_screen_no_voyages")}</Text>
          }
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleVoyagePress(item)}>
              <View style={styles.card}>
                <MaterialIcons
                  name="directions-bus"
                  size={30}
                  color="#F28C38"
                />
                <View style={styles.cardContent}>
                  <Text style={styles.cardTitle}>
                    {item.depart} ➜ {item.arrivee}
                  </Text>
                  <Text>
                    {t("transport_screen_date_label")} {item.date}{" "}
                    {t("transport_screen_at")} {item.heure}
                  </Text>
                  <Text>
                    {t("transport_screen_price_label")} {item.prix} FCFA
                  </Text>
                  <Text>
                    {t("transport_screen_available_seats_label")}{" "}
                    {item.placesDisponibles}
                  </Text>
                  <Text>
                    {t("transport_screen_agency_label")}{" "}
                    {getAgenceName(item.agenceId)}{" "}
                    {favorites.includes(item.agenceId) ? "⭐" : ""}
                  </Text>
                  {userLocation && (
                    <Text>
                      {t("transport_screen_distance_label")}{" "}
                      {getAgenceDistance(item.agenceId)}
                    </Text>
                  )}
                </View>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      {selectedVoyage && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>
                {selectedVoyage.depart} ➜ {selectedVoyage.arrivee}
              </Text>
              <Text style={styles.modalSubtitle}>
                {t("transport_screen_agency_label")}{" "}
                {getAgenceName(selectedVoyage.agenceId)}
              </Text>
              <Text style={styles.modalSubtitle}>
                {t("transport_screen_date_label")} {selectedVoyage.date}{" "}
                {t("transport_screen_at")} {selectedVoyage.heure}
              </Text>
              <Text style={styles.modalSubtitle}>
                {t("transport_screen_available_seats_label")}{" "}
                {selectedVoyage.placesDisponibles}
              </Text>
              <View style={styles.modalButtons}>
                <Pressable style={styles.modalButton} onPress={handleReserve}>
                  <MaterialIcons
                    name="shopping-cart"
                    size={24}
                    color="#F28C38"
                  />
                  <Text style={styles.modalButtonText}>
                    {t("transport_screen_reserve")}
                  </Text>
                </Pressable>
                <Pressable style={styles.modalButton} onPress={handleItinerary}>
                  <MaterialIcons name="map" size={24} color="#F28C38" />
                  <Text style={styles.modalButtonText}>
                    {t("transport_screen_view_itinerary")}
                  </Text>
                </Pressable>
                <Pressable style={styles.modalButton} onPress={handleFavorite}>
                  <MaterialIcons name="star" size={24} color="#F28C38" />
                  <Text style={styles.modalButtonText}>
                    {t("transport_screen_add_favorite")}
                  </Text>
                </Pressable>
                <Pressable
                  style={[styles.modalButton, styles.closeButton]}
                  onPress={() => setModalVisible(false)}
                >
                  <MaterialIcons name="close" size={24} color="#333" />
                  <Text style={styles.modalButtonText}>
                    {t("transport_screen_close")}
                  </Text>
                </Pressable>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
    backgroundColor: "#FFF",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#F28C38",
  },
  filterSection: {
    backgroundColor: "#F9F9F9",
    padding: 15,
    borderRadius: 10,
    marginBottom: 20,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#aaa",
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#FFF",
  },
  resultTitle: {
    fontSize: 18,
    marginVertical: 10,
    fontWeight: "bold",
    color: "#333",
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardContent: {
    flex: 1,
    marginLeft: 10,
  },
  cardTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 5,
  },
  empty: {
    textAlign: "center",
    color: "gray",
    marginTop: 20,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loaderText: {
    marginTop: 10,
    color: "#333",
    fontSize: 16,
  },
  syncLoaderContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    zIndex: 10,
  },
  syncLoaderText: {
    marginTop: 10,
    color: "#333",
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    padding: 20,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  modalSubtitle: {
    fontSize: 16,
    color: "#333",
    marginBottom: 5,
  },
  modalButtons: {
    marginTop: 20,
    width: "100%",
  },
  modalButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    marginVertical: 5,
    borderRadius: 8,
    backgroundColor: "#F9F9F9",
  },
  closeButton: {
    backgroundColor: "#FFF",
    borderWidth: 1,
    borderColor: "#ccc",
  },
  modalButtonText: {
    fontSize: 16,
    color: "#333",
    marginLeft: 10,
  },
});

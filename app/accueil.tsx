import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import * as Speech from "expo-speech";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import {
  Animated,
  StyleSheet,
  Text,
  TouchableOpacity,
  Vibration,
  View,
} from "react-native";

export default function AccueilScreen() {
  const { t } = useTranslation();
  const shakeA = useRef(new Animated.Value(0)).current;
  const shakeB = useRef(new Animated.Value(0)).current;

  const startShake = (animRef) => {
    Animated.sequence([
      Animated.timing(animRef, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(animRef, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(animRef, {
        toValue: 6,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(animRef, {
        toValue: -6,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(animRef, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // useEffect commenté inchangé
  useEffect(() => {
    const message = t("accueil_screen_welcome_message");
    Speech.speak(message, {
      onDone: () => {
        Speech.speak(t("accueil_screen_speak_transport"), {
          onStart: () => {
            startShake(shakeA);
            Vibration.vibrate([0, 200, 100, 200]);
          },
        });
        setTimeout(() => {
          Speech.speak(t("accueil_screen_speak_artisans"), {
            onStart: () => {
              startShake(shakeB);
              Vibration.vibrate([0, 200, 100, 200]);
            },
          });
        }, 2500);
        // setTimeout(() => {
        //   Speech.speak(t("accueil_screen_speak_sante"), {
        //     onStart: () => {
        //       startShake(shakeC);
        //       Vibration.vibrate([0, 200, 100, 200]);
        //     },
        //   });
        // }, 5000);
      },
    });
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("accueil_screen_title")}</Text>

      <View style={styles.servicesContainer}>
        <Animated.View
          style={[styles.serviceCard, { transform: [{ translateX: shakeA }] }]}
        >
          <MaterialIcons name="directions-bus" size={48} color="#F28C38" />
          <Text style={styles.serviceTitle}>
            {t("accueil_screen_transport_button")}
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push("/(tabs)/listeReservation")}
          >
            <Text style={styles.buttonText}>
              {t("accueil_screen_access_button") || "Accéder"}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View
          style={[styles.serviceCard, { transform: [{ translateX: shakeB }] }]}
        >
          <MaterialIcons name="build" size={48} color="#F28C38" />
          <Text style={styles.serviceTitle}>
            {t("accueil_screen_artisans_button")}
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push("/artisans")}
          >
            <Text style={styles.buttonText}>
              {t("accueil_screen_access_button") || "Accéder"}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* <Animated.View
          style={[styles.serviceCard, { transform: [{ translateX: shakeC }] }]}
        >
          <MaterialIcons name="directions-bus" size={48} color="#F28C38" />
          <Text style={styles.serviceTitle}>
            {t("accueil_screen_transport_button")}
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push("/test")}
          >
            <Text style={styles.buttonText}>
              {t("accueil_screen_access_button") || "Accéder"}
            </Text>
          </TouchableOpacity>
        </Animated.View> */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#F5F5F5", // Fond légèrement gris pour contraste
  },
  title: {
    fontSize: 28,
    textAlign: "center",
    marginVertical: 20,
    fontWeight: "700",
    color: "#F28C38",
  },
  servicesContainer: {
    flex: 1,
    flexDirection: "column", // Disposition verticale
    justifyContent: "flex-start",
  },
  serviceCard: {
    flexDirection: "column", // Contenu aligné verticalement dans la carte
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    padding: 20,
    marginVertical: 10, // Espacement vertical entre les cartes
    marginHorizontal: 5, // Petite marge horizontale
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  serviceTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginVertical: 10,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#F28C38",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 10,
    width: "80%", // Bouton occupant une large partie de la carte
    alignItems: "center",
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});

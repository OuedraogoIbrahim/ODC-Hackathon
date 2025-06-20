import { MaterialIcons } from "@expo/vector-icons";
import * as SQLite from "expo-sqlite";
import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  deleteReservation,
  initializeDatabase,
  Reservation,
  simulatePayment,
} from "../utils/database";

interface ReservationWithVoyage extends Reservation {
  depart: string;
  arrivee: string;
  date: string;
  heure: string;
  prix: number;
}

export default function MesReservations({ navigation }: { navigation: any }) {
  const { t } = useTranslation();
  const [db, setDb] = useState<SQLite.SQLiteDatabase | null>(null);
  const [reservations, setReservations] = useState<ReservationWithVoyage[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initialize = async () => {
      try {
        const database = await initializeDatabase();
        setDb(database);

        // Charger les réservations avec les détails des voyages
        const allReservations: ReservationWithVoyage[] =
          await database.getAllAsync(
            `
          SELECT r.*, v.depart, v.arrivee, v.date, v.heure, v.prix
          FROM reservations r
          JOIN voyages v ON r.voyageId = v.id
          WHERE r.status = ?
        `,
            ["pending"]
          );
        setReservations(allReservations);
        setIsLoading(false);
      } catch (error) {
        console.error("Erreur lors de l'initialisation:", error);
        Alert.alert(
          t("reservations_screen_error"),
          t("reservations_screen_load_error")
        );
        setIsLoading(false);
      }
    };
    initialize();
  }, []);

  const handlePayment = async (reservationId: number) => {
    if (!db) {
      Alert.alert(
        t("reservations_screen_error"),
        t("reservations_screen_db_not_initialized")
      );
      return;
    }

    try {
      await simulatePayment(db, reservationId);
      // Rafraîchir les réservations
      const allReservations: ReservationWithVoyage[] = await db.getAllAsync(
        `
        SELECT r.*, v.depart, v.arrivee, v.date, v.heure, v.prix
        FROM reservations r
        JOIN voyages v ON r.voyageId = v.id
        WHERE r.status = ?
      `,
        ["pending"]
      );
      setReservations(allReservations);
      Alert.alert(
        t("reservations_screen_success"),
        t("reservations_screen_payment_success")
      );
    } catch (error) {
      console.error("Erreur lors du paiement:", error);
      Alert.alert(
        t("reservations_screen_error"),
        t("reservations_screen_payment_error")
      );
    }
  };

  const handleDelete = async (reservationId: number) => {
    if (!db) {
      Alert.alert(
        t("reservations_screen_error"),
        t("reservations_screen_db_not_initialized")
      );
      return;
    }

    Alert.alert(
      t("reservations_screen_confirm_delete"),
      t("reservations_screen_delete_confirmation"),
      [
        {
          text: t("reservations_screen_cancel"),
          style: "cancel",
        },
        {
          text: t("reservations_screen_delete"),
          onPress: async () => {
            try {
              await deleteReservation(db, reservationId);
              // Rafraîchir les réservations
              const allReservations: ReservationWithVoyage[] =
                await db.getAllAsync(
                  `
                SELECT r.*, v.depart, v.arrivee, v.date, v.heure, v.prix
                FROM reservations r
                JOIN voyages v ON r.voyageId = v.id
                WHERE r.status = ?
              `,
                  ["pending"]
                );
              setReservations(allReservations);
              Alert.alert(
                t("reservations_screen_success"),
                t("reservations_screen_delete_success")
              );
            } catch (error) {
              console.error("Erreur lors de la suppression:", error);
              Alert.alert(
                t("reservations_screen_error"),
                t("reservations_screen_delete_error")
              );
            }
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: { item: ReservationWithVoyage }) => (
    <View style={styles.card}>
      <MaterialIcons name="directions-bus" size={30} color="#F28C38" />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>
          {item.depart} ➜ {item.arrivee}
        </Text>
        <Text>
          {t("reservations_screen_date_label")} {item.date}{" "}
          {t("reservations_screen_at")} {item.heure}
        </Text>
        <Text>
          {t("reservations_screen_unit_price_label")} {item.prix} FCFA
        </Text>
        <Text style={styles.prixTotal}>
          {t("reservations_screen_total_price_label")}{" "}
          {item.prix * item.nombrePlaces} FCFA
        </Text>
        <Text>
          {t("reservations_screen_reserved_seats_label")} {item.nombrePlaces}
        </Text>
        <View
          style={[
            styles.paymentStatus,
            item.paymentStatus === "paid"
              ? styles.paymentPaid
              : styles.paymentUnpaid,
          ]}
        >
          <Text
            style={[
              styles.paymentStatusText,
              item.paymentStatus === "paid"
                ? styles.paymentPaidText
                : styles.paymentUnpaidText,
            ]}
          >
            {t("reservations_screen_payment_label")}{" "}
            {item.paymentStatus === "paid"
              ? t("reservations_screen_paid")
              : t("reservations_screen_unpaid")}
          </Text>
        </View>
      </View>
      <View style={styles.cardActions}>
        {item.paymentStatus === "unpaid" && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handlePayment(item.id)}
          >
            <MaterialIcons name="payment" size={24} color="#F28C38" />
            <Text style={styles.actionText}>
              {t("reservations_screen_pay")}
            </Text>
          </TouchableOpacity>
        )}
        {item.paymentStatus === "unpaid" && (
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => handleDelete(item.id)}
          >
            <MaterialIcons name="delete" size={24} color="#F28C38" />
            <Text style={styles.actionText}>
              {t("reservations_screen_delete")}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("reservations_screen_title")}</Text>
      {isLoading ? (
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#F28C38" />
          <Text style={styles.loaderText}>
            {t("reservations_screen_loading")}
          </Text>
        </View>
      ) : (
        <FlatList
          data={reservations}
          keyExtractor={(item) => item.id.toString()}
          ListEmptyComponent={
            <Text style={styles.empty}>
              {t("reservations_screen_no_reservations")}
            </Text>
          }
          renderItem={renderItem}
        />
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
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#F28C38",
    marginBottom: 20,
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
  prixTotal: {
    fontWeight: "bold",
    fontSize: 14,
    color: "#C0392B", // Rouge sombre pour faire ressortir
    marginBottom: 5,
  },
  paymentStatus: {
    padding: 5,
    borderRadius: 5,
    marginTop: 5,
  },
  paymentPaid: {
    backgroundColor: "#E8F5E9", // Vert clair pour payé
  },
  paymentUnpaid: {
    backgroundColor: "#FFE0B2", // Orange clair pour non payé
  },
  paymentStatusText: {
    fontSize: 14,
  },
  paymentPaidText: {
    color: "#2E7D32", // Vert foncé pour payé
  },
  paymentUnpaidText: {
    color: "#F28C38", // Orange foncé pour non payé
  },
  cardActions: {
    flexDirection: "column",
    justifyContent: "space-between",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 8,
  },
  actionText: {
    marginLeft: 5,
    color: "#F28C38",
    fontSize: 14,
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
});

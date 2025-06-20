import * as SQLite from 'expo-sqlite';
import { initializeMockData } from './initMockData';

// Interface pour une réservation
export interface Reservation {
  id: number;
  voyageId: number;
  nombrePlaces: number;
  status: string;
  paymentStatus: string;
  createdAt: string;
}

// Interface pour un voyage
export interface Voyage {
  id: number;
  agenceId: number;
  depart: string;
  arrivee: string;
  date: string; // ISO format : '2025-06-20'
  heure: string;
  prix: number;
  placesDisponibles: number;
}

// Interface pour une agence
export interface Agence {
  id: number;
  nom: string;
  telephone: string;
  email: string;
  ville: string;
  latitude: number;
  longitude: number;
}

// Fonction pour initialiser la base de données SQLite
export async function initializeDatabase(): Promise<SQLite.SQLiteDatabase> {
  try {
    const db: SQLite.SQLiteDatabase = await SQLite.openDatabaseAsync('ODC-Hackathon');
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS agences (
        id INTEGER PRIMARY KEY NOT NULL,
        nom TEXT NOT NULL,
        telephone TEXT NOT NULL,
        email TEXT NOT NULL,
        ville TEXT NOT NULL,
        latitude REAL NOT NULL,
        longitude REAL NOT NULL
      );
      CREATE TABLE IF NOT EXISTS voyages (
        id INTEGER PRIMARY KEY NOT NULL,
        agenceId INTEGER NOT NULL,
        depart TEXT NOT NULL,
        arrivee TEXT NOT NULL,
        date TEXT NOT NULL,
        heure TEXT NOT NULL,
        prix INTEGER NOT NULL,
        placesDisponibles INTEGER NOT NULL,
        FOREIGN KEY (agenceId) REFERENCES agences(id)
      );
      CREATE TABLE IF NOT EXISTS reservations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        voyageId INTEGER NOT NULL,
        nombrePlaces INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        paymentStatus TEXT NOT NULL DEFAULT 'unpaid',
        createdAt TEXT NOT NULL,
        FOREIGN KEY (voyageId) REFERENCES voyages(id)
      );
    `);

    // Insérer les données mock
    await initializeMockData(db);

    console.log('Base de données ODC-Hackathon initialisée avec succès');
    return db;
  } catch (error) {
    console.error('Erreur lors de l\'initialisation de la base de données:', error);
    throw error;
  }
}

// Fonction pour récupérer tous les voyages
export async function getVoyages(db: SQLite.SQLiteDatabase): Promise<Voyage[]> {
  try {
    const allRows: Voyage[] = await db.getAllAsync('SELECT * FROM voyages');
    console.log('Voyages récupérés:', allRows.length);
    return allRows;
  } catch (error) {
    console.error('Erreur lors de la récupération des voyages:', error);
    throw error;
  }
}

// Fonction pour récupérer toutes les agences
export async function getAgences(db: SQLite.SQLiteDatabase): Promise<Agence[]> {
  try {
    const allRows: Agence[] = await db.getAllAsync('SELECT * FROM agences');
    console.log('Agences récupérées:', allRows.length);
    return allRows;
  } catch (error) {
    console.error('Erreur lors de la récupération des agences:', error);
    throw error;
  }
}

// Fonction pour modifier le nombre de places disponibles d'un voyage
export async function modifierNombrePlaces(
  db: SQLite.SQLiteDatabase,
  voyageId: number,
  nombrePlaces: number // Peut être positif (ajouter) ou négatif (retirer)
): Promise<void> {
  try {
    // Vérifier que le voyage existe
    const voyage: Voyage | null = await db.getFirstAsync('SELECT placesDisponibles FROM voyages WHERE id = ?', [voyageId]);
    if (!voyage) {
      throw new Error(`Voyage ${voyageId} non trouvé`);
    }

    // Vérifier que le nouveau nombre de places est valide
    const nouveauPlacesDisponibles = voyage.placesDisponibles + nombrePlaces;
    if (nouveauPlacesDisponibles < 0) {
      throw new Error(`Impossible de réserver: seulement ${voyage.placesDisponibles} places disponibles`);
    }

    // Mettre à jour placesDisponibles
    await db.runAsync(
      'UPDATE voyages SET placesDisponibles = ? WHERE id = ?',
      [nouveauPlacesDisponibles, voyageId]
    );
    console.log(`Places disponibles mises à jour pour le voyage ${voyageId}: ${nouveauPlacesDisponibles}`);
  } catch (error) {
    console.error('Erreur lors de la modification des places disponibles:', error);
    throw error;
  }
}

// Fonction pour insérer une nouvelle réservation (CREATE)
export async function addReservation(
  db: SQLite.SQLiteDatabase,
  reservation: { voyageId: number; nombrePlaces: number }
): Promise<number> {
  try {
    // Démarrer une transaction pour garantir la cohérence
    await db.runAsync('BEGIN TRANSACTION');

    // Vérifier les places disponibles et mettre à jour
    await modifierNombrePlaces(db, reservation.voyageId, -reservation.nombrePlaces);

    // Insérer la réservation
    const createdAt: string = new Date().toISOString();
    const result = await db.runAsync(
      'INSERT INTO reservations (voyageId, nombrePlaces, createdAt, paymentStatus) VALUES (?, ?, ?, ?)',
      [reservation.voyageId, reservation.nombrePlaces, createdAt, 'unpaid']
    );

    await db.runAsync('COMMIT');
    console.log('Réservation insérée avec l\'ID:', result.lastInsertRowId);
    return result.lastInsertRowId;
  } catch (error) {
    await db.runAsync('ROLLBACK');
    console.error('Erreur lors de l\'insertion de la réservation:', error);
    throw error;
  }
}

// Fonction pour récupérer toutes les réservations en attente (READ)
export async function getPendingReservations(db: SQLite.SQLiteDatabase): Promise<Reservation[]> {
  try {
    const allRows: Reservation[] = await db.getAllAsync('SELECT * FROM reservations WHERE status = ?', ['pending']);
    console.log('Réservations en attente récupérées:', allRows.length);
    return allRows;
  } catch (error) {
    console.error('Erreur lors de la récupération des réservations en attente:', error);
    throw error;
  }
}

// Fonction pour récupérer une réservation par ID (READ)
export async function getReservationById(db: SQLite.SQLiteDatabase, id: number): Promise<Reservation | null> {
  try {
    const row: Reservation | null = await db.getFirstAsync('SELECT * FROM reservations WHERE id = ?', [id]);
    if (!row) {
      console.log(`Aucune réservation trouvée pour l'ID: ${id}`);
      return null;
    }
    console.log('Réservation récupérée:', row);
    return row;
  } catch (error) {
    console.error('Erreur lors de la récupération de la réservation:', error);
    throw error;
  }
}

// Fonction pour mettre à jour une réservation (UPDATE)
export async function updateReservation(
  db: SQLite.SQLiteDatabase,
  id: number,
  updates: Partial<Reservation>
): Promise<void> {
  try {
    const { voyageId, nombrePlaces, status, paymentStatus } = updates;
    const fields: string[] = [];
    const values: (number | string)[] = [];

    if (voyageId !== undefined) {
      fields.push('voyageId = ?');
      values.push(voyageId);
    }
    if (nombrePlaces !== undefined) {
      fields.push('nombrePlaces = ?');
      values.push(nombrePlaces);
    }
    if (status !== undefined) {
      fields.push('status = ?');
      values.push(status);
    }
    if (paymentStatus !== undefined) {
      fields.push('paymentStatus = ?');
      values.push(paymentStatus);
    }

    if (fields.length === 0) {
      console.log('Aucune mise à jour fournie pour la réservation:', id);
      return;
    }

    values.push(id);
    const query = `UPDATE reservations SET ${fields.join(', ')} WHERE id = ?`;
    await db.runAsync(query, values);
    console.log(`Réservation ${id} mise à jour avec succès`);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la réservation:', error);
    throw error;
  }
}

// Fonction pour supprimer une réservation et restaurer les places (DELETE)
export async function deleteReservation(db: SQLite.SQLiteDatabase, id: number): Promise<void> {
  try {
    // Récupérer la réservation pour obtenir voyageId et nombrePlaces
    const reservation: Reservation | null = await getReservationById(db, id);
    if (!reservation) {
      throw new Error(`Réservation ${id} non trouvée`);
    }

    // Démarrer une transaction
    await db.runAsync('BEGIN TRANSACTION');

    // Restaurer les places disponibles
    await modifierNombrePlaces(db, reservation.voyageId, reservation.nombrePlaces);

    // Supprimer la réservation
    await db.runAsync('DELETE FROM reservations WHERE id = ?', [id]);

    await db.runAsync('COMMIT');
    console.log('Réservation supprimée:', id);
  } catch (error) {
    await db.runAsync('ROLLBACK');
    console.error('Erreur lors de la suppression de la réservation:', error);
    throw error;
  }
}

// Fonction pour simuler un paiement
export async function simulatePayment(db: SQLite.SQLiteDatabase, reservationId: number): Promise<void> {
  try {
    console.log(`Simulation de paiement pour la réservation ${reservationId}`);
    await db.runAsync(
      'UPDATE reservations SET paymentStatus = ? WHERE id = ?',
      ['paid', reservationId]
    );
    console.log(`Paiement simulé pour la réservation ${reservationId}`);
  } catch (error) {
    console.error('Erreur lors de la simulation du paiement:', error);
    throw error;
  }
}

// Fonction pour synchroniser les réservations avec l'API mock (commentée comme dans ton code)
// export async function syncReservations(db: SQLite.SQLiteDatabase): Promise<void> {
//   try {
//     const state = await import('@react-native-community/netinfo').then(NetInfo => NetInfo.default.fetch());
//     if (state.isConnected) {
//       const pending: Reservation[] = await getPendingReservations(db);
//       for (const reservation of pending) {
//         console.log(`Envoi de la réservation ${reservation.id} à l'API mock`);
//         // Simuler POST /reservations à l'API mock
//         await updateReservation(db, reservation.id, { status: 'synced' });
//       }
//       console.log('Synchronisation terminée');
//     } else {
//       console.log('Aucune connexion, synchronisation reportée');
//     }
//   } catch (error) {
//     console.error('Erreur lors de la synchronisation des réservations:', error);
//     throw error;
//   }
// }
import * as SQLite from 'expo-sqlite';
import { agences } from '../mock-data/agences';
import { voyagesSync } from '../mock-data/voyages-sync';

// Fonction pour insérer les données mock dans les tables agences et voyages
export async function initializeMockData(db: SQLite.SQLiteDatabase): Promise<void> {
  try {
    // Vérifier si la table agences est vide
    const agenceCount: { count: number } | null = await db.getFirstAsync('SELECT COUNT(*) as count FROM agences');
    if (agenceCount && agenceCount.count === 0) {
      for (const agence of agences) {
        await db.runAsync(
          'INSERT INTO agences (id, nom, telephone, email, ville, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?)',
          [
            agence.id,
            agence.nom,
            agence.telephone,
            agence.email,
            agence.ville,
            agence.latitude,
            agence.longitude,
          ]
        );
      }
      console.log(`Données mock insérées dans la table agences: ${agences.length} agences`);
    }

    // Vérifier si la table voyages est vide
    const voyageCount: { count: number } | null = await db.getFirstAsync('SELECT COUNT(*) as count FROM voyages');
    if (voyageCount && voyageCount.count === 0) {
      for (const voyage of voyagesSync) {
        await db.runAsync(
          'INSERT INTO voyages (id, agenceId, depart, arrivee, date, heure, prix, placesDisponibles) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [
            voyage.id,
            voyage.agenceId,
            voyage.depart,
            voyage.arrivee,
            voyage.date,
            voyage.heure,
            voyage.prix,
            voyage.placesDisponibles,
          ]
        );
      }
      console.log(`Données mock insérées dans la table voyages: ${voyagesSync.length} voyages`);
    }
  } catch (error) {
    console.error('Erreur lors de l\'insertion des données mock:', error);
    throw error;
  }
}
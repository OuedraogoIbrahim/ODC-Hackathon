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

export const voyages: Voyage[] = [
  {
    id: 1,
    agenceId: 1, // TSR
    depart: "Ouagadougou",
    arrivee: "Bobo-Dioulasso",
    date: "2025-06-20",
    heure: "07:30",
    prix: 7500,
    placesDisponibles: 15,
  },
  {
    id: 2,
    agenceId: 2, // Rakieta
    depart: "Bobo-Dioulasso",
    arrivee: "Koudougou",
    date: "2025-06-20",
    heure: "10:00",
    prix: 5000,
    placesDisponibles: 20,
  },
  {
    id: 3,
    agenceId: 3, // STAF
    depart: "Ouagadougou",
    arrivee: "Ouahigouya",
    date: "2025-06-21",
    heure: "08:00",
    prix: 8000,
    placesDisponibles: 10,
  },
  {
    id: 4,
    agenceId: 1, // TSR
    depart: "Ouagadougou",
    arrivee: "Banfora",
    date: "2025-06-20",
    heure: "09:00",
    prix: 9000,
    placesDisponibles: 12,
  },
  {
    id: 5,
    agenceId: 2, // Rakieta
    depart: "Bobo-Dioulasso",
    arrivee: "Ouagadougou",
    date: "2025-06-21",
    heure: "06:30",
    prix: 7500,
    placesDisponibles: 18,
  },
  {
    id: 6,
    agenceId: 3, // STAF
    depart: "Ouahigouya",
    arrivee: "Ouagadougou",
    date: "2025-06-22",
    heure: "11:00",
    prix: 8000,
    placesDisponibles: 8,
  },
  {
    id: 7,
    agenceId: 1, // TSR
    depart: "Ouagadougou",
    arrivee: "Koudougou",
    date: "2025-06-22",
    heure: "14:00",
    prix: 6000,
    placesDisponibles: 25,
  },
  {
    id: 8,
    agenceId: 2, // Rakieta
    depart: "Koudougou",
    arrivee: "Bobo-Dioulasso",
    date: "2025-06-23",
    heure: "08:30",
    prix: 5000,
    placesDisponibles: 14,
  },
];
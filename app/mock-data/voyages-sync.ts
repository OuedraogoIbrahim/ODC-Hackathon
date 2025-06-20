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
  
  export const voyagesSync: Voyage[] = [
    {
      id: 9,
      agenceId: 1, // TSR
      depart: "Ouagadougou",
      arrivee: "Dédougou",
      date: "2025-06-24",
      heure: "07:00",
      prix: 6500,
      placesDisponibles: 16,
    },
    {
      id: 10,
      agenceId: 2, // Rakieta
      depart: "Bobo-Dioulasso",
      arrivee: "Banfora",
      date: "2025-06-24",
      heure: "09:30",
      prix: 4000,
      placesDisponibles: 22,
    },
    {
      id: 11,
      agenceId: 3, // STAF
      depart: "Ouahigouya",
      arrivee: "Koudougou",
      date: "2025-06-25",
      heure: "10:00",
      prix: 7000,
      placesDisponibles: 10,
    },
    {
      id: 12,
      agenceId: 1, // TSR
      depart: "Ouagadougou",
      arrivee: "Fada N'gourma",
      date: "2025-06-25",
      heure: "08:00",
      prix: 8500,
      placesDisponibles: 14,
    },
    {
      id: 13,
      agenceId: 2, // Rakieta
      depart: "Koudougou",
      arrivee: "Ouagadougou",
      date: "2025-06-26",
      heure: "12:00",
      prix: 6000,
      placesDisponibles: 20,
    },
  ];
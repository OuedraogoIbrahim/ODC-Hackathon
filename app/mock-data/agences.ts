export interface Agence {
  id: number;
  nom: string;
  telephone: string;
  email: string;
  ville: string;
  latitude: number;
  longitude: number;
}

export const agences: Agence[] = [
  {
    id: 1,
    nom: "TSR",
    telephone: "+22670000001",
    email: "contact@tsr.bf",
    ville: "Ouagadougou",
    latitude: 12.371427,
    longitude: -1.519660,
  },
  {
    id: 2,
    nom: "Rakieta",
    telephone: "+22670000002",
    email: "info@rakieta.bf",
    ville: "Bobo-Dioulasso",
    latitude: 11.177150,
    longitude: -4.297900,
  },
  {
    id: 3,
    nom: "STAF",
    telephone: "+22670000003",
    email: "support@staf.bf",
    ville: "Ouagadougou",
    latitude: 12.364637,
    longitude: -1.538144,
  },
];
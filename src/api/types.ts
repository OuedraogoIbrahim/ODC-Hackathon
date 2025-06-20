// Types pour l'API des artisans
export interface Artisan {
  id: number;
  nom: string;
  metier: 'plombier' | 'electricien' | 'macon' | 'couturier' | 'menuisier';
  ville: string;
  quartier: string;
  contact: string;
  whatsapp: boolean;
  note: number;
  commentaires: Commentaire[];
}

export interface Commentaire {
  id: number;
  contenu: string;
  date: string;
}

export interface ArtisanFilters {
  metier?: string;
  ville?: string;
  quartier?: string;
}

export interface CreateArtisanData {
  nom: string;
  metier: string;
  ville: string;
  quartier: string;
  contact: string;
  whatsapp?: boolean;
  note?: number;
}

export interface CreateCommentaireData {
  artisan: number;
  contenu: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  status: number;
} 
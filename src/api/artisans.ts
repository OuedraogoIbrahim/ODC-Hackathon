import { apiClient } from './client';
import { API_CONFIG, buildQueryParams } from './config';
import { 
  Artisan, 
  Commentaire, 
  ArtisanFilters, 
  CreateArtisanData, 
  CreateCommentaireData 
} from './types';

// Service pour les artisans
export class ArtisansService {
  // Récupérer tous les artisans
  static async getAllArtisans(): Promise<Artisan[]> {
    const response = await apiClient.get<Artisan[]>(API_CONFIG.ENDPOINTS.ARTISANS);
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    return response.data || [];
  }

  // Récupérer un artisan par ID
  static async getArtisanById(id: number): Promise<Artisan> {
    const response = await apiClient.get<Artisan>(`${API_CONFIG.ENDPOINTS.ARTISANS}${id}/`);
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    if (!response.data) {
      throw new Error('Artisan not found');
    }
    
    return response.data;
  }

  // Filtrer les artisans
  static async filterArtisans(filters: ArtisanFilters): Promise<Artisan[]> {
    const queryParams = buildQueryParams(filters);
    const endpoint = `${API_CONFIG.ENDPOINTS.ARTISANS}${queryParams}`;
    
    const response = await apiClient.get<Artisan[]>(endpoint);
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    return response.data || [];
  }

  // Créer un nouvel artisan
  static async createArtisan(artisanData: CreateArtisanData): Promise<Artisan> {
    const response = await apiClient.post<Artisan>(API_CONFIG.ENDPOINTS.ARTISANS, artisanData);
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    if (!response.data) {
      throw new Error('Failed to create artisan');
    }
    
    return response.data;
  }

  // Mettre à jour un artisan
  static async updateArtisan(id: number, artisanData: Partial<CreateArtisanData>): Promise<Artisan> {
    const response = await apiClient.patch<Artisan>(`${API_CONFIG.ENDPOINTS.ARTISANS}${id}/`, artisanData);
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    if (!response.data) {
      throw new Error('Failed to update artisan');
    }
    
    return response.data;
  }

  // Supprimer un artisan
  static async deleteArtisan(id: number): Promise<void> {
    const response = await apiClient.delete<void>(`${API_CONFIG.ENDPOINTS.ARTISANS}${id}/`);
    
    if (response.error) {
      throw new Error(response.error);
    }
  }

  // Récupérer les commentaires d'un artisan
  static async getArtisanCommentaires(artisanId: number): Promise<Commentaire[]> {
    const artisan = await this.getArtisanById(artisanId);
    return artisan.commentaires;
  }

  // Ajouter un commentaire à un artisan
  static async addCommentaire(commentaireData: CreateCommentaireData): Promise<Commentaire> {
    const response = await apiClient.post<Commentaire>(API_CONFIG.ENDPOINTS.COMMENTAIRES, commentaireData);
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    if (!response.data) {
      throw new Error('Failed to create comment');
    }
    
    return response.data;
  }

  // Exporter tous les artisans en JSON (pour usage offline)
  static async exportArtisansJson(): Promise<Artisan[]> {
    const response = await apiClient.get<Artisan[]>(API_CONFIG.ENDPOINTS.EXPORT_JSON);
    
    if (response.error) {
      throw new Error(response.error);
    }
    
    return response.data || [];
  }

  // Rechercher des artisans par nom ou métier
  static async searchArtisans(searchTerm: string): Promise<Artisan[]> {
    // Cette méthode utilise le filtrage côté client car l'API Django n'a pas de recherche textuelle
    const allArtisans = await this.getAllArtisans();
    
    const searchLower = searchTerm.toLowerCase();
    
    return allArtisans.filter(artisan => 
      artisan.nom.toLowerCase().includes(searchLower) ||
      artisan.metier.toLowerCase().includes(searchLower) ||
      artisan.ville.toLowerCase().includes(searchLower) ||
      artisan.quartier.toLowerCase().includes(searchLower)
    );
  }

  // Obtenir les artisans par métier
  static async getArtisansByMetier(metier: string): Promise<Artisan[]> {
    return this.filterArtisans({ metier });
  }

  // Obtenir les artisans par ville
  static async getArtisansByVille(ville: string): Promise<Artisan[]> {
    return this.filterArtisans({ ville });
  }

  // Obtenir les artisans les mieux notés
  static async getTopRatedArtisans(limit: number = 10): Promise<Artisan[]> {
    const allArtisans = await this.getAllArtisans();
    
    return allArtisans
      .sort((a, b) => b.note - a.note)
      .slice(0, limit);
  }
} 
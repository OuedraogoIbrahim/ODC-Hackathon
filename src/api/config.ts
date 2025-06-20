// Configuration de l'API
export const API_CONFIG = {
  // URL de base de votre API Django - Utilisez l'IP de votre ordinateur
  BASE_URL: 'http://192.168.1.73:8000/api', // IP de votre ordinateur sur le réseau WiFi
  
  // Endpoints
  ENDPOINTS: {
    ARTISANS: '/artisans/',
    COMMENTAIRES: '/commentaires/',
    EXPORT_JSON: '/export-json/',
  },
  
  // Headers par défaut
  DEFAULT_HEADERS: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  
  // Timeout pour les requêtes
  TIMEOUT: 10000, // 10 secondes
};

// Métiers disponibles
export const METIERS = [
  'plombier',
  'electricien', 
  'macon',
  'couturier',
  'menuisier',
  'photographe',
] as const;

// Fonction pour construire l'URL complète
export const buildApiUrl = (endpoint: string): string => {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Fonction pour construire les paramètres de requête
export const buildQueryParams = (params: Record<string, any>): string => {
  const searchParams = new URLSearchParams();
  
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, value.toString());
    }
  });
  
  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}; 
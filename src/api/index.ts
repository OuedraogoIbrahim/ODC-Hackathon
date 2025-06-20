// Export centralisé de tous les modules de l'API

// Types
export * from './types';

// Configuration
export * from './config';

// Client HTTP
export { apiClient } from './client';

// Services
export { ArtisansService } from './artisans';

// Hooks React
export {
  useArtisans,
  useArtisan,
  useFilteredArtisans,
  useSearchArtisans,
  useCreateArtisan,
  useUpdateArtisan,
  useDeleteArtisan,
  useAddCommentaire,
  useTopRatedArtisans,
} from './hooks';

// Utilitaires
export { buildApiUrl, buildQueryParams } from './config';
export {
  formatCommentDate,
  formatPhoneNumber,
  generateWhatsAppLink,
  generateCallLink,
  calculateAverageRating,
  sortArtisansByRating,
  sortArtisansByName,
  filterArtisansByMetier,
  filterArtisansByVille,
  searchArtisans,
  validateArtisanData,
  validateCommentaireData,
  generateTempId,
  hasWhatsApp,
  getMetierLabel,
  getMetierIcon,
} from './utils'; 
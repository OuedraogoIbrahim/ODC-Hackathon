import { Artisan, Commentaire } from './types';

// Utilitaires pour l'API

// Formater la date d'un commentaire
export const formatCommentDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Formater le numéro de téléphone
export const formatPhoneNumber = (phone: string): string => {
  // Supprimer tous les caractères non numériques
  const cleaned = phone.replace(/\D/g, '');
  
  // Formater selon la longueur
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
  }
  
  return phone; // Retourner tel quel si le format n'est pas reconnu
};

// Générer un lien WhatsApp
export const generateWhatsAppLink = (phone: string, message?: string): string => {
  const cleanedPhone = phone.replace(/\D/g, '');
  const encodedMessage = message ? encodeURIComponent(message) : '';
  return `https://wa.me/${cleanedPhone}${encodedMessage ? `?text=${encodedMessage}` : ''}`;
};

// Générer un lien d'appel
export const generateCallLink = (phone: string): string => {
  return `tel:${phone}`;
};

// Calculer la note moyenne d'un artisan
export const calculateAverageRating = (artisan: Artisan): number => {
  if (artisan.commentaires.length === 0) {
    return artisan.note;
  }
  
  const totalRating = artisan.commentaires.reduce((sum, comment) => {
    // Ici vous pourriez ajouter une logique pour extraire la note du commentaire
    // Pour l'instant, on utilise la note de l'artisan
    return sum + artisan.note;
  }, 0);
  
  return Math.round((totalRating / artisan.commentaires.length) * 10) / 10;
};

// Trier les artisans par note
export const sortArtisansByRating = (artisans: Artisan[]): Artisan[] => {
  return [...artisans].sort((a, b) => b.note - a.note);
};

// Trier les artisans par nom
export const sortArtisansByName = (artisans: Artisan[]): Artisan[] => {
  return [...artisans].sort((a, b) => a.nom.localeCompare(b.nom));
};

// Filtrer les artisans par métier
export const filterArtisansByMetier = (artisans: Artisan[], metier: string): Artisan[] => {
  if (!metier) return artisans;
  return artisans.filter(artisan => artisan.metier === metier);
};

// Filtrer les artisans par ville
export const filterArtisansByVille = (artisans: Artisan[], ville: string): Artisan[] => {
  if (!ville) return artisans;
  return artisans.filter(artisan => 
    artisan.ville.toLowerCase().includes(ville.toLowerCase())
  );
};

// Rechercher des artisans
export const searchArtisans = (artisans: Artisan[], searchTerm: string): Artisan[] => {
  if (!searchTerm.trim()) return artisans;
  
  const term = searchTerm.toLowerCase();
  return artisans.filter(artisan => 
    artisan.nom.toLowerCase().includes(term) ||
    artisan.metier.toLowerCase().includes(term) ||
    artisan.ville.toLowerCase().includes(term) ||
    artisan.quartier.toLowerCase().includes(term)
  );
};

// Valider les données d'un artisan
export const validateArtisanData = (data: Partial<Artisan>): string[] => {
  const errors: string[] = [];
  
  if (!data.nom || data.nom.trim().length < 2) {
    errors.push('Le nom doit contenir au moins 2 caractères');
  }
  
  if (!data.metier) {
    errors.push('Le métier est requis');
  }
  
  if (!data.ville || data.ville.trim().length < 2) {
    errors.push('La ville doit contenir au moins 2 caractères');
  }
  
  if (!data.quartier || data.quartier.trim().length < 2) {
    errors.push('Le quartier doit contenir au moins 2 caractères');
  }
  
  if (!data.contact || data.contact.trim().length < 8) {
    errors.push('Le contact doit contenir au moins 8 caractères');
  }
  
  if (data.note !== undefined && (data.note < 0 || data.note > 5)) {
    errors.push('La note doit être comprise entre 0 et 5');
  }
  
  return errors;
};

// Valider les données d'un commentaire
export const validateCommentaireData = (data: Partial<Commentaire>): string[] => {
  const errors: string[] = [];
  
  if (!data.contenu || data.contenu.trim().length < 10) {
    errors.push('Le commentaire doit contenir au moins 10 caractères');
  }
  
  if (data.contenu && data.contenu.trim().length > 500) {
    errors.push('Le commentaire ne peut pas dépasser 500 caractères');
  }
  
  return errors;
};

// Générer un ID unique temporaire (pour les nouveaux éléments)
export const generateTempId = (): string => {
  return `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Vérifier si un artisan a WhatsApp
export const hasWhatsApp = (artisan: Artisan): boolean => {
  return artisan.whatsapp;
};

// Obtenir le métier en français
export const getMetierLabel = (metier: string): string => {
  const metiersMap: Record<string, string> = {
    'plombier': 'Plombier',
    'electricien': 'Électricien',
    'macon': 'Maçon',
    'couturier': 'Couturier',
    'menuisier': 'Menuisier',
    'photographe': 'Photographe',
  };
  
  return metiersMap[metier] || metier;
};

// Obtenir l'icône du métier (vous pouvez adapter selon vos besoins)
export const getMetierIcon = (metier: string): string => {
  const iconsMap: Record<string, string> = {
    'plombier': '🔧',
    'electricien': '⚡',
    'macon': '🏗️',
    'couturier': '🧵',
    'menuisier': '🪚',
    'photographe': '📸',
  };
  
  return iconsMap[metier] || '👷';
}; 
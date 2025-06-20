# API Client pour l'Application Artisans

Ce dossier contient tous les fichiers nécessaires pour communiquer avec votre API Django des artisans.

## Structure des fichiers

```
api/
├── types.ts          # Types TypeScript pour les données
├── config.ts         # Configuration de l'API (URLs, headers, etc.)
├── client.ts         # Client HTTP générique
├── artisans.ts       # Service spécifique pour les artisans
├── hooks.ts          # Hooks React pour utiliser l'API
├── utils.ts          # Fonctions utilitaires
├── index.ts          # Export centralisé
└── README.md         # Documentation
```

## Utilisation

### 1. Import des modules

```typescript
// Import complet
import * as api from '../api';

// Import spécifique
import { useArtisans, ArtisansService, Artisan } from '../api';
```

### 2. Utilisation des hooks React

#### Récupérer tous les artisans
```typescript
import { useArtisans } from '../api';

function ArtisansList() {
  const { data: artisans, loading, error, refetch } = useArtisans();

  if (loading) return <Text>Chargement...</Text>;
  if (error) return <Text>Erreur: {error}</Text>;

  return (
    <View>
      {artisans?.map(artisan => (
        <Text key={artisan.id}>{artisan.nom}</Text>
      ))}
    </View>
  );
}
```

#### Rechercher des artisans
```typescript
import { useSearchArtisans } from '../api';

function SearchArtisans() {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: artisans, loading } = useSearchArtisans(searchTerm);

  return (
    <View>
      <TextInput 
        value={searchTerm}
        onChangeText={setSearchTerm}
        placeholder="Rechercher un artisan..."
      />
      {artisans?.map(artisan => (
        <Text key={artisan.id}>{artisan.nom}</Text>
      ))}
    </View>
  );
}
```

#### Créer un artisan
```typescript
import { useCreateArtisan } from '../api';

function CreateArtisanForm() {
  const { createArtisan, loading, error } = useCreateArtisan();

  const handleSubmit = async (data) => {
    try {
      await createArtisan(data);
      // Succès
    } catch (error) {
      // Gérer l'erreur
    }
  };

  return (
    <View>
      {/* Formulaire */}
    </View>
  );
}
```

### 3. Utilisation directe du service

```typescript
import { ArtisansService } from '../api';

// Récupérer tous les artisans
const artisans = await ArtisansService.getAllArtisans();

// Filtrer par métier
const plombiers = await ArtisansService.getArtisansByMetier('plombier');

// Créer un artisan
const nouvelArtisan = await ArtisansService.createArtisan({
  nom: 'Jean Dupont',
  metier: 'plombier',
  ville: 'Paris',
  quartier: 'Montmartre',
  contact: '0123456789',
  whatsapp: true,
  note: 4.5
});
```

### 4. Utilisation des utilitaires

```typescript
import { 
  formatPhoneNumber, 
  generateWhatsAppLink, 
  getMetierLabel,
  validateArtisanData 
} from '../api';

// Formater un numéro de téléphone
const phoneFormatted = formatPhoneNumber('0123456789');

// Générer un lien WhatsApp
const whatsappLink = generateWhatsAppLink('0123456789', 'Bonjour !');

// Obtenir le label du métier
const metierLabel = getMetierLabel('plombier'); // "Plombier"

// Valider des données
const errors = validateArtisanData(artisanData);
```

## Configuration

### Modifier l'URL de l'API

Dans `config.ts`, modifiez la constante `BASE_URL` :

```typescript
export const API_CONFIG = {
  BASE_URL: 'http://votre-serveur.com/api', // Changez cette URL
  // ...
};
```

### Ajouter des headers personnalisés

```typescript
// Dans votre composant
const { createArtisan } = useCreateArtisan();

// Avec headers personnalisés
await createArtisan(data, {
  headers: {
    'Authorization': 'Bearer votre-token',
    'Custom-Header': 'valeur'
  }
});
```

## Gestion des erreurs

Tous les hooks et services gèrent automatiquement les erreurs :

```typescript
const { data, loading, error } = useArtisans();

if (error) {
  // L'erreur est automatiquement gérée
  console.log('Erreur API:', error);
}
```

## Fonctionnalités disponibles

### Hooks React
- `useArtisans()` - Récupérer tous les artisans
- `useArtisan(id)` - Récupérer un artisan par ID
- `useFilteredArtisans(filters)` - Filtrer les artisans
- `useSearchArtisans(term)` - Rechercher des artisans
- `useCreateArtisan()` - Créer un artisan
- `useUpdateArtisan()` - Mettre à jour un artisan
- `useDeleteArtisan()` - Supprimer un artisan
- `useAddCommentaire()` - Ajouter un commentaire
- `useTopRatedArtisans(limit)` - Artisans les mieux notés

### Services
- `ArtisansService.getAllArtisans()`
- `ArtisansService.getArtisanById(id)`
- `ArtisansService.filterArtisans(filters)`
- `ArtisansService.createArtisan(data)`
- `ArtisansService.updateArtisan(id, data)`
- `ArtisansService.deleteArtisan(id)`
- `ArtisansService.addCommentaire(data)`
- `ArtisansService.searchArtisans(term)`
- `ArtisansService.exportArtisansJson()`

### Utilitaires
- `formatPhoneNumber(phone)`
- `generateWhatsAppLink(phone, message)`
- `generateCallLink(phone)`
- `getMetierLabel(metier)`
- `getMetierIcon(metier)`
- `validateArtisanData(data)`
- `validateCommentaireData(data)`
- `sortArtisansByRating(artisans)`
- `searchArtisans(artisans, term)`

## Notes importantes

1. **CORS** : Assurez-vous que votre API Django autorise les requêtes depuis votre application React Native
2. **URL de base** : Modifiez l'URL dans `config.ts` selon votre environnement
3. **Gestion d'erreurs** : Tous les hooks gèrent automatiquement les erreurs réseau et API
4. **Performance** : Les hooks incluent un debounce pour la recherche et une gestion du cache
5. **TypeScript** : Tous les types sont définis pour une meilleure expérience de développement 
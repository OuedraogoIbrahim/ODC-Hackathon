import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  TextInput,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Linking,
  Platform
} from 'react-native';
import { 
  useArtisans, 
  useSearchArtisans, 
  useCreateArtisan, 
  useDeleteArtisan,
  useAddCommentaire,
  Artisan,
  CreateArtisanData,
  getMetierLabel,
  getMetierIcon,
  formatPhoneNumber,
  generateWhatsAppLink,
  generateCallLink,
  validateArtisanData,
  METIERS
} from '../src/api';
import { FontAwesome as Icon } from '@expo/vector-icons';
import { Picker } from '@react-native-picker/picker';

const ODC_ORANGE = '#FF7900';
const ODC_BLACK = '#222';
const ODC_WHITE = '#fff';

export default function Index() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMetier, setSelectedMetier] = useState<string>('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedArtisan, setSelectedArtisan] = useState<Artisan | null>(null);
  const [newComment, setNewComment] = useState('');

  // Hooks API
  const { data: artisans, loading, error, refetch } = useArtisans();
  const { data: searchResults } = useSearchArtisans(searchTerm);
  const { createArtisan, loading: creating } = useCreateArtisan();
  const { deleteArtisan, loading: deleting } = useDeleteArtisan();
  const { addCommentaire, loading: addingComment } = useAddCommentaire();

  // État du formulaire
  const [formData, setFormData] = useState<CreateArtisanData>({
    nom: '',
    metier: 'plombier',
    ville: '',
    quartier: '',
    contact: '',
    whatsapp: false,
    note: 0
  });

  // Filtrage combiné métier + texte
  let filteredArtisans = artisans || [];
  if (selectedMetier) {
    filteredArtisans = filteredArtisans.filter(a => a.metier === selectedMetier);
  }
  if (searchTerm.trim()) {
    const lower = searchTerm.toLowerCase();
    filteredArtisans = filteredArtisans.filter(a =>
      a.nom.toLowerCase().includes(lower) ||
      a.ville.toLowerCase().includes(lower) ||
      a.quartier.toLowerCase().includes(lower) ||
      a.contact.toLowerCase().includes(lower)
    );
  }

  // Créer un artisan
  const handleCreateArtisan = async () => {
    const errors = validateArtisanData(formData);
    if (errors.length > 0) {
      Alert.alert('Erreur de validation', errors.join('\n'));
      return;
    }

    try {
      await createArtisan(formData);
      setShowCreateForm(false);
      setFormData({
        nom: '',
        metier: 'plombier',
        ville: '',
        quartier: '',
        contact: '',
        whatsapp: false,
        note: 0
      });
      refetch();
      Alert.alert('Succès', 'Artisan créé avec succès !');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible de créer l\'artisan');
    }
  };

  // Supprimer un artisan
  const handleDeleteArtisan = (id: number, nom: string) => {
    Alert.alert(
      'Confirmer la suppression',
      `Voulez-vous vraiment supprimer ${nom} ?`,
      [
        { text: 'Annuler', style: 'cancel' },
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteArtisan(id);
              refetch();
              Alert.alert('Succès', 'Artisan supprimé avec succès !');
            } catch (error) {
              Alert.alert('Erreur', 'Impossible de supprimer l\'artisan');
            }
          }
        }
      ]
    );
  };

  // Ajouter un commentaire
  const handleAddComment = async (artisanId: number) => {
    if (!newComment.trim()) {
      Alert.alert('Erreur', 'Le commentaire ne peut pas être vide');
      return;
    }

    try {
      await addCommentaire({
        artisan: artisanId,
        contenu: newComment
      });
      setNewComment('');
      setSelectedArtisan(null);
      refetch();
      Alert.alert('Succès', 'Commentaire ajouté avec succès !');
    } catch (error) {
      Alert.alert('Erreur', 'Impossible d\'ajouter le commentaire');
    }
  };

  // Ouvrir WhatsApp
  const openWhatsApp = (phone: string) => {
    const url = generateWhatsAppLink(phone, 'Bonjour ! J\'ai besoin de vos services.');
    Linking.openURL(url);
  };

  // Appeler
  const makeCall = (phone: string) => {
    const url = generateCallLink(phone);
    Linking.openURL(url);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Chargement des artisans...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Erreur: {error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={refetch}>
          <Text style={styles.retryButtonText}>Réessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>🏠 SOS Artisans</Text>
        <Text style={styles.subtitle}>Trouvez des artisans qualifiés</Text>
      </View>
      <TextInput
            style={styles.searchInput}
            placeholder="Rechercher un artisan"
            placeholderTextColor="#999"
            value={searchTerm}
            onChangeText={setSearchTerm}
            underlineColorAndroid="transparent"
            autoCorrect={false}
            autoCapitalize="none"
          />
      {/* Barre de recherche */}
      <View style={styles.searchContainer}>
        <View style={{ flex: 1 }}>
          <Text style={styles.pickerLabel}>Filtrer par métier :</Text>
          <View style={styles.pickerWrapper}>
            <Picker
              selectedValue={selectedMetier}
              onValueChange={setSelectedMetier}
              style={styles.picker}
              itemStyle={styles.pickerItem}
              mode={Platform.OS === 'ios' ? 'dropdown' : 'dialog'}
    >
              <Picker.Item label="tous les métiers" value="" />
              {METIERS.map((metier) => (
                <Picker.Item key={metier} label={getMetierLabel(metier)} value={metier} />
              ))}
            </Picker>
          </View>
          
        </View>
        <TouchableOpacity 
          style={styles.addButton} 
          onPress={() => setShowCreateForm(!showCreateForm)}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      </View>

      {/* Bouton retour si filtre actif */}
      {(selectedMetier || searchTerm) && (
        <View style={styles.backButtonContainer}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              setSelectedMetier('');
              setSearchTerm('');
            }}
          >
            <Text style={styles.backButtonText}>← Retour à la liste complète</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Formulaire de création */}
      {showCreateForm && (
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>Ajouter un artisan</Text>
          
          <TextInput
            style={styles.input}
            placeholder="Nom de l'artisan"
            placeholderTextColor="#999"
            value={formData.nom}
            onChangeText={(text) => setFormData({...formData, nom: text})}
          />
          
          <View style={styles.pickerContainer}>
            <Text style={styles.label}>Métier:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {METIERS.map((metier) => (
                <TouchableOpacity
                  key={metier}
                  style={[
                    styles.metierChip,
                    formData.metier === metier && styles.metierChipSelected
                  ]}
                  onPress={() => setFormData({...formData, metier})}
                >
                  <Text style={[
                    styles.metierChipText,
                    formData.metier === metier && styles.metierChipTextSelected
                  ]}>
                    {getMetierIcon(metier)} {getMetierLabel(metier)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          
          <TextInput
            style={styles.input}
            placeholder="Ville"
            placeholderTextColor="#999"
            value={formData.ville}
            onChangeText={(text) => setFormData({...formData, ville: text})}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Quartier"
            placeholderTextColor="#999"
            value={formData.quartier}
            onChangeText={(text) => setFormData({...formData, quartier: text})}
          />
          
          <TextInput
            style={styles.input}
            placeholder="Téléphone"
            placeholderTextColor="#999"
            value={formData.contact}
            onChangeText={(text) => setFormData({...formData, contact: text})}
            keyboardType="phone-pad"
          />
          
          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() => setFormData({...formData, whatsapp: !formData.whatsapp})}
            >
              <Text style={styles.checkboxText}>
                {formData.whatsapp ? '☑️' : '☐'} WhatsApp disponible
              </Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={styles.cancelButton} 
              onPress={() => setShowCreateForm(false)}
            >
              <Text style={styles.cancelButtonText}>Annuler</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.saveButton, creating && styles.disabledButton]} 
              onPress={handleCreateArtisan}
              disabled={creating}
            >
              {creating ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.saveButtonText}>Créer</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Liste des artisans */}
      <ScrollView 
        style={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={refetch} />
        }
      >
        {filteredArtisans && filteredArtisans.length > 0 ? (
          filteredArtisans.map((artisan) => (
            <View key={artisan.id} style={styles.artisanCard}>
              <View style={styles.artisanHeader}>
                <View style={styles.artisanInfo}>
                  <Text style={styles.artisanName}>{artisan.nom}</Text>
                  <Text style={styles.artisanMetier}>
                    {getMetierIcon(artisan.metier)} {getMetierLabel(artisan.metier)}
                  </Text>
                  <Text style={styles.artisanLocation}>
                    📍 {artisan.ville} - {artisan.quartier}
                  </Text>
                  <Text style={styles.artisanContact}>
                    📞 {formatPhoneNumber(artisan.contact)}
                  </Text>
                  <Text style={styles.artisanRating}>
                    ⭐ Note: {artisan.note}/5
                  </Text>
                </View>
                
                <View style={styles.artisanActions}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => makeCall(artisan.contact)}
                  >
                    <Text style={styles.actionButtonText}>📞</Text>
                  </TouchableOpacity>
                  
                  {artisan.whatsapp && (
                    <TouchableOpacity 
                      style={styles.actionButton}
                      onPress={() => openWhatsApp(artisan.contact)}
                    >
                      <Icon name="whatsapp" size={20} color="#25D366" />
                    </TouchableOpacity>
                  )}
                  
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => setSelectedArtisan(artisan)}
                  >
                    <Text style={styles.actionButtonText}>💬</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.deleteButton]}
                    onPress={() => handleDeleteArtisan(artisan.id, artisan.nom)}
                  >
                    <Text style={styles.actionButtonText}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              {/* Commentaires */}
              {artisan.commentaires.length > 0 && (
                <View style={styles.commentairesContainer}>
                  <Text style={styles.commentairesTitle}>
                    Commentaires ({artisan.commentaires.length})
                  </Text>
                  {artisan.commentaires.slice(0, 2).map((comment, index) => (
                    <Text key={index} style={styles.commentaire}>
                      "{comment.contenu}"
                    </Text>
                  ))}
                  {artisan.commentaires.length > 2 && (
                    <Text style={styles.moreComments}>
                      ... et {artisan.commentaires.length - 2} autres
                    </Text>
                  )}
                </View>
              )}
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchTerm || selectedMetier ? 'Aucun artisan trouvé' : 'Aucun artisan disponible'}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Modal pour ajouter un commentaire */}
      {selectedArtisan && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              Ajouter un commentaire pour {selectedArtisan.nom}
            </Text>
            
            <TextInput
              style={styles.commentInput}
              placeholder="Votre commentaire..."
              placeholderTextColor="#999"
              value={newComment}
              onChangeText={setNewComment}
              multiline
              numberOfLines={4}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => {
                  setSelectedArtisan(null);
                  setNewComment('');
                }}
              >
                <Text style={styles.cancelButtonText}>Annuler</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.saveButton, addingComment && styles.disabledButton]}
                onPress={() => handleAddComment(selectedArtisan.id)}
                disabled={addingComment}
              >
                {addingComment ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.saveButtonText}>Ajouter</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: ODC_WHITE,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    backgroundColor: ODC_ORANGE,
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: ODC_ORANGE,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: ODC_WHITE,
    textAlign: 'center',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: ODC_WHITE,
    textAlign: 'center',
    marginTop: 5,
    opacity: 0.95,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: ODC_WHITE,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f2f2',
    alignItems: 'flex-end',
  },
  pickerLabel: {
    fontSize: 15,
    fontWeight: 'bold',
    marginBottom: 8,
    color: ODC_BLACK,
    textAlign: 'center',
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: ODC_ORANGE,
    borderRadius: 8,
    backgroundColor: ODC_WHITE,
    marginBottom: 12,
    overflow: 'hidden',
    width: '90%',
    alignSelf: 'center',
    height: 50,
  },
  picker: {
    height: 50,
    color: ODC_BLACK,
    backgroundColor: 'transparent',
    width: '100%',
  },
  pickerItem: {
    fontSize: 16,
    color: ODC_BLACK,
    backgroundColor: ODC_WHITE,
  },
  searchInput: {
    alignSelf: 'center',
    width: '70%',
    height: 40,
    borderWidth: 1,
    borderColor: ODC_ORANGE,
    borderRadius: 20,
    paddingHorizontal: 15,
    marginRight: 0,
    marginTop: 10,
    backgroundColor: ODC_WHITE,
    color: ODC_BLACK,
    fontSize: 16,
    zIndex: 10,
  },
  addButton: {
    width: 40,
    height: 40,
    backgroundColor: ODC_ORANGE,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    shadowColor: ODC_ORANGE,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  addButtonText: {
    color: ODC_WHITE,
    fontSize: 24,
    fontWeight: 'bold',
  },
  formContainer: {
    backgroundColor: ODC_WHITE,
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: ODC_ORANGE,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: ODC_ORANGE,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
    backgroundColor: ODC_WHITE,
    color: ODC_BLACK,
    fontSize: 16,
  },
  pickerContainer: {
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    color: ODC_BLACK,
  },
  metierChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#f0f0f0',
    borderRadius: 15,
    marginRight: 8,
  },
  metierChipSelected: {
    backgroundColor: '#007AFF',
  },
  metierChipText: {
    fontSize: 14,
  },
  metierChipTextSelected: {
    color: 'white',
  },
  checkboxContainer: {
    marginBottom: 15,
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxText: {
    fontSize: 16,
    marginLeft: 5,
    color: ODC_BLACK,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    backgroundColor: '#ff3b30',
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 5,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: ODC_WHITE,
    fontSize: 16,
    fontWeight: 'bold',
  },
  saveButton: {
    flex: 1,
    backgroundColor: '#34c759',
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 5,
    alignItems: 'center',
  },
  saveButtonText: {
    color: ODC_WHITE,
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledButton: {
    opacity: 0.6,
  },
  listContainer: {
    flex: 1,
  },
  artisanCard: {
    backgroundColor: ODC_WHITE,
    margin: 10,
    padding: 18,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: ODC_ORANGE,
    shadowColor: ODC_ORANGE,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  artisanHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  artisanInfo: {
    flex: 1,
  },
  artisanName: {
    fontSize: 19,
    fontWeight: 'bold',
    marginBottom: 3,
    color: ODC_BLACK,
  },
  artisanMetier: {
    fontSize: 16,
    color: ODC_ORANGE,
    marginBottom: 3,
    fontWeight: 'bold',
  },
  artisanLocation: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  artisanContact: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  artisanRating: {
    fontSize: 14,
    color: ODC_ORANGE,
    fontWeight: 'bold',
  },
  artisanActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  actionButton: {
    width: 35,
    height: 35,
    backgroundColor: '#fff6ee',
    borderRadius: 17.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 5,
    borderWidth: 1,
    borderColor: ODC_ORANGE,
  },
  deleteButton: {
    backgroundColor: ODC_ORANGE,
    borderColor: ODC_ORANGE,
  },
  actionButtonText: {
    fontSize: 16,
    color: ODC_ORANGE,
    fontWeight: 'bold',
  },
  commentairesContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#f2f2f2',
  },
  commentairesTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 5,
    color: ODC_ORANGE,
  },
  commentaire: {
    fontSize: 12,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 3,
  },
  moreComments: {
    fontSize: 12,
    color: ODC_ORANGE,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  modalOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: ODC_WHITE,
    padding: 20,
    borderRadius: 10,
    width: '90%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
    color: ODC_ORANGE,
  },
  commentInput: {
    borderWidth: 1,
    borderColor: ODC_ORANGE,
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    minHeight: 80,
    textAlignVertical: 'top',
    backgroundColor: ODC_WHITE,
    color: ODC_BLACK,
    fontSize: 15,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  backButtonContainer: {
    alignItems: 'flex-start',
    marginLeft: 15,
    marginBottom: 5,
  },
  backButton: {
    backgroundColor: '#e0e0e0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  backButtonText: {
    color: ODC_ORANGE,
    fontWeight: 'bold',
    fontSize: 15,
  },
});
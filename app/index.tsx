import { Picker } from "@react-native-picker/picker";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import {
  Artisan,
  CreateArtisanData,
  formatPhoneNumber,
  generateCallLink,
  generateWhatsAppLink,
  getMetierIcon,
  getMetierLabel,
  METIERS,
  useAddCommentaire,
  useArtisans,
  useCreateArtisan,
  useDeleteArtisan,
  useSearchArtisans,
  validateArtisanData,
} from "../src/api";

const ODC_ORANGE = "#FF7900";
const ODC_BLACK = "#222";
const ODC_WHITE = "#fff";

export default function Index() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMetier, setSelectedMetier] = useState<string>("");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedArtisan, setSelectedArtisan] = useState<Artisan | null>(null);
  const [newComment, setNewComment] = useState("");

  // Hooks API
  const { data: artisans, loading, error, refetch } = useArtisans();
  const { data: searchResults } = useSearchArtisans(searchTerm);
  const { createArtisan, loading: creating } = useCreateArtisan();
  const { deleteArtisan, loading: deleting } = useDeleteArtisan();
  const { addCommentaire, loading: addingComment } = useAddCommentaire();

  // État du formulaire
  const [formData, setFormData] = useState<CreateArtisanData>({
    nom: "",
    metier: "plombier",
    ville: "",
    quartier: "",
    contact: "",
    whatsapp: false,
    note: 0,
  });

  // Filtrage combiné métier + texte
  let filteredArtisans = artisans || [];
  if (selectedMetier) {
    filteredArtisans = filteredArtisans.filter(
      (a) => a.metier === selectedMetier
    );
  }
  if (searchTerm.trim()) {
    const lower = searchTerm.toLowerCase();
    filteredArtisans = filteredArtisans.filter(
      (a) =>
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
      Alert.alert(t("artisans_screen_validation_error"), errors.join("\n"));
      return;
    }

    try {
      await createArtisan(formData);
      setShowCreateForm(false);
      setFormData({
        nom: "",
        metier: "plombier",
        ville: "",
        quartier: "",
        contact: "",
        whatsapp: false,
        note: 0,
      });
      refetch();
      Alert.alert(
        t("artisans_screen_success"),
        t("artisans_screen_create_success")
      );
    } catch (error) {
      Alert.alert(
        t("artisans_screen_error"),
        t("artisans_screen_create_error")
      );
    }
  };

  // Supprimer un artisan
  const handleDeleteArtisan = (id: number, nom: string) => {
    Alert.alert(
      t("artisans_screen_confirm_delete"),
      t("artisans_screen_delete_confirmation", { nom }),
      [
        { text: t("artisans_screen_cancel"), style: "cancel" },
        {
          text: t("artisans_screen_delete"),
          style: "destructive",
          onPress: async () => {
            try {
              await deleteArtisan(id);
              refetch();
              Alert.alert(
                t("artisans_screen_success"),
                t("artisans_screen_delete_success")
              );
            } catch (error) {
              Alert.alert(
                t("artisans_screen_error"),
                t("artisans_screen_delete_error")
              );
            }
          },
        },
      ]
    );
  };

  // Ajouter un commentaire
  const handleAddComment = async (artisanId: number) => {
    if (!newComment.trim()) {
      Alert.alert(
        t("artisans_screen_error"),
        t("artisans_screen_empty_comment")
      );
      return;
    }

    try {
      await addCommentaire({
        artisan: artisanId,
        contenu: newComment,
      });
      setNewComment("");
      setSelectedArtisan(null);
      refetch();
      Alert.alert(
        t("artisans_screen_success"),
        t("artisans_screen_comment_success")
      );
    } catch (error) {
      Alert.alert(
        t("artisans_screen_error"),
        t("artisans_screen_comment_error")
      );
    }
  };

  // Ouvrir WhatsApp
  const openWhatsApp = (phone: string) => {
    const url = generateWhatsAppLink(
      phone,
      t("artisans_screen_whatsapp_message")
    );
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
        <Text style={styles.loadingText}>{t("artisans_screen_loading")}</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>
          {t("artisans_screen_error")}: {error}
        </Text>
        <TouchableOpacity style={styles.retryButton} onPress={refetch}>
          <Text style={styles.retryButtonText}>
            {t("artisans_screen_retry")}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>{t("artisans_screen_title")}</Text>
        <Text style={styles.subtitle}>{t("artisans_screen_subtitle")}</Text>
      </View>

      {/* Barre de recherche */}
      <View style={styles.searchContainer}>
        <View style={{ flex: 1 }}>
          <Text style={styles.pickerLabel}>
            {t("artisans_screen_filter_by_metier")}
          </Text>
          <Picker
            selectedValue={selectedMetier}
            onValueChange={setSelectedMetier}
            style={styles.picker}
            itemStyle={styles.pickerItem}
            mode={Platform.OS === "ios" ? "dropdown" : "dialog"}
          >
            <Picker.Item label={t("artisans_screen_all_metiers")} value="" />
            {METIERS.map((metier) => (
              <Picker.Item
                key={metier}
                label={getMetierLabel(metier)}
                value={metier}
              />
            ))}
          </Picker>
          <TextInput
            style={styles.searchInput}
            placeholder={t("artisans_screen_search_placeholder")}
            placeholderTextColor="#888"
            value={searchTerm}
            onChangeText={setSearchTerm}
            underlineColorAndroid="transparent"
            autoCorrect={false}
            autoCapitalize="none"
          />
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
              setSelectedMetier("");
              setSearchTerm("");
            }}
          >
            <Text style={styles.backButtonText}>
              {t("artisans_screen_back_to_full_list")}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Formulaire de création */}
      {showCreateForm && (
        <View style={styles.formContainer}>
          <Text style={styles.formTitle}>
            {t("artisans_screen_add_artisan")}
          </Text>

          <TextInput
            style={styles.input}
            placeholder={t("artisans_screen_name_placeholder")}
            value={formData.nom}
            onChangeText={(text) => setFormData({ ...formData, nom: text })}
          />

          <View style={styles.pickerContainer}>
            <Text style={styles.label}>
              {t("artisans_screen_metier_label")}
            </Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {METIERS.map((metier) => (
                <TouchableOpacity
                  key={metier}
                  style={[
                    styles.metierChip,
                    formData.metier === metier && styles.metierChipSelected,
                  ]}
                  onPress={() => setFormData({ ...formData, metier })}
                >
                  <Text
                    style={[
                      styles.metierChipText,
                      formData.metier === metier &&
                        styles.metierChipTextSelected,
                    ]}
                  >
                    {getMetierIcon(metier)} {getMetierLabel(metier)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <TextInput
            style={styles.input}
            placeholder={t("artisans_screen_city_placeholder")}
            value={formData.ville}
            onChangeText={(text) => setFormData({ ...formData, ville: text })}
          />

          <TextInput
            style={styles.input}
            placeholder={t("artisans_screen_neighborhood_placeholder")}
            value={formData.quartier}
            onChangeText={(text) =>
              setFormData({ ...formData, quartier: text })
            }
          />

          <TextInput
            style={styles.input}
            placeholder={t("artisans_screen_phone_placeholder")}
            value={formData.contact}
            onChangeText={(text) => setFormData({ ...formData, contact: text })}
            keyboardType="phone-pad"
          />

          <View style={styles.checkboxContainer}>
            <TouchableOpacity
              style={styles.checkbox}
              onPress={() =>
                setFormData({ ...formData, whatsapp: !formData.whatsapp })
              }
            >
              <Text style={styles.checkboxText}>
                {formData.whatsapp ? "☑️" : "☐"}{" "}
                {t("artisans_screen_whatsapp_available")}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowCreateForm(false)}
            >
              <Text style={styles.cancelButtonText}>
                {t("artisans_screen_cancel")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.saveButton, creating && styles.disabledButton]}
              onPress={handleCreateArtisan}
              disabled={creating}
            >
              {creating ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.saveButtonText}>
                  {t("artisans_screen_create")}
                </Text>
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
                    {getMetierIcon(artisan.metier)}{" "}
                    {getMetierLabel(artisan.metier)}
                  </Text>
                  <Text style={styles.artisanLocation}>
                    📍 {artisan.ville} - {artisan.quartier}
                  </Text>
                  <Text style={styles.artisanContact}>
                    📞 {formatPhoneNumber(artisan.contact)}
                  </Text>
                  <Text style={styles.artisanRating}>
                    ⭐ {t("artisans_screen_rating_label")}: {artisan.note}/5
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
                    {t("artisans_screen_comments_title", {
                      count: artisan.commentaires.length,
                    })}
                  </Text>
                  {artisan.commentaires.slice(0, 2).map((comment, index) => (
                    <Text key={index} style={styles.commentaire}>
                      "{comment.contenu}"
                    </Text>
                  ))}
                  {artisan.commentaires.length > 2 && (
                    <Text style={styles.moreComments}>
                      {t("artisans_screen_more_comments", {
                        count: artisan.commentaires.length - 2,
                      })}
                    </Text>
                  )}
                </View>
              )}
            </View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {searchTerm || selectedMetier
                ? t("artisans_screen_no_artisans_found")
                : t("artisans_screen_no_artisans_available")}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Modal pour ajouter un commentaire */}
      {selectedArtisan && (
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>
              {t("artisans_screen_add_comment_for", {
                nom: selectedArtisan.nom,
              })}
            </Text>

            <TextInput
              style={styles.commentInput}
              placeholder={t("artisans_screen_comment_placeholder")}
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
                  setNewComment("");
                }}
              >
                <Text style={styles.cancelButtonText}>
                  {t("artisans_screen_cancel")}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.saveButton,
                  addingComment && styles.disabledButton,
                ]}
                onPress={() => handleAddComment(selectedArtisan.id)}
                disabled={addingComment}
              >
                {addingComment ? (
                  <ActivityIndicator size="small" color="white" />
                ) : (
                  <Text style={styles.saveButtonText}>
                    {t("artisans_screen_add_comment")}
                  </Text>
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
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: "red",
    textAlign: "center",
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
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
    fontWeight: "bold",
    color: ODC_WHITE,
    textAlign: "center",
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 16,
    color: ODC_WHITE,
    textAlign: "center",
    marginTop: 5,
    opacity: 0.95,
  },
  searchContainer: {
    flexDirection: "row",
    padding: 15,
    backgroundColor: ODC_WHITE,
    borderBottomWidth: 1,
    borderBottomColor: "#f2f2f2",
    alignItems: "flex-end",
  },
  pickerLabel: {
    fontSize: 15,
    fontWeight: "bold",
    marginBottom: 2,
    color: ODC_BLACK,
    marginLeft: 5,
  },
  picker: {
    backgroundColor: ODC_WHITE,
    borderRadius: 8,
    height: 44,
    marginBottom: 0,
    color: ODC_BLACK,
    borderWidth: 1,
    borderColor: ODC_ORANGE,
  },
  pickerItem: {
    fontSize: 16,
    color: ODC_BLACK,
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderColor: ODC_ORANGE,
    borderRadius: 20,
    paddingHorizontal: 15,
    marginRight: 10,
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
    justifyContent: "center",
    alignItems: "center",
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
    fontWeight: "bold",
  },
  formContainer: {
    backgroundColor: "white",
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#e0e0e0",
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
  },
  input: {
    height: 40,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  pickerContainer: {
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
  },
  metierChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: "#f0f0f0",
    borderRadius: 15,
    marginRight: 8,
  },
  metierChipSelected: {
    backgroundColor: "#007AFF",
  },
  metierChipText: {
    fontSize: 14,
  },
  metierChipTextSelected: {
    color: "white",
  },
  checkboxContainer: {
    marginBottom: 15,
  },
  checkbox: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkboxText: {
    fontSize: 16,
    marginLeft: 5,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  cancelButton: {
    flex: 1,
    backgroundColor: "#ff3b30",
    paddingVertical: 10,
    borderRadius: 8,
    marginRight: 5,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  saveButton: {
    flex: 1,
    backgroundColor: "#34c759",
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 5,
    alignItems: "center",
  },
  saveButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  artisanInfo: {
    flex: 1,
  },
  artisanName: {
    fontSize: 19,
    fontWeight: "bold",
    marginBottom: 3,
    color: ODC_BLACK,
  },
  artisanMetier: {
    fontSize: 16,
    color: ODC_ORANGE,
    marginBottom: 3,
    fontWeight: "bold",
  },
  artisanLocation: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  artisanContact: {
    fontSize: 14,
    color: "#666",
    marginBottom: 2,
  },
  artisanRating: {
    fontSize: 14,
    color: ODC_ORANGE,
    fontWeight: "bold",
  },
  artisanActions: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  actionButton: {
    width: 35,
    height: 35,
    backgroundColor: "#fff6ee",
    borderRadius: 17.5,
    justifyContent: "center",
    alignItems: "center",
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
    fontWeight: "bold",
  },
  commentairesContainer: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f2f2f2",
  },
  commentairesTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
    color: ODC_ORANGE,
  },
  commentaire: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
    marginBottom: 3,
  },
  moreComments: {
    fontSize: 12,
    color: ODC_ORANGE,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
  },
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 10,
    width: "90%",
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 15,
    textAlign: "center",
  },
  commentInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 10,
    marginBottom: 15,
    minHeight: 80,
    textAlignVertical: "top",
  },
  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  backButtonContainer: {
    alignItems: "flex-start",
    marginLeft: 15,
    marginBottom: 5,
  },
  backButton: {
    backgroundColor: "#e0e0e0",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  backButtonText: {
    color: "#007AFF",
    fontWeight: "bold",
    fontSize: 15,
  },
});

import { useEffect } from "react";
import { router } from "expo-router";
import { Button, StyleSheet, Text, View, Alert } from "react-native";
import * as Speech from 'expo-speech';

export default function AccueilScreen() {

  useEffect(() => {
    const message = "Bienvenue ! Veuillez choisir un service en disant A pour transport, B pour habillement, ou C pour santé.";
    Speech.speak(message);
  }, []);

  const handleVoiceInput = (input) => {
    const cleaned = input.trim().toLowerCase();

    if (cleaned.includes('a')) {
      Speech.speak("Vous avez choisi l'option A, Service Transport.");
      router.push('/transport');
    } else if (cleaned.includes('b')) {
      Speech.speak("Vous avez choisi l'option B, Service Habillement.");
      Alert.alert("Navigation", "Vous avez choisi Habillement");
    } else if (cleaned.includes('c')) {
      Speech.speak("Vous avez choisi l'option C, Service Santé.");
      Alert.alert("Navigation", "Vous avez choisi Santé");
    } else {
      Speech.speak("Je n'ai pas compris. Veuillez dire A, B ou C.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>🛠️ Les différents Services</Text>
      <Text style={styles.title}>Implémenter la fonction vocale</Text>

      <View style={styles.buttonContainer}>
        <Button title="🎤 Lancer la reconnaissance vocale (fictive)" onPress={() => {
          // Simuler une réponse vocale. Remplace ça plus tard par de la vraie STT.
          const fakeResponse = "a";
          handleVoiceInput(fakeResponse);
        }} />
      </View>

      <View style={styles.buttonContainer}>
        <Button title="🚌 A) Service Transport" onPress={() => router.push('/transport')} />
      </View>

      <View style={styles.buttonContainer}>
        <Button title="👗 B) Service Habillement" onPress={() => alert("Service Habillement")} />
      </View>

      <View style={styles.buttonContainer}>
        <Button title="🏥 C) Service Santé" onPress={() => alert("Service Santé")} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 22,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  buttonContainer: {
    marginVertical: 10,
  },
});

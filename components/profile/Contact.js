// components/profile/Contact.js
// Équivalent mobile de Contact.jsx.
// Protection anti-bot : web vérifie le délai via window.localStorage
// (absent en React Native) ; remplacé par une simple référence en mémoire,
// avec le même effet (détecter une soumission anormalement rapide).

import { useContext, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import AuthContext from "../../context/AuthContext";
import { showToast } from "../../lib/toast";
import { captureClientError } from "../../lib/monitoring";

const Contact = () => {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadTimeRef = useRef(Date.now());
  const { sendEmail, error, clearErrors } = useContext(AuthContext);

  useEffect(() => {
    if (error) {
      showToast(error);
      clearErrors();
    }
  }, [error, clearErrors]);

  const submitHandler = async () => {
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      // Protection anti-bot : soumission anormalement rapide
      const timeSinceLoad = Date.now() - loadTimeRef.current;

      if (timeSinceLoad < 1500) {
        captureClientError(
          new Error("Soumission trop rapide détectée"),
          "Contact",
          "botDetection",
          true,
        );
        // Simuler un succès sans envoyer réellement (ne pas alerter le bot)
        showToast("Votre message a été envoyé");
        resetForm();
        return;
      }

      await sendEmail({ subject, message });
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
      captureClientError(error, "Contact", "sendError", true);
      showToast(
        error.message ||
          "Une erreur inattendue est survenue. Veuillez réessayer.",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setSubject("");
    setMessage("");
  };

  const charCount = message.length;

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ padding: 16, flexGrow: 1 }}
    >
      <View className="mb-6 flex-1 rounded-lg border border-gray-100 bg-white p-4 shadow-sm">
        <Text className="mb-5 text-2xl font-semibold text-gray-800">
          Écrivez votre message
        </Text>

        <View className="mb-4">
          <Text className="mb-2 text-sm font-medium text-gray-700">Sujet</Text>
          <TextInput
            className="rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 shadow-sm"
            placeholder="De quoi avez-vous besoin ?"
            placeholderTextColor="#9ca3af"
            value={subject}
            onChangeText={setSubject}
            maxLength={100}
            editable={!isSubmitting}
            accessibilityLabel="Sujet"
          />
        </View>

        {/* flex-1 : le champ message prend l'espace disponible, ce qui
            rapproche le bouton Envoyer du bas de l'écran */}
        <View className="mb-4 flex-1">
          <Text className="mb-2 text-sm font-medium text-gray-700">
            Message
          </Text>
          <View className="relative flex-1">
            <TextInput
              className="min-h-48 flex-1 rounded-md border border-gray-300 px-3 py-2 pb-6 text-sm text-gray-900 shadow-sm"
              placeholder="Écrivez votre message..."
              placeholderTextColor="#9ca3af"
              value={message}
              onChangeText={setMessage}
              maxLength={1000}
              multiline
              textAlignVertical="top"
              editable={!isSubmitting}
              accessibilityLabel="Message"
            />
            <Text
              className={`absolute bottom-2 right-2 text-xs ${
                charCount > 900 ? "text-orange-500" : "text-gray-500"
              }`}
            >
              {charCount}/1000
            </Text>
          </View>
        </View>

        <Pressable
          onPress={submitHandler}
          disabled={isSubmitting}
          accessibilityState={{ busy: isSubmitting }}
          className={`flex-row items-center justify-center rounded-md bg-blue-600 px-4 py-2 active:bg-blue-700 ${
            isSubmitting ? "opacity-50" : ""
          }`}
        >
          {isSubmitting ? (
            <>
              <ActivityIndicator size="small" color="#ffffff" />
              <Text className="ml-2 text-white">Envoi en cours...</Text>
            </>
          ) : (
            <Text className="text-white">Envoyer</Text>
          )}
        </Pressable>
      </View>
    </ScrollView>
  );
};

export default Contact;

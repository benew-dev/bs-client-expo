// components/profile/UpdateProfileBasic.js
// Équivalent mobile de UpdateProfileBasic.jsx.
// CldUploadWidget (web) remplacé par expo-image-picker + lib/cloudinary.js
// (upload REST direct, signé par le serveur).

import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { updateUser, useSession } from "../../lib/auth-client";
import { uploadAvatar } from "../../lib/cloudinary";
import { showToast } from "../../lib/toast";

const UpdateProfileBasic = () => {
  const { data: session, refetch } = useSession();
  const user = session?.user;
  const router = useRouter();

  const [formState, setFormState] = useState({ name: "", image: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadInProgress, setUploadInProgress] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);

  const hasInitialized = useRef(false);

  useEffect(() => {
    if (user && !hasInitialized.current) {
      hasInitialized.current = true;
      setFormState({ name: user?.name || "", image: user?.image || "" });
    }
  }, [user]);

  const pickImage = async () => {
    try {
      const permission =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        showToast("Autorisation d'accès aux photos refusée");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (result.canceled || !result.assets?.[0]?.uri) return;

      setUploadInProgress(true);
      const secureUrl = await uploadAvatar(result.assets[0].uri);

      setFormState((prev) => ({ ...prev, image: secureUrl }));
      setImageFailed(false);
      showToast("Photo de profil téléchargée avec succès");
    } catch (error) {
      console.error("Erreur de téléchargement:", error);
      showToast("Erreur lors du téléchargement de l'image");
    } finally {
      setUploadInProgress(false);
    }
  };

  const submitHandler = async () => {
    if (uploadInProgress) {
      showToast("Veuillez attendre la fin du téléchargement de l'image");
      return;
    }

    try {
      setIsSubmitting(true);

      const { error } = await updateUser({
        name: formState.name.trim(),
        image: formState.image || null,
      });

      if (error) {
        showToast(
          error.message || "Une erreur est survenue lors de la mise à jour",
        );
        return;
      }

      await refetch();
      showToast("Profil mis à jour avec succès!");
      setTimeout(() => router.back(), 500);
    } catch (error) {
      console.error("Erreur de mise à jour:", error);
      showToast(
        error.message || "Une erreur est survenue lors de la mise à jour",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <View className="items-center py-6">
        <ActivityIndicator color="#2563eb" />
      </View>
    );
  }

  return (
    <View className="rounded-lg bg-white p-4 shadow-sm">
      <Pressable
        onPress={() => router.back()}
        className="mb-4 flex-row items-center self-start rounded-md border border-gray-300 bg-white px-3 py-2 active:bg-gray-50"
      >
        <Ionicons name="arrow-back" size={16} color="#374151" />
        <Text className="ml-2 text-sm font-medium text-gray-700">Retour</Text>
      </Pressable>

      <Text className="mb-5 text-2xl font-semibold">Modifier votre profil</Text>

      {/* Nom */}
      <View className="mb-4">
        <Text className="mb-1 font-medium text-gray-700">
          Nom complet <Text className="text-red-500">*</Text>
        </Text>
        <TextInput
          className="rounded-md border border-gray-200 bg-gray-100 px-3 py-2 text-gray-900"
          placeholder="Votre nom complet"
          placeholderTextColor="#9ca3af"
          value={formState.name}
          onChangeText={(name) => setFormState((prev) => ({ ...prev, name }))}
          maxLength={50}
          editable={!isSubmitting}
          accessibilityLabel="Nom complet"
        />
      </View>

      {/* Photo de profil */}
      <View className="mb-6">
        <Text className="mb-1 font-medium text-gray-700">Photo de profil</Text>
        <View className="flex-row items-center gap-4">
          <View className="h-20 w-20 overflow-hidden rounded-full border-2 border-gray-200 bg-gray-100">
            {uploadInProgress ? (
              <View className="h-full w-full items-center justify-center">
                <ActivityIndicator color="#2563eb" />
              </View>
            ) : formState.image && !imageFailed ? (
              <Image
                source={{ uri: formState.image }}
                className="h-full w-full"
                resizeMode="cover"
                onError={() => setImageFailed(true)}
              />
            ) : (
              <View className="h-full w-full items-center justify-center">
                <Ionicons name="person" size={32} color="#9ca3af" />
              </View>
            )}
          </View>

          <View className="flex-1">
            <Pressable
              onPress={pickImage}
              disabled={uploadInProgress || isSubmitting}
              className="items-center rounded-md border border-blue-600 px-4 py-2 active:bg-blue-50 disabled:opacity-50"
            >
              <Text className="text-blue-600">
                {uploadInProgress
                  ? "Téléchargement en cours..."
                  : "Changer ma photo de profil"}
              </Text>
            </Pressable>
            <Text className="mt-2 text-xs text-gray-500">
              Formats acceptés : JPG, PNG, WEBP. Taille maximale : 2 Mo
            </Text>
          </View>
        </View>
      </View>

      <Pressable
        onPress={submitHandler}
        disabled={isSubmitting || uploadInProgress}
        className={`flex-row items-center justify-center rounded-md px-4 py-2 ${
          isSubmitting || uploadInProgress
            ? "bg-blue-400"
            : "bg-blue-600 active:bg-blue-700"
        }`}
      >
        {isSubmitting ? (
          <>
            <ActivityIndicator size="small" color="#ffffff" />
            <Text className="ml-2 text-white">Mise à jour en cours...</Text>
          </>
        ) : (
          <Text className="text-white">Mettre à jour mon profil</Text>
        )}
      </Pressable>
    </View>
  );
};

export default UpdateProfileBasic;

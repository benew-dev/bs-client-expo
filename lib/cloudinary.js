// lib/cloudinary.js
// Équivalent mobile de CldUploadWidget : upload direct vers l'API REST
// Cloudinary, signé via /api/v1/auth/me/update/sign-cloudinary-params.

import { File } from "expo-file-system";
import { authenticatedFetch } from "./auth-client";

const CLOUD_NAME = process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
const API_KEY = process.env.EXPO_PUBLIC_CLOUDINARY_API_KEY;

/**
 * Upload une image (URI locale Expo) vers Cloudinary, dans le dossier
 * "buyitnow/avatars" (forcé côté serveur, voir la route de signature).
 *
 * @param {string} fileUri - URI locale retournée par expo-image-picker
 * @returns {Promise<string>} L'URL sécurisée (https) de l'image uploadée
 */
export const uploadAvatar = async (fileUri) => {
  if (!CLOUD_NAME || !API_KEY) {
    throw new Error(
      "Configuration Cloudinary manquante (EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME / EXPO_PUBLIC_CLOUDINARY_API_KEY)",
    );
  }

  const timestamp = Math.round(Date.now() / 1000);

  // 1. Demander la signature au serveur (le dossier est forcé côté serveur)
  const signRes = await authenticatedFetch(
    "/api/v1/me/update/sign-cloudinary-params",
    {
      method: "POST",
      body: JSON.stringify({ paramsToSign: { timestamp } }),
    },
  );

  const signData = await signRes.json().catch(() => ({}));

  if (!signRes.ok || !signData.success) {
    throw new Error(
      signData.message || "Impossible de générer la signature Cloudinary",
    );
  }

  // 2. Uploader directement vers Cloudinary avec la signature obtenue
  //
  // expo/fetch (fetch global depuis le SDK 57) n'accepte plus l'ancien
  // format React Native { uri, type, name } dans un FormData : il lève
  // "Unsupported FormDataPart implementation". Il faut un vrai Blob,
  // fourni ici par expo-file-system.
  const file = new File(fileUri);
  const formData = new FormData();
  formData.append("file", file, "avatar.jpg");
  formData.append("api_key", API_KEY);
  formData.append("timestamp", String(timestamp));
  formData.append("folder", "buyitnow/avatars");
  formData.append("signature", signData.signature);

  const uploadRes = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData },
  );

  const uploadData = await uploadRes.json().catch(() => ({}));

  if (!uploadRes.ok || !uploadData.secure_url) {
    throw new Error(
      uploadData?.error?.message || "Échec de l'envoi de l'image",
    );
  }

  if (!uploadData.secure_url.startsWith("https://")) {
    throw new Error("URL retournée non sécurisée");
  }

  return uploadData.secure_url;
};

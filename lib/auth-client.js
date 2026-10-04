// lib/auth-client.js
import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";
import { fetch as expoFetch } from "expo/fetch";

export const authClient = createAuthClient({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  // Nécessaire : le fetch de React Native masque l'en-tête Set-Cookie,
  // donc le plugin Expo ne peut jamais capturer le cookie de session avec
  // le fetch ambiant. expo/fetch l'expose correctement (confirmé).
  fetchOptions: {
    customFetchImpl: expoFetch,
  },
  plugins: [
    expoClient({
      scheme: "bs-client-expo", // doit être identique au "scheme" de app.json
      storagePrefix: "bs-client-expo",
      storage: SecureStore,
      // Correspond au nom de cookie une fois lib/auth.js corrigé côté
      // serveur (advanced.cookiePrefix ne doit plus valoir "__Secure-").
      cookiePrefix: ["better-auth", "__Secure-better-auth"],
    }),
  ],
});

export const {
  useSession,
  signIn,
  signUp,
  signOut,
  updateUser,
  changePassword,
} = authClient;

/**
 * Pour appeler TES propres routes API (ex: /api/v1/cart), qui ne passent
 * pas par le fetch interne de Better Auth : il faut attacher le cookie de
 * session manuellement (voir doc officielle Better Auth / Expo).
 *
 * Usage :
 *   const res = await authenticatedFetch("/api/v1/cart");
 */
export const authenticatedFetch = async (path, options = {}) => {
  const cookies = await authClient.getCookie();

  return fetch(`${process.env.EXPO_PUBLIC_API_URL}${path}`, {
    ...options,
    credentials: "omit",
    headers: {
      ...(options.headers || {}),
      Cookie: cookies,
      "Content-Type": "application/json",
    },
  });
};

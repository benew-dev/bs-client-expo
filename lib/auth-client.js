// lib/auth-client.js
import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";

export const authClient = createAuthClient({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  plugins: [
    expoClient({
      scheme: "bs-client-expo", // doit être identique au "scheme" de app.json
      storagePrefix: "bs-client-expo",
      storage: SecureStore,
    }),
  ],
});

export const { useSession, signIn, signUp, signOut, updateUser } = authClient;

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

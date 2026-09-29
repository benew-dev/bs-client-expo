// lib/auth-client.js
import { createAuthClient } from "better-auth/react";
import { expoClient } from "@better-auth/expo/client";
import * as SecureStore from "expo-secure-store";
import { fetch as expoFetch } from "expo/fetch";

// TEMPORAIRE (diagnostic) : on enveloppe expo/fetch pour voir si Better Auth
// l'utilise bien en interne, et ce qu'il reçoit vraiment comme Set-Cookie.
const loggingFetch = async (...args) => {
  const res = await expoFetch(...args);
  console.log(
    "RAW SET-COOKIE VIA expo/fetch:",
    res.headers.getSetCookie
      ? res.headers.getSetCookie()
      : res.headers.get("set-cookie"),
  );
  return res;
};

export const authClient = createAuthClient({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  fetchOptions: {
    customFetchImpl: loggingFetch, // <- temporaire, remplace expoFetch le temps du test
  },
  plugins: [
    expoClient({
      scheme: "bs-client-expo", // doit être identique au "scheme" de app.json
      storagePrefix: "bs-client-expo",
      storage: SecureStore,
      // Ton serveur pose "__Secure-better-auth.session_token" en production
      // (advanced.cookiePrefix dans lib/auth.js). Sans cette entrée, le
      // client ignore ce cookie et ne le stocke jamais.
      cookiePrefix: ["better-auth", "__Secure-better-auth"],
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

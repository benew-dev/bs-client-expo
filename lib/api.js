// lib/api.js
// Appels GET publics vers l'API (produits, catégories...) avec timeout.

export const API_URL = process.env.EXPO_PUBLIC_API_URL;
const REQUEST_TIMEOUT = 10000;

export const fetchJson = async (path) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

  try {
    const res = await fetch(`${API_URL}${path}`, {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });

    const json = await res.json().catch(() => null);

    if (!res.ok) {
      const error = new Error(json?.message || `HTTP ${res.status}`);
      error.status = res.status;
      throw error;
    }

    return json;
  } finally {
    clearTimeout(timeoutId);
  }
};

export const getErrorMessage = (
  error,
  fallback = "Erreur lors de la récupération des données",
) => {
  if (error?.name === "AbortError") return "La requête a pris trop de temps";
  if (error?.status === 429) return "Trop de tentatives. Réessayez plus tard.";
  if (error?.status) return error.message || fallback;
  return "Problème de connexion. Vérifiez votre connexion.";
};

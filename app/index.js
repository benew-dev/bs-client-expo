// app/index.js
// Équivalent mobile de app/page.jsx : récupère les produits et les catégories,
// puis les passe à ListProducts. Les filtres/pagination vivent dans les
// paramètres de la route (équivalent de l'URL ?keyword=...&page=... du web).

import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import ListProducts from "../components/products/ListProducts";
import { fetchJson, getErrorMessage } from "../lib/api";

const first = (value) => (Array.isArray(value) ? value[0] : value);

// Construit la query string sans dépendre de URLSearchParams
const buildQuery = ({ keyword, category, min, max, page }) => {
  const parts = [];
  const add = (key, value) => {
    if (value === undefined || value === null) return;
    const clean = String(value).trim();
    if (clean !== "") parts.push(`${key}=${encodeURIComponent(clean)}`);
  };

  add("keyword", keyword);
  add("category", category);
  add("min", min);
  add("max", max);
  add("page", page);

  return parts.length ? `?${parts.join("&")}` : "";
};

export default function HomeScreen() {
  const params = useLocalSearchParams();
  const keyword = first(params.keyword);
  const category = first(params.category);
  const min = first(params.min);
  const max = first(params.max);
  const page = first(params.page);

  const [data, setData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Catégories : une seule fois
  useEffect(() => {
    let cancelled = false;

    fetchJson("/api/v1/category")
      .then((json) => {
        if (!cancelled) setCategories(json?.data?.categories || []);
      })
      .catch((err) => {
        console.error("Categories fetch error:", err.message);
      });

    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  // Produits : à chaque changement de filtre/page
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const query = buildQuery({ keyword, category, min, max, page });
        const json = await fetchJson(`/api/v1/products${query}`);

        if (!cancelled) setData(json?.data || null);
      } catch (err) {
        console.error("Products fetch error:", err.message);
        if (!cancelled) {
          setError(
            getErrorMessage(err, "Erreur lors de la récupération des produits"),
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [keyword, category, min, max, page, reloadKey]);

  const handleRetry = useCallback(() => setReloadKey((k) => k + 1), []);

  return (
    <SafeAreaView
      edges={["bottom", "left", "right"]}
      className="flex-1 bg-gray-50"
    >
      {error ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text className="mb-4 text-center text-base text-gray-800">
            {error}
          </Text>
          <Pressable
            onPress={handleRetry}
            className="rounded-md bg-blue-600 px-4 py-2 active:bg-blue-700"
            accessibilityLabel="Réessayer"
          >
            <Text className="text-white">Réessayer</Text>
          </Pressable>
        </View>
      ) : loading && !data ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : (
        <ListProducts data={data} categories={categories} loading={loading} />
      )}
    </SafeAreaView>
  );
}

// app/product/[id].js
// Équivalent mobile de app/product/[id]/page.jsx : récupère le produit
// (avec les produits similaires) puis le passe à ProductDetails.

import { useCallback, useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLocalSearchParams } from "expo-router";
import ProductDetails from "../../components/products/ProductDetails";
import { fetchJson, getErrorMessage } from "../../lib/api";

export default function ProductScreen() {
  const params = useLocalSearchParams();
  const id = Array.isArray(params.id) ? params.id[0] : params.id;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      setError(null);
      setData(null);

      try {
        const json = await fetchJson(
          `/api/v1/products/${encodeURIComponent(id)}`,
        );
        if (!cancelled) setData(json?.data || null);
      } catch (err) {
        if (cancelled) return;
        // 400 (ID invalide) et 404 (introuvable) : ProductDetails affiche « Produit non disponible »
        if (err.status !== 404 && err.status !== 400) {
          console.error("Product fetch error:", err.message);
          setError(
            getErrorMessage(err, "Erreur lors de la récupération du produit"),
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
  }, [id, reloadKey]);

  const handleRetry = useCallback(() => setReloadKey((k) => k + 1), []);

  return (
    <SafeAreaView
      edges={["bottom", "left", "right"]}
      className="flex-1 bg-gray-50"
    >
      {loading ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      ) : error ? (
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
      ) : (
        <ProductDetails
          product={data?.product ?? null}
          sameCategoryProducts={data?.sameCategoryProducts ?? []}
        />
      )}
    </SafeAreaView>
  );
}

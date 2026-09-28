// components/products/ListProducts.js
// Équivalent mobile de ListProducts.jsx.

import { useCallback, useEffect, useMemo, useRef } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSession } from "../../lib/auth-client";
import ProductItem from "./ProductItem";
import Filters from "../layouts/Filters";
import CustomPagination from "../layouts/CustomPagination";

const first = (value) => (Array.isArray(value) ? value[0] : value);

const ListProducts = ({ data, categories, loading = false }) => {
  const { data: session } = useSession();
  const user = session?.user;
  const router = useRouter();
  const flatListRef = useRef(null);

  // Paramètres de la route (équivalent de useSearchParams)
  const params = useLocalSearchParams();
  const keyword = first(params.keyword);
  const category = first(params.category);
  const minPrice = first(params.min);
  const maxPrice = first(params.max);
  const page = first(params.page);

  // Remonter en haut de la liste à chaque changement de page
  useEffect(() => {
    flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
  }, [page]);

  // Récapitulatif des filtres appliqués
  const filterSummary = useMemo(() => {
    try {
      const summary = [];

      if (keyword) summary.push(`Recherche: "${keyword}"`);
      if (category) {
        const categoryName = categories?.find((c) => c._id === category)?.name;
        if (categoryName) summary.push(`Catégorie: ${categoryName}`);
      }
      if (minPrice && maxPrice)
        summary.push(`Prix: ${minPrice}€ - ${maxPrice}€`);
      else if (minPrice) summary.push(`Prix min: ${minPrice}€`);
      else if (maxPrice) summary.push(`Prix max: ${maxPrice}€`);

      if (page) summary.push(`Page: ${page || 1}`);

      return summary.length > 0 ? summary.join(" | ") : null;
    } catch (err) {
      console.error("getFilterSummary error:", err.message);
      return null;
    }
  }, [keyword, category, minPrice, maxPrice, page, categories]);

  // Réinitialiser les filtres
  const handleResetFilters = useCallback(() => {
    router.setParams({
      keyword: undefined,
      category: undefined,
      min: undefined,
      max: undefined,
      page: undefined,
    });
  }, [router]);

  const hasValidData = data && typeof data === "object";
  const hasValidCategories = categories && Array.isArray(categories);

  if (!hasValidData) {
    return (
      <View className="m-4 rounded-md border border-yellow-200 bg-yellow-50 p-4">
        <Text className="font-medium text-yellow-700">
          Les données des produits ne sont pas disponibles pour le moment.
        </Text>
      </View>
    );
  }

  const products = Array.isArray(data.products) ? data.products : [];

  // Éléments (et non fonctions) pour que l'état des filtres ne soit pas réinitialisé
  const header = (
    <View>
      {hasValidCategories ? (
        <Filters categories={categories} />
      ) : (
        <View className="mb-4 rounded-md bg-gray-100 p-4">
          <Text>Chargement des filtres...</Text>
        </View>
      )}

      {filterSummary && (
        <View className="mb-4 rounded-lg border border-blue-100 bg-blue-50 p-3">
          <Text className="text-sm font-medium text-blue-800">
            {filterSummary}
          </Text>
        </View>
      )}

      <View className="mb-4">
        <Text className="text-xl font-bold text-gray-800">
          {products.length > 0
            ? `${products.length} produit${products.length > 1 ? "s" : ""} trouvé${
                products.length > 1 ? "s" : ""
              }`
            : "Produits"}
        </Text>
      </View>
    </View>
  );

  const empty = loading ? (
    <View className="items-center py-10">
      <ActivityIndicator size="large" color="#2563eb" />
    </View>
  ) : (
    <View className="items-center justify-center py-10">
      <Text className="mb-2 text-xl font-semibold text-gray-800">
        Aucun produit trouvé
      </Text>
      <Text className="text-center text-gray-600">
        {keyword
          ? `Aucun résultat pour "${keyword}". Essayez d'autres termes de recherche.`
          : "Aucun produit ne correspond aux filtres sélectionnés. Essayez de modifier vos critères."}
      </Text>
      <Pressable
        onPress={handleResetFilters}
        className="mt-6 rounded-md bg-blue-600 px-4 py-2 active:bg-blue-700"
        accessibilityLabel="Voir tous les produits disponibles"
      >
        <Text className="text-white">Voir tous les produits</Text>
      </Pressable>
    </View>
  );

  const footer =
    !loading && data.totalPages > 1 ? (
      <View className="mt-4">
        <CustomPagination totalPages={data.totalPages} />
      </View>
    ) : null;

  return (
    <FlatList
      ref={flatListRef}
      data={loading ? [] : products}
      keyExtractor={(item, index) => item?._id || `product-${index}`}
      renderItem={({ item }) => <ProductItem product={item} user={user} />}
      ListHeaderComponent={header}
      ListEmptyComponent={empty}
      ListFooterComponent={footer}
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{ padding: 16 }}
    />
  );
};

export default ListProducts;

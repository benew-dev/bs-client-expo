// components/layouts/Filters.js
// Équivalent mobile de Filters.jsx (variante mobile : panneau repliable).
// La recherche par mot-clé est dans le Header global, elle n'est donc pas répétée ici.

import { useEffect, useMemo, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { showToast } from "../../lib/toast";

const first = (value) => (Array.isArray(value) ? value[0] : value);

const Filters = ({ categories }) => {
  const router = useRouter();
  const params = useLocalSearchParams();

  const paramMin = first(params.min) || "";
  const paramMax = first(params.max) || "";
  const currentCategory = first(params.category) || "";
  const currentKeyword = first(params.keyword) || "";

  // État local synchronisé avec les paramètres de la route
  const [min, setMin] = useState(paramMin);
  const [max, setMax] = useState(paramMax);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setMin(paramMin);
    setMax(paramMax);
  }, [paramMin, paramMax]);

  // Validation des prix
  const validatePrices = () => {
    if (min === "" && max === "") {
      throw new Error(
        "Veuillez renseigner au moins un des deux champs de prix",
      );
    }

    if (min !== "" && max !== "") {
      const minNum = Number(min);
      const maxNum = Number(max);

      if (isNaN(minNum) || isNaN(maxNum)) {
        throw new Error("Les valeurs de prix doivent être des nombres valides");
      }

      if (minNum > maxNum) {
        throw new Error("Le prix minimum doit être inférieur au prix maximum");
      }
    }
  };

  // Clic sur une catégorie (la même catégorie une 2e fois la désélectionne)
  const handleCategoryClick = (categoryId) => {
    try {
      router.setParams({
        category: currentCategory === categoryId ? undefined : categoryId,
      });
      setOpen(false);
    } catch (error) {
      console.error("Erreur lors de la sélection de catégorie:", error);
      showToast("Une erreur est survenue lors du filtrage par catégorie");
    }
  };

  // Appliquer les filtres de prix
  const handlePriceFilter = () => {
    try {
      validatePrices();

      router.setParams({
        min: min !== "" ? String(min) : undefined,
        max: max !== "" ? String(max) : undefined,
      });
      setOpen(false);
    } catch (error) {
      showToast(
        error.message || "Une erreur est survenue avec les filtres de prix",
      );
    }
  };

  // Réinitialiser tous les filtres (y compris le mot-clé)
  const resetFilters = () => {
    setMin("");
    setMax("");
    router.setParams({
      keyword: undefined,
      category: undefined,
      min: undefined,
      max: undefined,
      page: undefined,
    });
    setOpen(false);
  };

  const hasActiveFilters = useMemo(
    () => min || max || currentCategory || currentKeyword,
    [min, max, currentCategory, currentKeyword],
  );

  const hasCategories = Array.isArray(categories) && categories.length > 0;

  return (
    <View className="mb-4">
      <Pressable
        onPress={() => setOpen((prev) => !prev)}
        accessibilityState={{ expanded: open }}
        className="flex-row items-center justify-between rounded-md border border-gray-200 bg-white px-4 py-2"
      >
        <Text className="font-medium text-gray-700">Filtres</Text>
        <Ionicons
          name={open ? "chevron-up" : "chevron-down"}
          size={20}
          color="#6b7280"
        />
      </Pressable>

      {open && (
        <View className="mt-4">
          {/* Prix */}
          <View className="mb-4 rounded-lg border border-gray-200 bg-white p-4">
            <Text className="mb-3 font-semibold text-gray-700">Prix (Fdj)</Text>
            <View className="mb-3 flex-row gap-2">
              <View className="flex-1">
                <Text className="mb-1 text-xs text-gray-500">Min</Text>
                <TextInput
                  className="rounded-md border border-gray-200 bg-gray-100 px-3 py-2 text-gray-900"
                  keyboardType="numeric"
                  placeholder="Min"
                  placeholderTextColor="#9ca3af"
                  value={min}
                  onChangeText={setMin}
                  accessibilityLabel="Prix minimum"
                />
              </View>
              <View className="flex-1">
                <Text className="mb-1 text-xs text-gray-500">Max</Text>
                <TextInput
                  className="rounded-md border border-gray-200 bg-gray-100 px-3 py-2 text-gray-900"
                  keyboardType="numeric"
                  placeholder="Max"
                  placeholderTextColor="#9ca3af"
                  value={max}
                  onChangeText={setMax}
                  accessibilityLabel="Prix maximum"
                />
              </View>
            </View>

            <Pressable
              onPress={handlePriceFilter}
              accessibilityLabel="Appliquer les filtres de prix"
              className="items-center rounded-md bg-blue-600 px-4 py-2 active:bg-blue-700"
            >
              <Text className="text-white">Appliquer</Text>
            </Pressable>
          </View>

          {/* Catégories */}
          <View className="mb-4 rounded-lg border border-gray-200 bg-white p-4">
            <Text className="mb-3 font-semibold text-gray-700">Catégories</Text>

            {!hasCategories ? (
              <View className="items-center py-2">
                <Text className="text-gray-500">
                  Aucune catégorie disponible
                </Text>
              </View>
            ) : (
              categories.map((category) => {
                const selected = currentCategory === category?._id;
                return (
                  <Pressable
                    key={category?._id}
                    onPress={() => handleCategoryClick(category?._id)}
                    accessibilityState={{ selected }}
                    className={`mb-2 rounded-md p-2 ${
                      selected ? "bg-blue-100" : "active:bg-gray-100"
                    }`}
                  >
                    <Text
                      className={selected ? "text-blue-700" : "text-gray-700"}
                    >
                      {category?.name}
                    </Text>
                  </Pressable>
                );
              })
            )}
          </View>

          {/* Réinitialiser */}
          {hasActiveFilters && (
            <Pressable
              onPress={resetFilters}
              accessibilityLabel="Réinitialiser tous les filtres"
              className="items-center rounded-md border border-red-200 py-2 active:bg-red-50"
            >
              <Text className="text-sm text-red-600">
                Réinitialiser les filtres
              </Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
};

export default Filters;

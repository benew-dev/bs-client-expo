// components/layouts/CustomPagination.js
// Équivalent mobile de CustomPagination.jsx (react-responsive-pagination est une
// librairie web) : « ‹ 1 … 4 5 6 … 10 › ».

import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

const first = (value) => (Array.isArray(value) ? value[0] : value);

// Page 1, dernière page, page courante et ses voisines, avec des "…"
const getPageItems = (current, total) => {
  const pages = [...new Set([1, total, current - 1, current, current + 1])]
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);

  const items = [];
  pages.forEach((page, index) => {
    if (index > 0 && page - pages[index - 1] > 1) {
      items.push({ type: "gap", key: `gap-${page}` });
    }
    items.push({ type: "page", key: `page-${page}`, value: page });
  });
  return items;
};

const CustomPagination = memo(({ totalPages = 1 }) => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [targetPage, setTargetPage] = useState(null);
  const isNavigating = targetPage !== null;

  const pageParam = first(params.page);

  // Page actuelle de manière sécurisée
  const currentPage = useMemo(() => {
    if (!pageParam) return 1;
    const parsed = parseInt(pageParam, 10);
    if (isNaN(parsed) || parsed < 1) return 1;
    return Math.min(parsed, Math.max(1, totalPages));
  }, [pageParam, totalPages]);

  // Fin de navigation quand le paramètre de page change
  useEffect(() => {
    setTargetPage(null);
  }, [pageParam]);

  const handlePageChange = useCallback(
    (newPage) => {
      if (isNavigating) return;
      if (newPage === currentPage) return;
      if (newPage < 1 || newPage > totalPages) return;

      setTargetPage(newPage);
      // Page 1 : on supprime le paramètre (plus propre)
      router.setParams({ page: newPage === 1 ? undefined : String(newPage) });
    },
    [currentPage, isNavigating, router, totalPages],
  );

  if (totalPages <= 1) {
    return null;
  }

  if (isNavigating) {
    return (
      <View className="mt-8 flex-row items-center justify-center">
        <ActivityIndicator size="small" color="#2563eb" />
        <Text className="ml-3 text-gray-600">
          Chargement de la page {targetPage}...
        </Text>
      </View>
    );
  }

  const canGoPrevious = currentPage > 1;
  const canGoNext = currentPage < totalPages;

  return (
    <View className="mt-8 flex-row items-center justify-center">
      <Pressable
        disabled={!canGoPrevious}
        onPress={() => handlePageChange(currentPage - 1)}
        accessibilityLabel="Page précédente"
        className="mx-1 h-10 min-w-10 items-center justify-center rounded-md border border-gray-200 bg-white px-3"
      >
        <Text className={canGoPrevious ? "text-blue-600" : "text-gray-300"}>
          «
        </Text>
      </Pressable>

      {getPageItems(currentPage, totalPages).map((item) =>
        item.type === "gap" ? (
          <Text key={item.key} className="mx-1 text-gray-500">
            …
          </Text>
        ) : (
          <Pressable
            key={item.key}
            onPress={() => handlePageChange(item.value)}
            accessibilityLabel={`Page ${item.value}`}
            accessibilityState={{ selected: item.value === currentPage }}
            className={`mx-1 h-10 min-w-10 items-center justify-center rounded-md border px-3 ${
              item.value === currentPage
                ? "border-blue-600 bg-blue-600"
                : "border-gray-200 bg-white"
            }`}
          >
            <Text
              className={
                item.value === currentPage ? "text-white" : "text-blue-600"
              }
            >
              {item.value}
            </Text>
          </Pressable>
        ),
      )}

      <Pressable
        disabled={!canGoNext}
        onPress={() => handlePageChange(currentPage + 1)}
        accessibilityLabel="Page suivante"
        className="mx-1 h-10 min-w-10 items-center justify-center rounded-md border border-gray-200 bg-white px-3"
      >
        <Text className={canGoNext ? "text-blue-600" : "text-gray-300"}>»</Text>
      </Pressable>
    </View>
  );
});

CustomPagination.displayName = "CustomPagination";

export default CustomPagination;
